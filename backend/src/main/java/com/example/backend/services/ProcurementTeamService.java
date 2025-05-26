package com.example.backend.services;

import com.example.backend.models.merchant.Merchant;
import com.example.backend.models.merchant.MerchantType;
import com.example.backend.models.site.Site;
import com.example.backend.models.warehouse.ItemCategory;
import com.example.backend.repositories.merchant.MerchantRepository;
import com.example.backend.repositories.site.SiteRepository;
import com.example.backend.repositories.warehouse.ItemCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProcurementTeamService {

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private ItemCategoryRepository itemCategoryRepository;

    public Merchant addMerchant(Map<String, Object> merchantData) {
        try {
            System.out.println("Step 1: Extracting required fields...");

            // Required fields
            String name = (String) merchantData.get("name");
            System.out.println("Name: " + name);

            MerchantType merchantType = MerchantType.valueOf(((String) merchantData.get("merchantType")).toUpperCase());
            System.out.println("Merchant Type: " + merchantType);

            // Optional fields
            String contactEmail = (String) merchantData.get("contactEmail");
            String contactPhone = (String) merchantData.get("contactPhone");
            String contactSecondPhone = (String) merchantData.get("contactSecondPhone");
            String contactPersonName = (String) merchantData.get("contactPersonName");
            String address = (String) merchantData.get("address");
            String preferredPaymentMethod = (String) merchantData.get("preferredPaymentMethod");
            String taxIdentificationNumber = (String) merchantData.get("taxIdentificationNumber");
            Double reliabilityScore = merchantData.get("reliabilityScore") != null ? Double.valueOf(merchantData.get("reliabilityScore").toString()) : null;
            Double averageDeliveryTime = merchantData.get("averageDeliveryTime") != null ? Double.valueOf(merchantData.get("averageDeliveryTime").toString()) : null;

            Date lastOrderDate = null;
            if (merchantData.get("lastOrderDate") != null) {
                lastOrderDate = new Date(Long.parseLong(merchantData.get("lastOrderDate").toString())); // assuming timestamp in millis
            }

            String notes = (String) merchantData.get("notes");

            // Resolve site
            Site site = null;
            if (merchantData.containsKey("siteId")) {
                System.out.println("Step 2: Resolving site...");
                site = siteRepository.findById(UUID.fromString((String) merchantData.get("siteId")))
                        .orElse(null);
            }

            // Resolve item categories
            List<ItemCategory> categories = new ArrayList<>();
            if (merchantData.containsKey("itemCategoryIds")) {
                System.out.println("Step 3: Resolving item categories...");
                String[] categoryIds = ((String) merchantData.get("itemCategoryIds")).split(",");
                for (String id : categoryIds) {
                    UUID uuid = UUID.fromString(id.trim());
                    itemCategoryRepository.findById(uuid).ifPresent(categories::add);
                    System.out.println(itemCategoryRepository.findById(uuid).get().getName());
                }
            }

            // Build and save merchant
            System.out.println("Step 4: Building and saving merchant...");

            Merchant merchant = Merchant.builder()
                    .name(name)
                    .merchantType(merchantType)
                    .contactEmail(contactEmail)
                    .contactPhone(contactPhone)
                    .contactSecondPhone(contactSecondPhone)
                    .contactPersonName(contactPersonName)
                    .address(address)
                    .preferredPaymentMethod(preferredPaymentMethod)
                    .taxIdentificationNumber(taxIdentificationNumber)
                    .reliabilityScore(reliabilityScore)
                    .averageDeliveryTime(averageDeliveryTime)
                    .lastOrderDate(lastOrderDate)
                    .notes(notes)
                    .site(site)
                    .itemCategories(categories)
                    .build();

            Merchant saved = merchantRepository.save(merchant);
            System.out.println("Merchant saved with ID: " + saved.getId());
            return saved;

        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create merchant: " + e.getMessage(), e);
        }
    }
    public Merchant updateMerchant(UUID id, Map<String, Object> merchantData) {
        try {
            System.out.println("Updating merchant with ID: " + id);

            Merchant merchant = merchantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Merchant not found with ID: " + id));

            // Required fields
            if (merchantData.containsKey("name")) {
                merchant.setName((String) merchantData.get("name"));
            }

            if (merchantData.containsKey("merchantType")) {
                MerchantType merchantType = MerchantType.valueOf(((String) merchantData.get("merchantType")).toUpperCase());
                merchant.setMerchantType(merchantType);
            }

            // Optional fields
            if (merchantData.containsKey("contactEmail")) {
                merchant.setContactEmail((String) merchantData.get("contactEmail"));
            }
            if (merchantData.containsKey("contactPhone")) {
                merchant.setContactPhone((String) merchantData.get("contactPhone"));
            }
            if (merchantData.containsKey("contactSecondPhone")) {
                merchant.setContactSecondPhone((String) merchantData.get("contactSecondPhone"));
            }
            if (merchantData.containsKey("contactPersonName")) {
                merchant.setContactPersonName((String) merchantData.get("contactPersonName"));
            }
            if (merchantData.containsKey("address")) {
                merchant.setAddress((String) merchantData.get("address"));
            }
            if (merchantData.containsKey("preferredPaymentMethod")) {
                merchant.setPreferredPaymentMethod((String) merchantData.get("preferredPaymentMethod"));
            }
            if (merchantData.containsKey("taxIdentificationNumber")) {
                merchant.setTaxIdentificationNumber((String) merchantData.get("taxIdentificationNumber"));
            }
            if (merchantData.containsKey("reliabilityScore")) {
                merchant.setReliabilityScore(Double.valueOf(merchantData.get("reliabilityScore").toString()));
            }
            if (merchantData.containsKey("averageDeliveryTime")) {
                merchant.setAverageDeliveryTime(Double.valueOf(merchantData.get("averageDeliveryTime").toString()));
            }

            if (merchantData.containsKey("notes")) {
                merchant.setNotes((String) merchantData.get("notes"));
            }

            // Site update
            if (merchantData.containsKey("siteId")) {
                Site site = siteRepository.findById(UUID.fromString((String) merchantData.get("siteId")))
                        .orElse(null);
                merchant.setSite(site);
            }

            // Item category update
            if (merchantData.containsKey("itemCategoryIds")) {
                List<ItemCategory> categories = new ArrayList<>();
                String[] categoryIds = ((String) merchantData.get("itemCategoryIds")).split(",");
                for (String categoryId : categoryIds) {
                    itemCategoryRepository.findById(UUID.fromString(categoryId.trim()))
                            .ifPresent(categories::add);
                }
                merchant.setItemCategories(categories);
            }

            // Save and return
            Merchant updated = merchantRepository.save(merchant);
            System.out.println("Merchant updated with ID: " + updated.getId());
            return updated;

        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update merchant: " + e.getMessage(), e);
        }
    }




}
