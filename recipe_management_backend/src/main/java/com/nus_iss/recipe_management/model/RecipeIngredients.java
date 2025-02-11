package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;

// Recipe-Ingredient Mapping
@Entity
@Table(name = "RecipeIngredients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeIngredients
{
    @Id
    @ManyToOne
    @JoinColumn(name = "recipeId")
    private Recipe recipe;

    @Id
    @ManyToOne
    @JoinColumn(name = "ingredientId")
    private Ingredient ingredient;

    @Column(nullable = false)
    private String quantity;
}