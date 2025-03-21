package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.dto.RecipeIngredientDTO;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.IngredientService;
import com.nus_iss.recipe_management.service.MealTypeService;
import com.nus_iss.recipe_management.service.RecipeService;
import com.nus_iss.recipe_management.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeServiceImpl implements RecipeService {
    private final RecipeRepository recipeRepository;
    private final UserService userService;
    private final MealTypeService mealTypeService;
    private final MealTypeRepository mealTypeRepository;
    private final IngredientService ingredientService;
    private final RecipeIngredientsMappingRepository recipeIngredientsMappingRepository;

    @Override
    @Transactional
    public Recipe createRecipe(Recipe recipe) {
        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Value not present"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to create this recipe as the user of the user id submitted.");
        }

        // Handle meal types
        processMealTypes(recipe);

        // Save the recipe first to get its ID
        Recipe savedRecipe = recipeRepository.save(recipe);

        // Handle ingredients if they exist
        if (recipe.getIngredients() != null && !recipe.getIngredients().isEmpty()) {
            processIngredients(savedRecipe, recipe.getIngredients());
        }

        return savedRecipe;
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
    @Transactional
    public Recipe updateRecipe(Integer id, Recipe updatedRecipe) throws RecipeNotFoundException {
        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found."));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Value not present"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!existingRecipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this recipe.");
        }

        // Update basic recipe properties
        existingRecipe.setServings(updatedRecipe.getServings());
        existingRecipe.setSteps(updatedRecipe.getSteps());
        existingRecipe.setTitle(updatedRecipe.getTitle());
        existingRecipe.setCookingTime(updatedRecipe.getCookingTime());
        existingRecipe.setDifficultyLevel(updatedRecipe.getDifficultyLevel());
        existingRecipe.setPreparationTime(updatedRecipe.getPreparationTime());

        // Handle meal types if provided
        if (updatedRecipe.getMealTypes() != null && !updatedRecipe.getMealTypes().isEmpty()) {
            try {
                // Create a new set for the updated meal types
                Set<MealType> updatedMealTypes = new HashSet<>();

                // First, fetch all the meal types by ID to ensure they exist
                for (MealType mealType : updatedRecipe.getMealTypes()) {
                    if (mealType != null && mealType.getMealTypeId() != null) {
                        mealTypeRepository.findById(mealType.getMealTypeId())
                                .ifPresent(updatedMealTypes::add);
                    }
                }

                // Now clear and update the recipe's meal types if we found valid ones
                if (!updatedMealTypes.isEmpty()) {
                    existingRecipe.getMealTypes().clear();
                    existingRecipe.getMealTypes().addAll(updatedMealTypes);
                }
            } catch (Exception e) {
                // Log the exception but continue with other updates
                log.error("Error updating meal types", e);
            }
        }

        // Handle ingredients if provided
        if (updatedRecipe.getIngredients() != null) {
            // Remove existing ingredient mappings
            for (RecipeIngredientsMapping mapping : existingRecipe.getIngredients()) {
                recipeIngredientsMappingRepository.delete(mapping);
            }
            existingRecipe.getIngredients().clear();

            // Add updated ingredients
            if (!updatedRecipe.getIngredients().isEmpty()) {
                processIngredients(existingRecipe, updatedRecipe.getIngredients());
            }
        }

        // Save and return the updated recipe
        return recipeRepository.save(existingRecipe);
    }

    @Override
    public void deleteRecipe(Integer id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Value not present"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this recipe.");
        }
        recipeRepository.deleteById(id);
    }

    private void processMealTypes(Recipe recipe) {
        try {
            if (recipe.getMealTypes() != null && !recipe.getMealTypes().isEmpty()) {
                Set<MealType> processedMealTypes = new HashSet<>();

                for (MealType mealType : recipe.getMealTypes()) {
                    // If we have an ID, fetch by ID
                    if (mealType.getMealTypeId() != null) {
                        log.debug("Looking up meal type by ID: {}", mealType.getMealTypeId());
                        // Use the repository directly to avoid null checks
                        mealTypeRepository.findById(mealType.getMealTypeId())
                                .ifPresent(processedMealTypes::add);
                    }
                    // If we have a name, fetch or create by name
                    else if (mealType.getName() != null && !mealType.getName().isEmpty()) {
                        log.debug("Looking up meal type by name: {}", mealType.getName());
                        MealType existingMealType = mealTypeService.findByName(mealType.getName())
                                .orElseGet(() -> {
                                    MealType newType = new MealType();
                                    newType.setName(mealType.getName());
                                    return mealTypeService.createMealType(newType);
                                });
                        processedMealTypes.add(existingMealType);
                    }
                }

                // Clear and add the processed meal types
                recipe.getMealTypes().clear();
                recipe.getMealTypes().addAll(processedMealTypes);

                log.debug("Processed {} meal types for recipe", processedMealTypes.size());
            }
        } catch (Exception e) {
            log.error("Error processing meal types: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void processIngredients(Recipe recipe, Set<RecipeIngredientsMapping> ingredientMappings) {
        try {
            for (RecipeIngredientsMapping mapping : ingredientMappings) {
                Ingredient ingredient = mapping.getIngredient();

                // If ingredient has ID, find existing one
                if (ingredient.getIngredientId() != null) {
                    Ingredient existingIngredient = ingredientService.getIngredientById(ingredient.getIngredientId());
                    if (existingIngredient != null) {
                        ingredient = existingIngredient;
                    } else {
                        // If ID doesn't exist, treat as new ingredient with name
                        ingredient = processIngredientByName(ingredient);
                    }
                } else if (ingredient.getName() != null && !ingredient.getName().isEmpty()) {
                    // Process by name if no ID but name exists
                    ingredient = processIngredientByName(ingredient);
                } else {
                    // Skip invalid ingredients
                    continue;
                }

                // Create the mapping ID
                RecipeIngredientsMappingId mappingId = new RecipeIngredientsMappingId(recipe.getRecipeId(), ingredient.getIngredientId());

                // Create and save the mapping
                RecipeIngredientsMapping newMapping = new RecipeIngredientsMapping();
                newMapping.setId(mappingId);
                newMapping.setRecipe(recipe);
                newMapping.setIngredient(ingredient);
                newMapping.setQuantity(mapping.getQuantity());

                recipeIngredientsMappingRepository.save(newMapping);
                recipe.getIngredients().add(newMapping);
            }

            log.debug("Processed {} ingredients for recipe", ingredientMappings.size());
        } catch (Exception e) {
            log.error("Error processing ingredients: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Ingredient processIngredientByName(Ingredient ingredient) {
        // Look up by name first
        return ingredientService.findByName(ingredient.getName())
                .orElseGet(() -> {
                    // Create new ingredient if it doesn't exist
                    Ingredient newIngredient = new Ingredient();
                    newIngredient.setName(ingredient.getName());
                    return ingredientService.createIngredient(newIngredient);
                });
    }
}