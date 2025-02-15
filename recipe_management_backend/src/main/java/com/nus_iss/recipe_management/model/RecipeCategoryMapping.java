package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RecipeCategoryMapping")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeCategoryMapping {

    @EmbeddedId
    private RecipeCategoryMappingId id;

    @ManyToOne
    @MapsId("recipeId")  // Maps to recipeId in RecipeCategoryMappingId
    @JoinColumn(name = "recipeId", nullable = false)
    private Recipe recipe;

    @ManyToOne
    @MapsId("categoryId")  // Maps to categoryId in RecipeCategoryMappingId
    @JoinColumn(name = "categoryId", nullable = false)
    private RecipeCategory category;
}
