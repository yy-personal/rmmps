package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.RecipeService;
import com.nus_iss.recipe_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {
    private final RecipeRepository recipeRepository;
    private final UserService userService;

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

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this recipe.");
        }
        recipeRepository.deleteById(id);
    }
}
