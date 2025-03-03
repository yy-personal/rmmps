package com.nus_iss.recipe_management.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MealPlanRecipeMappingId implements Serializable {
    private Integer mealPlanId;
    private Integer recipeId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MealPlanRecipeMappingId that = (MealPlanRecipeMappingId) o;
        return Objects.equals(mealPlanId, that.mealPlanId) &&
                Objects.equals(recipeId, that.recipeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(mealPlanId, recipeId);
    }
}
