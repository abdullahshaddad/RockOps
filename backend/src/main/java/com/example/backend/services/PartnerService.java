package com.example.Rock4Mining.services;

import com.example.Rock4Mining.models.Partner;
import com.example.Rock4Mining.repositories.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartnerService
{
    private PartnerRepository partnerRepository;

    @Autowired
    public PartnerService(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    public List<Partner> getAllPartners()
    {
        return partnerRepository.findAll();
    }

    public Partner savePartner(Partner partner)
    {
        return partnerRepository.save(partner);
    }
}