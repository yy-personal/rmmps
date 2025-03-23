package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.Recipe;

import java.util.List;

public interface RecipeRecommendationService {
    List<Recipe> getRecommendedRecipes(Integer userId);
}
