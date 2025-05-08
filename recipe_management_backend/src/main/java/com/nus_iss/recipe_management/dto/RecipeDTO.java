package com.nus_iss.recipe_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDTO {
    private String title;
    private Integer preparationTime;
    private Integer cookingTime;
    private String difficultyLevel;
    private Integer servings;
    private String steps;
    private Set<Integer> mealTypeIds;
    private List<RecipeIngredientDTO> ingredients;
}