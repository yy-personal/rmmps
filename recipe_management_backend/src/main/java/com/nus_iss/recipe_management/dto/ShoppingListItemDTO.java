package com.nus_iss.recipe_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListItemDTO {
    private Integer ingredientId;
    private String ingredientName;
    private String quantity;
    private Boolean purchased;
    private Integer recipeId;
    private String recipeTitle;
    private Integer servings;
}