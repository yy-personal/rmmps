package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

// Dietary Restrictions Entity
@Entity
@Table(name = "DietaryRestrictions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class DietaryRestriction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer dietaryRestrictionId;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "dietaryRestriction", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RecipeDietaryRestrictionMapping> recipes = new HashSet<>();

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Set<RecipeDietaryRestrictionMapping> getRecipes() {
        return recipes;
    }
}