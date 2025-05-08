package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipe_ingredients")
@Getter @Setter
@NoArgsConstructor
public class RecipeIngredientsMapping {
    @EmbeddedId
    private RecipeIngredientsMappingId id = new RecipeIngredientsMappingId();

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("recipeId")
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("ingredientId")
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private String quantity = "1 unit";

    public RecipeIngredientsMapping(Recipe recipe, Ingredient ingredient, String quantity) {
        this.recipe = recipe;
        this.ingredient = ingredient;
        this.quantity = (quantity != null && !quantity.trim().isEmpty()) ? quantity : "1 unit";
        this.id = new RecipeIngredientsMappingId(
                recipe != null ? recipe.getRecipeId() : null,
                ingredient != null ? ingredient.getIngredientId() : null
        );
    }

    @JsonIgnore
    public Recipe getRecipe() {
        return recipe;
    }
}