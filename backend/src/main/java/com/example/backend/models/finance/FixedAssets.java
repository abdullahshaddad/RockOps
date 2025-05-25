package com.example.backend.models.finance;

import com.example.backend.models.site.Site;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Builder
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class FixedAssets
{
    @Id
    private UUID Id;
    private String Name;
    private Date creationDate;
    private int area;

    @ManyToOne
    @JoinColumn(name = "site_id", referencedColumnName = "id")
    //@JsonIgnore
    @JsonManagedReference
    private Site site;

}
