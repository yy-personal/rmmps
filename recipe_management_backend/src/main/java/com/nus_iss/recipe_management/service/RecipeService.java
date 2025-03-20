package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.dto.RecipeDto;
import com.nus_iss.recipe_management.dto.RecipeIngredientDto;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import java.util.List;

public interface RecipeService {
    Recipe createRecipe(Recipe recipe);
    Recipe createRecipeWithIngredients(RecipeDto recipeDto);
    List<Recipe> getAllRecipes();
    Recipe getRecipeById(Integer id);
    Recipe updateRecipe(Integer id, Recipe recipe) throws RecipeNotFoundException;
    Recipe updateRecipeWithIngredients(Integer id, RecipeDto recipeDto) throws RecipeNotFoundException;
    void deleteRecipe(Integer id);
    List<RecipeIngredientDto> getRecipeIngredients(Integer recipeId);
}