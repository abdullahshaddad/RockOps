package com.example.backend.repositories;

import com.example.backend.repositories.finance.models.site.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface SiteRepository extends JpaRepository<Site, UUID> {

}
