package com.example.backend.controllers.procurement;


import com.example.backend.models.procurement.Offer;
import com.example.backend.models.procurement.PurchaseOrder;
import com.example.backend.services.procurement.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @PostMapping("/offers/{offerId}/finalize")
    public ResponseEntity<?> finalizeOffer(
            @PathVariable UUID offerId,
            @RequestBody Map<String, List<UUID>> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Extract list of finalized item IDs from request body
            List<UUID> finalizedItemIds = requestBody.get("finalizedItemIds");
            if (finalizedItemIds == null || finalizedItemIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "No finalized items provided",
                        "success", false
                ));
            }

            // Get username from authenticated user
            String username = userDetails.getUsername();

            // Call service to finalize offer and create purchase order
            PurchaseOrder purchaseOrder = purchaseOrderService.finalizeOfferAndCreatePurchaseOrder(
                    offerId, finalizedItemIds, username);

            // Create response with purchase order
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Offer finalized successfully. Purchase order created.");
            response.put("success", true);
            response.put("purchaseOrder", purchaseOrder);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException | IllegalStateException e) {
            // Handle validation errors
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Error finalizing offer: " + e.getMessage(),
                    "success", false
            ));

        } catch (Exception e) {
            // Handle unexpected errors
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Unexpected error: " + e.getMessage(),
                    "success", false
            ));
        }
    }
}