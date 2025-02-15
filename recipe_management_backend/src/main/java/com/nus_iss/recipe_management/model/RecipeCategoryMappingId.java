package com.nus_iss.recipe_management.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeCategoryMappingId implements Serializable {
    private Long recipeId;
    private Long categoryId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecipeCategoryMappingId that = (RecipeCategoryMappingId) o;
        return Objects.equals(recipeId, that.recipeId) &&
                Objects.equals(categoryId, that.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(recipeId, categoryId);
    }
}
