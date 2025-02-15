package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {
    private final RecipeRepository recipeRepository;

    @Override
    public Recipe createRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    @Override
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    @Override
    public Recipe getRecipeById(Integer id) throws RecipeNotFoundException {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found."));
    }

    @Override
    public Recipe updateRecipe(Integer id, Recipe updatedRecipe) throws RecipeNotFoundException {
        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found."));

        existingRecipe.setServings(updatedRecipe.getServings());
        existingRecipe.setSteps(updatedRecipe.getSteps());
        existingRecipe.setTitle((updatedRecipe.getTitle()));
        existingRecipe.setCookingTime((updatedRecipe.getCookingTime()));
        existingRecipe.setDifficultyLevel((updatedRecipe.getDifficultyLevel()));
        existingRecipe.setPreparationTime((updatedRecipe.getPreparationTime()));

        return recipeRepository.save(existingRecipe);
    }

    @Override
    public void deleteRecipe(Integer id) {
        recipeRepository.deleteById(id);
    }
}
