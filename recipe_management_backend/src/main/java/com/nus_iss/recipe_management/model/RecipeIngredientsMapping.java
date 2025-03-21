package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_ingredients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeIngredientsMapping {

    @EmbeddedId
    private RecipeIngredientsMappingId id;

    @ManyToOne
    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne
    @MapsId("ingredientId")
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Column(nullable = false)
    private String quantity;

    // Convenience constructor
    public RecipeIngredientsMapping(Recipe recipe, Ingredient ingredient, String quantity) {
        this.id = new RecipeIngredientsMappingId(recipe.getRecipeId(), ingredient.getIngredientId());
        this.recipe = recipe;
        this.ingredient = ingredient;
        this.quantity = quantity;
    }

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Recipe getRecipe() {
        return recipe;
    }
}