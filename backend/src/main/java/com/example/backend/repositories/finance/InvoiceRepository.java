package com.example.backend.repositories.equipment.finance;

import com.example.backend.models.finance.Invoice;
import com.example.backend.models.finance.InvoiceStatus;
import com.example.backend.models.finance.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    // Find all unpaid invoices (for payment processing)
    List<Invoice> findByPaymentStatusOrderByDueDateAsc(PaymentStatus paymentStatus);

    // Find unpaid or partially paid invoices
    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus IN ('UNPAID', 'PARTIALLY_PAID') ORDER BY i.dueDate ASC")
    List<Invoice> findUnpaidAndPartiallyPaidInvoices();

    // Find invoices by vendor
    List<Invoice> findByVendorNameContainingIgnoreCaseOrderByInvoiceDateDesc(String vendorName);

    // Find overdue invoices (unpaid and past due date)
    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus != 'FULLY_PAID' AND i.dueDate < :currentDate ORDER BY i.dueDate ASC")
    List<Invoice> findOverdueInvoices(@Param("currentDate") LocalDate currentDate);

    // Find invoices within date range
    List<Invoice> findByInvoiceDateBetween(LocalDate startDate, LocalDate endDate);

    // Calculate total outstanding amount
    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM Invoice i WHERE i.paymentStatus != 'FULLY_PAID'")
    BigDecimal getTotalOutstandingAmount();

    // Find invoices by payment status and date range
    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus = :status AND i.invoiceDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByPaymentStatusAndDateRange(@Param("status") PaymentStatus status,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    // Check if invoice number already exists
    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByStatus(InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.merchant.id = :merchantId")
    List<Invoice> findByMerchantId(@Param("merchantId") UUID merchantId);

    @Query("SELECT i FROM Invoice i WHERE i.site.id = :siteId")
    List<Invoice> findBySiteId(@Param("siteId") UUID siteId);


    @Query("SELECT i FROM Invoice i WHERE " +
            "(:invoiceNumber IS NULL OR i.invoiceNumber LIKE %:invoiceNumber%) AND " +
            "(:merchantId IS NULL OR i.merchant.id = :merchantId) AND " +
            "(:siteId IS NULL OR i.site.id = :siteId) AND " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(:startDate IS NULL OR i.invoiceDate >= :startDate) AND " +
            "(:endDate IS NULL OR i.invoiceDate <= :endDate)")
    Page<Invoice> searchInvoices(
            @Param("invoiceNumber") String invoiceNumber,
            @Param("merchantId") UUID merchantId,
            @Param("siteId") UUID siteId,
            @Param("status") InvoiceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
}