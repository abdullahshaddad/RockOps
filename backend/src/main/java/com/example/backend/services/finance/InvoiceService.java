package com.example.backend.services.finance;

import com.example.backend.dto.finance.InvoiceDTO;
import com.example.backend.services.finance.equipment.finance.models.finance.Invoice;
import com.example.backend.services.finance.equipment.finance.models.finance.PaymentStatus;
import com.example.backend.services.finance.equipment.finance.InvoiceRepository;
import com.example.backend.services.finance.equipment.finance.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // Get all unpaid invoices (main feature for payment processing!)
    public List<InvoiceDTO> getUnpaidInvoices() {
        return invoiceRepository.findUnpaidAndPartiallyPaidInvoices()
                .stream()
                .map(this::convertToPaymentSummaryDTO)
                .collect(Collectors.toList());
    }

    // Get invoice by ID
    public Optional<InvoiceDTO> getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .map(this::convertToPaymentSummaryDTO);
    }

    // Get invoice entity by ID (for internal use)
    public Optional<Invoice> getInvoiceEntityById(UUID id) {
        return invoiceRepository.findById(id);
    }

    // Get invoices by payment status
    public List<InvoiceDTO> getInvoicesByPaymentStatus(PaymentStatus status) {
        return invoiceRepository.findByPaymentStatusOrderByDueDateAsc(status)
                .stream()
                .map(this::convertToPaymentSummaryDTO)
                .collect(Collectors.toList());
    }

    // Get overdue invoices
    public List<InvoiceDTO> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now())
                .stream()
                .map(this::convertToPaymentSummaryDTO)
                .collect(Collectors.toList());
    }

    // Search invoices by vendor name
    public List<InvoiceDTO> searchInvoicesByVendor(String vendorName) {
        return invoiceRepository.findByVendorNameContainingIgnoreCaseOrderByInvoiceDateDesc(vendorName)
                .stream()
                .map(this::convertToPaymentSummaryDTO)
                .collect(Collectors.toList());
    }

    // Get invoices by date range
    public List<InvoiceDTO> getInvoicesByDateRange(LocalDate startDate, LocalDate endDate) {
        return invoiceRepository.findByInvoiceDateBetween(startDate, endDate)
                .stream()
                .map(this::convertToPaymentSummaryDTO)
                .collect(Collectors.toList());
    }

    // Get invoice by invoice number
    public Optional<InvoiceDTO> getInvoiceByInvoiceNumber(String invoiceNumber) {
        return invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(this::convertToPaymentSummaryDTO);
    }

    // Check if invoice can accept payment
    public boolean canAcceptPayment(UUID invoiceId) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if (invoice.isPresent()) {
            PaymentStatus status = invoice.get().getPaymentStatus();
            return status == PaymentStatus.UNPAID || status == PaymentStatus.PARTIALLY_PAID;
        }
        return false;
    }

    // Convert Invoice entity to InvoicePaymentSummaryDTO
    private InvoiceDTO convertToPaymentSummaryDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setVendorName(invoice.getVendorName());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaidAmount(invoice.getPaidAmount());
        dto.setRemainingBalance(invoice.getRemainingBalance());
        dto.setPaymentStatus(invoice.getPaymentStatus());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());

        // Count number of payments
        Long paymentCount = paymentRepository.countPaymentsByInvoiceId(invoice.getId());
        dto.setPaymentCount(paymentCount.intValue());

        return dto;
    }
}