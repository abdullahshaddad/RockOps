package com.example.Rock4Mining.repositories;

import com.example.Rock4Mining.models.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Integer> {

    List<Partner> findByIdNotIn(List<Integer> ids);
    //Optional<Partner> findByFirstNameAndLastName(String firstName, String lastName);
    Optional<Partner> findByFirstName(String firstName);



}
