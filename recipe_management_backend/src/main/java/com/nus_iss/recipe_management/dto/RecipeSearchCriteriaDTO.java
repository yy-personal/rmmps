package com.nus_iss.recipe_management.dto;

import lombok.Data;
import java.util.List;

@Data
public class RecipeSearchCriteriaDTO {
    private String title;
    private List<String> ingredients;
    private String difficultyLevel;
    private List<Integer> mealTypeIds;
    private Integer maxPrepTime;
    private Integer maxCookTime;
    private Integer servings;
}