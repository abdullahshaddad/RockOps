package com.example.Rock4Mining.services;

import com.example.Rock4Mining.models.*;
import com.example.Rock4Mining.repositories.OfferItemRepository;
import com.example.Rock4Mining.repositories.OfferRepository;
import com.example.Rock4Mining.repositories.PurchaseOrderItemRepository;
import com.example.Rock4Mining.repositories.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final OfferRepository offerRepository;
    private final OfferItemRepository offerItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    @Autowired
    public PurchaseOrderService(
            OfferRepository offerRepository,
            OfferItemRepository offerItemRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseOrderItemRepository purchaseOrderItemRepository) {
        this.offerRepository = offerRepository;
        this.offerItemRepository = offerItemRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
    }

    /**
     * Update status of an individual offer item (accept or reject)
     */


    /**
     * Complete finance review for an offer
     */


    /**
     * Create a purchase order from accepted items in an offer
     */
    /**
     * Create a purchase order from accepted items in an offer
     */


    /**
     * Get offers that have been completely processed by finance
     */

    /**
     * Get all offers pending finance review
     */
    public List<Offer> getOffersPendingFinanceReview() {
        return offerRepository.findByStatus("ACCEPTED")
                .stream()
                .filter(offer ->
                        offer.getFinanceStatus() == null ||
                                "PENDING_FINANCE_REVIEW".equals(offer.getFinanceStatus()) ||
                                "FINANCE_IN_PROGRESS".equals(offer.getFinanceStatus())
                )
                .collect(Collectors.toList());
    }

    /**
     * Get purchase order by offer ID
     */
    public PurchaseOrder getPurchaseOrderByOffer(UUID offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        // Use a custom query method or manual search
        List<PurchaseOrder> allPOs = purchaseOrderRepository.findAll();
        Optional<PurchaseOrder> matchingPO = allPOs.stream()
                .filter(po -> po.getOffer() != null && po.getOffer().getId().equals(offer.getId()))
                .findFirst();

        return matchingPO.orElse(null);
    }

    /**
     * Get all purchase orders
     */
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    /**
     * Get purchase order by ID
     */
    public PurchaseOrder getPurchaseOrderById(UUID id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
    }

    /**
     * Update purchase order status
     */
    @Transactional
    public PurchaseOrder updatePurchaseOrderStatus(UUID id, String status, String username) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        po.setStatus(status);
        po.setUpdatedAt(LocalDateTime.now());

        if ("APPROVED".equals(status)) {
            po.setApprovedBy(username);
            po.setFinanceApprovalDate(LocalDateTime.now());
        }

        return purchaseOrderRepository.save(po);
    }
}