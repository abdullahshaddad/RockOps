package com.example.Rock4Mining.controllers;

import com.example.Rock4Mining.models.Offer;
import com.example.Rock4Mining.models.OfferItem;
import com.example.Rock4Mining.models.PurchaseOrder;
import com.example.Rock4Mining.services.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/purchaseOrders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @Autowired
    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    /**
     * Get all offers pending finance review
     */
    @GetMapping("/pending-offers")
    public ResponseEntity<List<Offer>> getPendingOffers() {
        try {
            List<Offer> pendingOffers = purchaseOrderService.getOffersPendingFinanceReview();
            return ResponseEntity.ok(pendingOffers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an offer item's finance status (accept or reject)
     */


    /**
     * Complete finance review for an offer
     */


    /**
     * Get all finance-completed offers
     */


    /**
     * Get purchase order for an offer
     */
    @GetMapping("/offers/{offerId}/purchase-order")
    public ResponseEntity<?> getPurchaseOrderForOffer(@PathVariable UUID offerId) {
        try {
            PurchaseOrder purchaseOrder = purchaseOrderService.getPurchaseOrderByOffer(offerId);

            if (purchaseOrder != null) {
                return ResponseEntity.ok(purchaseOrder);
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching purchase order: " + e.getMessage());
        }
    }

    /**
     * Get all purchase orders
     */
    @GetMapping()
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        try {
            List<PurchaseOrder> purchaseOrders = purchaseOrderService.getAllPurchaseOrders();
            return ResponseEntity.ok(purchaseOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get purchase order by ID
     */
    @GetMapping("/purchase-orders/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable UUID id) {
        try {
            PurchaseOrder purchaseOrder = purchaseOrderService.getPurchaseOrderById(id);
            return ResponseEntity.ok(purchaseOrder);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update purchase order status
     */
    @PutMapping("/purchase-orders/{id}/status")
    public ResponseEntity<?> updatePurchaseOrderStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            PurchaseOrder updatedPO = purchaseOrderService.updatePurchaseOrderStatus(
                    id, status, userDetails.getUsername());
            return ResponseEntity.ok(updatedPO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating purchase order status: " + e.getMessage());
        }
    }
}