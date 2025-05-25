package com.example.backend.services.finance;

import com.example.backend.dto.finance.PaymentRequestDTO;
import com.example.backend.dto.finance.PaymentResponseDTO;
import com.example.backend.services.finance.equipment.finance.models.finance.Invoice;
import com.example.backend.services.finance.equipment.finance.models.finance.Payment;
import com.example.backend.services.finance.equipment.finance.models.finance.PaymentMethod;
import com.example.backend.services.finance.equipment.finance.models.finance.PaymentStatus;
import com.example.backend.services.finance.equipment.finance.InvoiceRepository;
import com.example.backend.services.finance.equipment.finance.PaymentMethodRepository;
import com.example.backend.services.finance.equipment.finance.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    // Create a new payment (main feature!)
    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO paymentRequest) {
        // 1. Get the invoice
        Invoice invoice = invoiceRepository.findById(paymentRequest.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + paymentRequest.getInvoiceId()));

        // 2. Get the payment method
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentRequest.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + paymentRequest.getPaymentMethodId()));

        // 3. Validate payment amount
        BigDecimal remainingBalance = invoice.getRemainingBalance();
        if (paymentRequest.getAmount().compareTo(remainingBalance) > 0) {
            throw new RuntimeException("Payment amount (" + paymentRequest.getAmount() +
                    ") cannot exceed remaining balance (" + remainingBalance + ")");
        }

        if (paymentRequest.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        // 4. Create payment record
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentDate(paymentRequest.getPaymentDate());
        payment.setReferenceNumber(paymentRequest.getReferenceNumber());
        payment.setPaymentMethod(paymentMethod);
        payment.setNotes(paymentRequest.getNotes());
        payment.setCreatedBy(paymentRequest.getCreatedBy());

        Payment savedPayment = paymentRepository.save(payment);

        // 5. Update invoice payment status
        updateInvoicePaymentStatus(invoice.getId());

        return convertToResponseDTO(savedPayment);
    }

    // Get all payments for an invoice
    public List<PaymentResponseDTO> getPaymentsByInvoiceId(UUID invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get payment by ID
    public Optional<PaymentResponseDTO> getPaymentById(UUID id) {
        return paymentRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    // Get recent payments (last 30 days)
    public List<PaymentResponseDTO> getRecentPayments() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        return paymentRepository.findRecentPayments(thirtyDaysAgo)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Get payments by date range
    public List<PaymentResponseDTO> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Update invoice payment status after payment
    @Transactional
    public void updateInvoicePaymentStatus(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));

        // Calculate total payments
        BigDecimal totalPayments = paymentRepository.getTotalPaymentsForInvoice(invoiceId);
        invoice.setPaidAmount(totalPayments);

        // Update payment status
        if (totalPayments.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        } else if (totalPayments.compareTo(invoice.getTotalAmount()) < 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        } else if (totalPayments.compareTo(invoice.getTotalAmount()) == 0) {
            invoice.setPaymentStatus(PaymentStatus.FULLY_PAID);
        } else {
            invoice.setPaymentStatus(PaymentStatus.OVERPAID);
        }

        invoiceRepository.save(invoice);
    }

    // Convert Payment entity to PaymentResponseDTO
    private PaymentResponseDTO convertToResponseDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(payment.getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setReferenceNumber(payment.getReferenceNumber());
        dto.setNotes(payment.getNotes());
        dto.setCreatedBy(payment.getCreatedBy());
        dto.setCreatedAt(payment.getCreatedAt());

        // Invoice information
        dto.setInvoiceId(payment.getInvoice().getId());
        dto.setInvoiceNumber(payment.getInvoice().getInvoiceNumber());
        dto.setVendorName(payment.getInvoice().getVendorName());

        // Payment method information
        dto.setPaymentMethodId(payment.getPaymentMethod().getId());
        dto.setPaymentMethodName(payment.getPaymentMethod().getName());

        return dto;
    }
}
