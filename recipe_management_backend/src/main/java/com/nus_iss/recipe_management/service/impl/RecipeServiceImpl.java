package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.dto.RecipeDTO;
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
    private final IngredientRepository ingredientRepository;
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

        // Save the recipe
        return recipeRepository.save(recipe);
    }

    @Override
    @Transactional
    public Recipe createRecipeWithIngredients(RecipeDTO recipeDTO, User user) {
        // Create base recipe
        Recipe recipe = new Recipe();
        recipe.setTitle(recipeDTO.getTitle());
        recipe.setPreparationTime(recipeDTO.getPreparationTime());
        recipe.setCookingTime(recipeDTO.getCookingTime());
        recipe.setDifficultyLevel(DifficultyLevel.valueOf(recipeDTO.getDifficultyLevel()));
        recipe.setServings(recipeDTO.getServings());
        recipe.setSteps(recipeDTO.getSteps());
        recipe.setUser(user);

        // Process meal types
        if (recipeDTO.getMealTypeIds() != null && !recipeDTO.getMealTypeIds().isEmpty()) {
            Set<MealType> mealTypes = recipeDTO.getMealTypeIds().stream()
                    .map(id -> mealTypeRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            recipe.setMealTypes(mealTypes);
        }

        // Save recipe first to get ID
        Recipe savedRecipe = recipeRepository.save(recipe);

        // Process ingredients
        if (recipeDTO.getIngredients() != null && !recipeDTO.getIngredients().isEmpty()) {
            Set<RecipeIngredientsMapping> mappings = new HashSet<>();

            for (RecipeIngredientDTO dto : recipeDTO.getIngredients()) {
                Ingredient ingredient;

                if (dto.getIngredientId() != null) {
                    // Use existing ingredient
                    Optional<Ingredient> existingIngredient = ingredientRepository.findById(dto.getIngredientId());
                    if (existingIngredient.isPresent()) {
                        ingredient = existingIngredient.get();
                    } else {
                        // Skip if ingredient not found
                        log.warn("Ingredient with ID {} not found, skipping", dto.getIngredientId());
                        continue;
                    }
                } else if (dto.getName() != null && !dto.getName().isEmpty()) {
                    // Create or find by name
                    ingredient = ingredientRepository.findByName(dto.getName())
                            .orElseGet(() -> {
                                Ingredient newIngredient = new Ingredient();
                                newIngredient.setName(dto.getName());
                                return ingredientRepository.save(newIngredient);
                            });
                } else {
                    // Skip invalid entries
                    log.warn("Invalid ingredient data (no ID or name), skipping");
                    continue;
                }

                RecipeIngredientsMapping mapping = new RecipeIngredientsMapping(
                        savedRecipe,
                        ingredient,
                        dto.getQuantity() != null ? dto.getQuantity() : "1 unit"
                );

                // Create the composite key
                mapping.setId(new RecipeIngredientsMappingId(savedRecipe.getRecipeId(), ingredient.getIngredientId()));

                // Save mapping
                recipeIngredientsMappingRepository.save(mapping);
                mappings.add(mapping);
            }

            savedRecipe.setIngredients(mappings);
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

        // Save and return the updated recipe
        return recipeRepository.save(existingRecipe);
    }

    @Override
    @Transactional
    public Recipe updateRecipeWithIngredients(Integer id, RecipeDTO recipeDTO) throws RecipeNotFoundException {
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
        if (recipeDTO.getTitle() != null) existingRecipe.setTitle(recipeDTO.getTitle());
        if (recipeDTO.getPreparationTime() != null) existingRecipe.setPreparationTime(recipeDTO.getPreparationTime());
        if (recipeDTO.getCookingTime() != null) existingRecipe.setCookingTime(recipeDTO.getCookingTime());
        if (recipeDTO.getDifficultyLevel() != null) {
            try {
                existingRecipe.setDifficultyLevel(DifficultyLevel.valueOf(recipeDTO.getDifficultyLevel()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid difficulty level: {}", recipeDTO.getDifficultyLevel());
            }
        }
        if (recipeDTO.getServings() != null) existingRecipe.setServings(recipeDTO.getServings());
        if (recipeDTO.getSteps() != null) existingRecipe.setSteps(recipeDTO.getSteps());

        // Process meal types
        if (recipeDTO.getMealTypeIds() != null && !recipeDTO.getMealTypeIds().isEmpty()) {
            Set<MealType> mealTypes = recipeDTO.getMealTypeIds().stream()
                    .map(id2 -> mealTypeRepository.findById(id2).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            existingRecipe.getMealTypes().clear();
            existingRecipe.getMealTypes().addAll(mealTypes);
        }

        // Process ingredients if provided
        if (recipeDTO.getIngredients() != null) {
            // Remove existing ingredient mappings
            for (RecipeIngredientsMapping mapping : existingRecipe.getIngredients()) {
                recipeIngredientsMappingRepository.delete(mapping);
            }
            existingRecipe.getIngredients().clear();

            // Add updated ingredients
            if (!recipeDTO.getIngredients().isEmpty()) {
                Set<RecipeIngredientsMapping> mappings = new HashSet<>();

                for (RecipeIngredientDTO dto : recipeDTO.getIngredients()) {
                    Ingredient ingredient;

                    if (dto.getIngredientId() != null) {
                        // Use existing ingredient
                        Optional<Ingredient> existingIngredient = ingredientRepository.findById(dto.getIngredientId());
                        if (existingIngredient.isPresent()) {
                            ingredient = existingIngredient.get();
                        } else {
                            // Skip if ingredient not found
                            log.warn("Ingredient with ID {} not found, skipping", dto.getIngredientId());
                            continue;
                        }
                    } else if (dto.getName() != null && !dto.getName().isEmpty()) {
                        // Create or find by name
                        ingredient = ingredientRepository.findByName(dto.getName())
                                .orElseGet(() -> {
                                    Ingredient newIngredient = new Ingredient();
                                    newIngredient.setName(dto.getName());
                                    return ingredientRepository.save(newIngredient);
                                });
                    } else {
                        // Skip invalid entries
                        log.warn("Invalid ingredient data (no ID or name), skipping");
                        continue;
                    }

                    RecipeIngredientsMapping mapping = new RecipeIngredientsMapping(
                            existingRecipe,
                            ingredient,
                            dto.getQuantity() != null ? dto.getQuantity() : "1 unit"
                    );

                    // Save mapping
                    recipeIngredientsMappingRepository.save(mapping);
                    mappings.add(mapping);
                }

                existingRecipe.setIngredients(mappings);
            }
        }

        // Save and return updated recipe
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
}