package com.nus_iss.recipe_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeIngredientDto {
    private Integer ingredientId;
    private String name;
    private String quantity;
}