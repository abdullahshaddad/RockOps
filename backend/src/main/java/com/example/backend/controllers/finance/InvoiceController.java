package com.example.backend.controllers.finance;

import com.example.backend.dto.finance.InvoiceDTO;
import com.example.backend.models.finance.PaymentStatus;
import com.example.backend.services.finance.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // Get all unpaid invoices (MAIN FEATURE for payment processing!)
    @GetMapping("/unpaid")
    public ResponseEntity<List<InvoiceDTO>> getUnpaidInvoices() {
        try {
            List<InvoiceDTO> invoices = invoiceService.getUnpaidInvoices();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get invoice by ID
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable UUID id) {
        try {
            Optional<InvoiceDTO> invoice = invoiceService.getInvoiceById(id);
            return invoice.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get invoice by invoice number
    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<InvoiceDTO> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        try {
            Optional<InvoiceDTO> invoice = invoiceService.getInvoiceByInvoiceNumber(invoiceNumber);
            return invoice.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get invoices by payment status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByPaymentStatus(@PathVariable PaymentStatus status) {
        try {
            List<InvoiceDTO> invoices = invoiceService.getInvoicesByPaymentStatus(status);
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get overdue invoices
    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceDTO>> getOverdueInvoices() {
        try {
            List<InvoiceDTO> invoices = invoiceService.getOverdueInvoices();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search invoices by vendor name
    @GetMapping("/search")
    public ResponseEntity<List<InvoiceDTO>> searchInvoicesByVendor(@RequestParam String vendor) {
        try {
            List<InvoiceDTO> invoices = invoiceService.searchInvoicesByVendor(vendor);
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get invoices by date range
    @GetMapping("/date-range")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<InvoiceDTO> invoices = invoiceService.getInvoicesByDateRange(startDate, endDate);
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Check if invoice can accept payment
    @GetMapping("/{id}/can-accept-payment")
    public ResponseEntity<Boolean> canAcceptPayment(@PathVariable UUID id) {
        try {
            boolean canAccept = invoiceService.canAcceptPayment(id);
            return ResponseEntity.ok(canAccept);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}