package com.nus_iss.recipe_management.dto;

import com.nus_iss.recipe_management.model.DifficultyLevel;
import com.nus_iss.recipe_management.model.MealType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeDto {
    private Integer recipeId;
    private Integer userId;
    private String title;
    private Integer preparationTime;
    private Integer cookingTime;
    private DifficultyLevel difficultyLevel;
    private Integer servings;
    private String steps;
    private List<RecipeIngredientDto> ingredients;
    private Set<MealType> mealTypes;
}