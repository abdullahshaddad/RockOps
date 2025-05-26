package com.example.backend.repositories;

import com.example.backend.models.Offer;
import com.example.backend.models.RequestOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    List<Offer> findByRequestOrder(RequestOrder requestOrder);
    List<Offer> findByStatus(String status);

    List<Offer> findByFinanceStatus(String financeStatus);
}
