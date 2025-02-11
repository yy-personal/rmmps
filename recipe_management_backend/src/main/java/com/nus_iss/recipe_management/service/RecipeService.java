package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.*;
import java.util.List;

public interface RecipeService {
    Recipe createRecipe(Recipe recipe);
    List<Recipe> getAllRecipes();
    Recipe getRecipeById(Integer id);
    void deleteRecipe(Integer id);
}
