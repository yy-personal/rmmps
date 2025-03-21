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

import java.util.*;
import java.util.stream.Collectors;

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
                new AuthenticationCredentialsNotFoundException("User not found"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to create this recipe as the user of the user id submitted.");
        }

        // Handle meal types
        processMealTypes(recipe);

        // Extract ingredients before saving
        Set<RecipeIngredientsMapping> ingredientMappings =
                recipe.getIngredients() != null ? new HashSet<>(recipe.getIngredients()) : new HashSet<>();

        // Clear ingredients temporarily to avoid issues with transient entities
        recipe.getIngredients().clear();

        // Save the recipe first to get its ID
        Recipe savedRecipe = recipeRepository.save(recipe);

        // Handle ingredients if they exist
        if (!ingredientMappings.isEmpty()) {
            processIngredients(savedRecipe, ingredientMappings);
        }

        // Refresh the recipe to ensure all mappings are loaded
        return recipeRepository.findById(savedRecipe.getRecipeId())
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found after saving"));
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
                new AuthenticationCredentialsNotFoundException("User not found"));
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
        if (updatedRecipe.getMealTypes() != null) {
            updateMealTypes(existingRecipe, updatedRecipe.getMealTypes());
        }

        // Handle ingredients if provided
        if (updatedRecipe.getIngredients() != null) {
            updateIngredients(existingRecipe, updatedRecipe.getIngredients());
        }

        // Save and return the updated recipe
        return recipeRepository.save(existingRecipe);
    }

    @Override
    @Transactional
    public void deleteRecipe(Integer id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("User not found"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete this recipe.");
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

    private void updateMealTypes(Recipe existingRecipe, Set<MealType> updatedMealTypes) {
        try {
            // Create a new set for the updated meal types
            Set<MealType> processedMealTypes = new HashSet<>();

            // Process each meal type
            for (MealType mealType : updatedMealTypes) {
                if (mealType != null) {
                    if (mealType.getMealTypeId() != null) {
                        mealTypeRepository.findById(mealType.getMealTypeId())
                                .ifPresent(processedMealTypes::add);
                    } else if (mealType.getName() != null && !mealType.getName().isEmpty()) {
                        MealType existingMealType = mealTypeService.findByName(mealType.getName())
                                .orElseGet(() -> {
                                    MealType newType = new MealType();
                                    newType.setName(mealType.getName());
                                    return mealTypeService.createMealType(newType);
                                });
                        processedMealTypes.add(existingMealType);
                    }
                }
            }

            // Update the recipe's meal types
            existingRecipe.getMealTypes().clear();
            existingRecipe.getMealTypes().addAll(processedMealTypes);

            log.debug("Updated meal types for recipe {}: {}", existingRecipe.getRecipeId(), processedMealTypes.size());
        } catch (Exception e) {
            log.error("Error updating meal types: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void processIngredients(Recipe recipe, Set<RecipeIngredientsMapping> ingredientMappings) {
        try {
            for (RecipeIngredientsMapping mapping : ingredientMappings) {
                Ingredient ingredient = mapping.getIngredient();

                // Skip if ingredient is null
                if (ingredient == null) {
                    log.warn("Skipping null ingredient for recipe {}", recipe.getRecipeId());
                    continue;
                }

                // Process the ingredient
                Ingredient processedIngredient;

                // If ingredient has ID, find existing one
                if (ingredient.getIngredientId() != null) {
                    Ingredient existingIngredient = ingredientService.getIngredientById(ingredient.getIngredientId());
                    if (existingIngredient != null) {
                        processedIngredient = existingIngredient;
                    } else {
                        // If ID doesn't exist, treat as new ingredient with name
                        processedIngredient = processIngredientByName(ingredient);
                    }
                } else if (ingredient.getName() != null && !ingredient.getName().isEmpty()) {
                    // Process by name if no ID but name exists
                    processedIngredient = processIngredientByName(ingredient);
                } else {
                    // Skip invalid ingredients
                    log.warn("Skipping invalid ingredient (no ID or name) for recipe {}", recipe.getRecipeId());
                    continue;
                }

                // Create and save the mapping
                RecipeIngredientsMapping newMapping = new RecipeIngredientsMapping();

                // Create the mapping ID
                RecipeIngredientsMappingId mappingId = new RecipeIngredientsMappingId(
                        recipe.getRecipeId(),
                        processedIngredient.getIngredientId()
                );

                newMapping.setId(mappingId);
                newMapping.setRecipe(recipe);
                newMapping.setIngredient(processedIngredient);
                newMapping.setQuantity(mapping.getQuantity() != null ? mapping.getQuantity() : "");

                // Save the mapping and add to recipe
                RecipeIngredientsMapping savedMapping = recipeIngredientsMappingRepository.save(newMapping);
                recipe.getIngredients().add(savedMapping);
            }

            log.debug("Processed {} ingredients for recipe {}", ingredientMappings.size(), recipe.getRecipeId());
        } catch (Exception e) {
            log.error("Error processing ingredients for recipe {}: {}", recipe.getRecipeId(), e.getMessage(), e);
            throw e;
        }
    }

    private void updateIngredients(Recipe existingRecipe, Set<RecipeIngredientsMapping> updatedMappings) {
        try {
            // Create a map of existing mappings by ingredient ID for efficient lookup
            Map<Integer, RecipeIngredientsMapping> existingMappingsMap = existingRecipe.getIngredients().stream()
                    .collect(Collectors.toMap(
                            mapping -> mapping.getIngredient().getIngredientId(),
                            mapping -> mapping,
                            (existing, replacement) -> existing // Keep first in case of duplicates
                    ));

            // Set to collect mappings to keep
            Set<RecipeIngredientsMapping> mappingsToKeep = new HashSet<>();

            // Process updated mappings
            for (RecipeIngredientsMapping updatedMapping : updatedMappings) {
                Ingredient ingredient = updatedMapping.getIngredient();

                // Skip if ingredient is null
                if (ingredient == null) continue;

                // Process ingredient to ensure it exists in database
                Ingredient processedIngredient;
                if (ingredient.getIngredientId() != null) {
                    // Try to find by ID first
                    Ingredient existingIngredient = ingredientService.getIngredientById(ingredient.getIngredientId());
                    if (existingIngredient != null) {
                        processedIngredient = existingIngredient;
                    } else {
                        // Fallback to finding/creating by name
                        processedIngredient = processIngredientByName(ingredient);
                    }
                } else if (ingredient.getName() != null && !ingredient.getName().isEmpty()) {
                    // Find or create by name
                    processedIngredient = processIngredientByName(ingredient);
                } else {
                    // Skip invalid ingredient
                    continue;
                }

                Integer ingredientId = processedIngredient.getIngredientId();

                // Check if we already have a mapping for this ingredient
                if (existingMappingsMap.containsKey(ingredientId)) {
                    // Update existing mapping
                    RecipeIngredientsMapping existingMapping = existingMappingsMap.get(ingredientId);
                    existingMapping.setQuantity(updatedMapping.getQuantity());
                    mappingsToKeep.add(existingMapping);
                    existingMappingsMap.remove(ingredientId); // Remove from map to track what's been processed
                } else {
                    // Create new mapping
                    RecipeIngredientsMapping newMapping = new RecipeIngredientsMapping();
                    RecipeIngredientsMappingId newId = new RecipeIngredientsMappingId(
                            existingRecipe.getRecipeId(),
                            ingredientId
                    );

                    newMapping.setId(newId);
                    newMapping.setRecipe(existingRecipe);
                    newMapping.setIngredient(processedIngredient);
                    newMapping.setQuantity(updatedMapping.getQuantity() != null ? updatedMapping.getQuantity() : "");

                    // Save and add to keep list
                    RecipeIngredientsMapping savedMapping = recipeIngredientsMappingRepository.save(newMapping);
                    mappingsToKeep.add(savedMapping);
                }
            }

            // Delete mappings that weren't in the updated set
            for (RecipeIngredientsMapping mappingToRemove : existingMappingsMap.values()) {
                recipeIngredientsMappingRepository.delete(mappingToRemove);
            }

            // Update recipe's ingredient collection
            existingRecipe.getIngredients().clear();
            existingRecipe.getIngredients().addAll(mappingsToKeep);

            log.debug("Updated ingredients for recipe {}: {} kept, {} removed",
                    existingRecipe.getRecipeId(), mappingsToKeep.size(), existingMappingsMap.size());
        } catch (Exception e) {
            log.error("Error updating ingredients for recipe {}: {}", existingRecipe.getRecipeId(), e.getMessage(), e);
            throw e;
        }
    }

    private Ingredient processIngredientByName(Ingredient ingredient) {
        // Return null if name is null or empty
        if (ingredient == null || ingredient.getName() == null || ingredient.getName().isEmpty()) {
            return null;
        }

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