package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "RecipeDietaryRestrictionMapping")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeDietaryRestrictionMapping {

    @EmbeddedId
    private RecipeDietaryRestrictionMappingId id;

    @ManyToOne
    @MapsId("recipeId")  // Maps to the composite key's recipeId
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne
    @MapsId("dietaryRestrictionId")  // Maps to the composite key's dietaryRestrictionId
    @JoinColumn(name = "dietary_restriction_id", nullable = false)
    private DietaryRestriction dietaryRestriction;

    private LocalDateTime dateAdded;

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Recipe getRecipe() {
        return recipe;
    }
}
