package com.example.backend.repositories.equipment.finance;

import com.example.backend.models.finance.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    // Find all payments for a specific invoice
    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(UUID invoiceId);

    // Find all payments by payment method
    List<Payment> findByPaymentMethodId(UUID paymentMethodId);

    // Find payments within a date range
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);

    // Find payments by reference number (useful for check numbers)
    List<Payment> findByReferenceNumber(String referenceNumber);

    // Calculate total payments for an invoice
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.id = :invoiceId")
    BigDecimal getTotalPaymentsForInvoice(@Param("invoiceId") UUID invoiceId);

    // Find recent payments (last 30 days)
    @Query("SELECT p FROM Payment p WHERE p.paymentDate >= :date ORDER BY p.paymentDate DESC")
    List<Payment> findRecentPayments(@Param("date") LocalDate date);

    // Find payments by created by user
    List<Payment> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    // Count payments for an invoice
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.invoice.id = :invoiceId")
    Long countPaymentsByInvoiceId(@Param("invoiceId") UUID invoiceId);
}