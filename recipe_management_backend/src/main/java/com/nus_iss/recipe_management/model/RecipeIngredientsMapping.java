package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RecipeIngredients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeIngredientsMapping {

    @EmbeddedId
    private RecipeIngredientsMappingId id;

    @ManyToOne
    @MapsId("recipeId")  // Maps to recipeId in RecipeIngredientsId
    @JoinColumn(name = "recipeId", nullable = false)
    private Recipe recipe;

    @ManyToOne
    @MapsId("ingredientId")  // Maps to ingredientId in RecipeIngredientsId
    @JoinColumn(name = "ingredientId", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private String quantity;

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Recipe getRecipe() {
        return recipe;
    }
}
