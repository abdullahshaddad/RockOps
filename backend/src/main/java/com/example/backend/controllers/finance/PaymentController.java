package com.example.backend.controllers;

import com.example.backend.dto.PaymentRequestDTO;
import com.example.backend.dto.PaymentResponseDTO;
import com.example.backend.services.PaymentService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Create a new payment (MAIN FEATURE!)
    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody PaymentRequestDTO paymentRequest) {
        try {
            PaymentResponseDTO createdPayment = paymentService.createPayment(paymentRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the payment");
        }
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable UUID id) {
        try {
            Optional<PaymentResponseDTO> payment = paymentService.getPaymentById(id);
            return payment.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all payments for a specific invoice
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByInvoiceId(@PathVariable UUID invoiceId) {
        try {
            List<PaymentResponseDTO> payments = paymentService.getPaymentsByInvoiceId(invoiceId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get recent payments (last 30 days)
    @GetMapping("/recent")
    public ResponseEntity<List<PaymentResponseDTO>> getRecentPayments() {
        try {
            List<PaymentResponseDTO> payments = paymentService.getRecentPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get payments by date range
    @GetMapping("/date-range")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<PaymentResponseDTO> payments = paymentService.getPaymentsByDateRange(startDate, endDate);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}