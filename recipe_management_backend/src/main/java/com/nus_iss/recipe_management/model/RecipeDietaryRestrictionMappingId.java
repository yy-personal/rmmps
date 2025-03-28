package com.nus_iss.recipe_management.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeDietaryRestrictionMappingId implements Serializable {
    private Integer recipeId;
    private Integer dietaryRestrictionId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecipeDietaryRestrictionMappingId that = (RecipeDietaryRestrictionMappingId) o;
        return Objects.equals(recipeId, that.recipeId) &&
                Objects.equals(dietaryRestrictionId, that.dietaryRestrictionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(recipeId, dietaryRestrictionId);
    }
}
