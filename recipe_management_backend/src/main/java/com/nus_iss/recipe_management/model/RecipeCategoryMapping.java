package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "RecipeCategoryMapping")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeCategoryMapping {

    @EmbeddedId
    private RecipeCategoryMappingId id;

    @ManyToOne
    @MapsId("recipeId")  // Maps to recipeId in RecipeCategoryMappingId
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne
    @MapsId("categoryId")  // Maps to categoryId in RecipeCategoryMappingId
    @JoinColumn(name = "category_id", nullable = false)
    private RecipeCategory category;

    private LocalDateTime dateAdded;

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Recipe getRecipe() {
        return recipe;
    }
}
