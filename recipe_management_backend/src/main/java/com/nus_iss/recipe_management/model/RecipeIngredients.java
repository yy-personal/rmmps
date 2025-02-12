package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RecipeIngredients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeIngredients {

    @EmbeddedId
    private RecipeIngredientsId id;

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
}
