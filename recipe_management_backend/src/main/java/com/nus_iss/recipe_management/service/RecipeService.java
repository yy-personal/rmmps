package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.dto.RecipeDTO;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import java.util.List;

public interface RecipeService {
    Recipe createRecipe(Recipe recipe);
    Recipe createRecipeWithIngredients(RecipeDTO recipeDTO, User user);
    List<Recipe> getAllRecipes();
    Recipe getRecipeById(Integer id);
    Recipe updateRecipe(Integer id, Recipe recipe) throws RecipeNotFoundException;
    Recipe updateRecipeWithIngredients(Integer id, RecipeDTO recipeDTO) throws RecipeNotFoundException;
    void deleteRecipe(Integer id);
    void addDietaryRestrictionsToRecipe(Integer recipeId, List<Integer> dietaryRestrictionIds);
    void removeDietaryRestrictionsFromRecipe(Integer recipeId, List<Integer> dietaryRestrictionIds);
    List<Recipe> getMatchingDietaryRestrictionsRecipes(Integer userId);
}