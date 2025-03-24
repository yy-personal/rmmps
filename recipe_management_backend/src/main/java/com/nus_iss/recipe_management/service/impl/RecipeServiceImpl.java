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

import java.time.LocalDateTime;
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
    private final DietaryRestrictionRepository dietaryRestrictionRepository;
    private final RecipeIngredientsMappingRepository recipeIngredientsMappingRepository;
    private final RecipeDietaryRestrictionMappingRepository recipeDietaryRestrictionMappingRepository;

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
        recipeRepository.flush(); // Ensure the recipe is saved before adding ingredients

        // Process ingredients
        if (recipeDTO.getIngredients() != null && !recipeDTO.getIngredients().isEmpty()) {
            for (RecipeIngredientDTO dto : recipeDTO.getIngredients()) {
                try {
                    Ingredient ingredient;

                    if (dto.getIngredientId() != null) {
                        // Use existing ingredient
                        Optional<Ingredient> existingIngredient = ingredientRepository.findById(dto.getIngredientId());
                        if (existingIngredient.isEmpty()) {
                            log.warn("Ingredient with ID {} not found, skipping", dto.getIngredientId());
                            continue;
                        }
                        ingredient = existingIngredient.get();
                    } else if (dto.getName() != null && !dto.getName().isEmpty()) {
                        // Create or find by name
                        Optional<Ingredient> existingIngredient = ingredientRepository.findByName(dto.getName());
                        if (existingIngredient.isPresent()) {
                            ingredient = existingIngredient.get();
                        } else {
                            Ingredient newIngredient = new Ingredient();
                            newIngredient.setName(dto.getName());
                            ingredient = ingredientRepository.save(newIngredient);
                            ingredientRepository.flush(); // Ensure ingredient is saved
                        }
                    } else {
                        // Skip invalid entries
                        log.warn("Invalid ingredient data (no ID or name), skipping");
                        continue;
                    }

                    // Create mapping
                    RecipeIngredientsMappingId mappingId = new RecipeIngredientsMappingId(
                            savedRecipe.getRecipeId(), ingredient.getIngredientId());

                    RecipeIngredientsMapping mapping = new RecipeIngredientsMapping();
                    mapping.setId(mappingId);
                    mapping.setRecipe(savedRecipe);
                    mapping.setIngredient(ingredient);
                    mapping.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : "1 unit");

                    recipeIngredientsMappingRepository.save(mapping);
                } catch (Exception e) {
                    log.error("Error processing ingredient: {}", e.getMessage(), e);
                    // Continue with other ingredients
                }
            }
        }

        // Refresh the recipe to include ingredients
        return recipeRepository.findById(savedRecipe.getRecipeId())
                .orElse(savedRecipe);
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
                String sanitizedDifficultyLevel = recipeDTO.getDifficultyLevel().replace('\n', ' ').replace('\r', ' ');
                log.warn("Invalid difficulty level: {}", sanitizedDifficultyLevel);
            }
        }
        if (recipeDTO.getServings() != null) existingRecipe.setServings(recipeDTO.getServings());
        if (recipeDTO.getSteps() != null) existingRecipe.setSteps(recipeDTO.getSteps());

        // Process meal types
        if (recipeDTO.getMealTypeIds() != null && !recipeDTO.getMealTypeIds().isEmpty()) {
            Set<MealType> mealTypes = recipeDTO.getMealTypeIds().stream()
                    .map(mealTypeId -> mealTypeRepository.findById(mealTypeId).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            existingRecipe.getMealTypes().clear();
            existingRecipe.getMealTypes().addAll(mealTypes);
        }

        // Save recipe changes
        existingRecipe = recipeRepository.save(existingRecipe);
        recipeRepository.flush();

        // Process ingredients if provided
        if (recipeDTO.getIngredients() != null) {
            // Remove existing ingredient mappings
            List<RecipeIngredientsMapping> existingMappings = recipeIngredientsMappingRepository.findByRecipeRecipeId(existingRecipe.getRecipeId());
            if (!existingMappings.isEmpty()) {
                recipeIngredientsMappingRepository.deleteAll(existingMappings);
                recipeIngredientsMappingRepository.flush();
            }

            // Add updated ingredients
            if (!recipeDTO.getIngredients().isEmpty()) {
                for (RecipeIngredientDTO dto : recipeDTO.getIngredients()) {
                    try {
                        Ingredient ingredient;

                        if (dto.getIngredientId() != null) {
                            // Use existing ingredient
                            Optional<Ingredient> existingIngredient = ingredientRepository.findById(dto.getIngredientId());
                            if (existingIngredient.isEmpty()) {
                                log.warn("Ingredient with ID {} not found, skipping", dto.getIngredientId());
                                continue;
                            }
                            ingredient = existingIngredient.get();
                        } else if (dto.getName() != null && !dto.getName().isEmpty()) {
                            // Create or find by name
                            Optional<Ingredient> existingIngredient = ingredientRepository.findByName(dto.getName());
                            if (existingIngredient.isPresent()) {
                                ingredient = existingIngredient.get();
                            } else {
                                Ingredient newIngredient = new Ingredient();
                                newIngredient.setName(dto.getName());
                                ingredient = ingredientRepository.save(newIngredient);
                                ingredientRepository.flush();
                            }
                        } else {
                            // Skip invalid entries
                            log.warn("Invalid ingredient data (no ID or name), skipping");
                            continue;
                        }

                        RecipeIngredientsMappingId mappingId = new RecipeIngredientsMappingId(
                                existingRecipe.getRecipeId(), ingredient.getIngredientId());

                        RecipeIngredientsMapping mapping = new RecipeIngredientsMapping();
                        mapping.setId(mappingId);
                        mapping.setRecipe(existingRecipe);
                        mapping.setIngredient(ingredient);
                        mapping.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : "1 unit");

                        recipeIngredientsMappingRepository.save(mapping);
                    } catch (Exception e) {
                        log.error("Error processing ingredient: {}", e.getMessage(), e);
                    }
                }
            }
        }

        // Refresh the recipe to include updated ingredients
        return recipeRepository.findById(existingRecipe.getRecipeId())
                .orElse(existingRecipe);
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


    /******************************** Modify Recipe Dietary Restrictions ********************************/
    @Transactional
    public void addDietaryRestrictionsToRecipe(Integer recipeId, List<Integer> dietaryRestrictionIds) {
        Recipe recipe = recipeRepository.findById(recipeId)
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

        List<DietaryRestriction> restrictions = dietaryRestrictionRepository.findAllById(dietaryRestrictionIds);
        if (restrictions.size() != dietaryRestrictionIds.size()) {
            throw new RuntimeException("Some dietary restrictions not found");
        }

        List<RecipeDietaryRestrictionMapping> mappings = restrictions.stream()
                .map(restriction -> new RecipeDietaryRestrictionMapping(
                        new RecipeDietaryRestrictionMappingId(recipeId, restriction.getDietaryRestrictionId()),
                        recipe,
                        restriction,
                        LocalDateTime.now()
                ))
                .toList();

        recipeDietaryRestrictionMappingRepository.saveAll(mappings);
    }

    @Transactional
    public void removeDietaryRestrictionsFromRecipe(Integer recipeId, List<Integer> dietaryRestrictionIds) {
        Recipe recipe = recipeRepository.findById(recipeId)
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

        List<RecipeDietaryRestrictionMapping> mappingsToDelete =
                recipeDietaryRestrictionMappingRepository.findByIdRecipeIdAndIdDietaryRestrictionIdIn(recipeId, dietaryRestrictionIds);

        if (mappingsToDelete.isEmpty()) {
            throw new RuntimeException("No matching dietary restrictions found for deletion");
        }

        recipeDietaryRestrictionMappingRepository.deleteAll(mappingsToDelete);
    }

    // Recipe Recommendation (Based on dietary restrictions)
    @Override
    public List<Recipe> getMatchingDietaryRestrictionsRecipes(Integer userId) {
        return recipeRepository.findRecommendedRecipes(userId);
    }
}