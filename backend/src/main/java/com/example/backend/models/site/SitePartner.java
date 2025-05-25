package com.example.backend.models.site;

import com.example.backend.models.Partner;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "site_partner")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SitePartner {

    @EmbeddedId
    private SitePartnerId id;

    @ManyToOne
    @MapsId("siteId")
    @JoinColumn(name = "site_id")
    private Site site;

    @ManyToOne
    @MapsId("partnerId")
    @JoinColumn(name = "partner_id")
    private Partner partner;

    private Double percentage;
}