package com.nus_iss.recipe_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeSearchDTO {
    private String title;
    private List<Integer> ingredientIds;
    private String difficultyLevel;
    private Integer maxTotalTime; // prep + cooking time combined
    private Integer minTotalTime;
    private Integer userId; // owner
    private List<Integer> mealTypeIds; // cuisine types
    private Integer servings;

    // Pagination parameters
    private Integer page = 0;
    private Integer size = 10;

    // Sorting parameters
    private String sortBy = "title";
    private String sortDirection = "asc";
}