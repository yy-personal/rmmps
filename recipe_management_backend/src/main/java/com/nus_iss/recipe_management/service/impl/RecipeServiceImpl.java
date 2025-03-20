package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.dto.RecipeDto;
import com.nus_iss.recipe_management.dto.RecipeIngredientDto;
import com.nus_iss.recipe_management.exception.IngredientNotFoundException;
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
import java.util.Optional;
import java.util.Set;
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
                new AuthenticationCredentialsNotFoundException("Value not present"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipe.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to create this recipe as the user of the user id submitted.");
        }

        // Handle meal types
        processMealTypes(recipe);

        return recipeRepository.save(recipe);
    }

    @Override
    @Transactional
    public Recipe createRecipeWithIngredients(RecipeDto recipeDto) {
        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Value not present"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!recipeDto.getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to create this recipe as the user of the user id submitted.");
        }

        // Create the recipe entity
        Recipe recipe = new Recipe();
        recipe.setTitle(recipeDto.getTitle());
        recipe.setPreparationTime(recipeDto.getPreparationTime());
        recipe.setCookingTime(recipeDto.getCookingTime());
        recipe.setDifficultyLevel(recipeDto.getDifficultyLevel());
        recipe.setServings(recipeDto.getServings());
        recipe.setSteps(recipeDto.getSteps());

        // Set user
        User recipeUser = new User();
        recipeUser.setUserId(userId);
        recipe.setUser(recipeUser);

        // Handle meal types
        if (recipeDto.getMealTypes() != null) {
            recipe.setMealTypes(recipeDto.getMealTypes());
        }

        // Save the recipe first to get the ID
        Recipe savedRecipe = recipeRepository.save(recipe);

        // Process ingredients
        if (recipeDto.getIngredients() != null && !recipeDto.getIngredients().isEmpty()) {
            processIngredients(savedRecipe, recipeDto.getIngredients());
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
                e.printStackTrace();
            }
        }

        // Save and return the updated recipe
        return recipeRepository.save(existingRecipe);
    }

    @Override
    @Transactional
    public Recipe updateRecipeWithIngredients(Integer id, RecipeDto recipeDto) throws RecipeNotFoundException {
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

        // Update recipe properties
        existingRecipe.setTitle(recipeDto.getTitle());
        existingRecipe.setPreparationTime(recipeDto.getPreparationTime());
        existingRecipe.setCookingTime(recipeDto.getCookingTime());
        existingRecipe.setDifficultyLevel(recipeDto.getDifficultyLevel());
        existingRecipe.setServings(recipeDto.getServings());
        existingRecipe.setSteps(recipeDto.getSteps());

        // Handle meal types if provided
        if (recipeDto.getMealTypes() != null) {
            existingRecipe.getMealTypes().clear();
            existingRecipe.getMealTypes().addAll(recipeDto.getMealTypes());
        }

        // Process ingredients
        if (recipeDto.getIngredients() != null) {
            // Delete existing ingredient mappings
            recipeIngredientsMappingRepository.deleteAllByRecipeId(existingRecipe.getRecipeId());
            // Add new ingredient mappings
            processIngredients(existingRecipe, recipeDto.getIngredients());
        }

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

    @Override
    public List<RecipeIngredientDto> getRecipeIngredients(Integer recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found."));

        // Find all ingredient mappings for this recipe
        List<RecipeIngredientsMapping> mappings = recipeIngredientsMappingRepository.findByRecipeId(recipeId);

        // Convert to DTOs
        return mappings.stream()
                .map(mapping -> new RecipeIngredientDto(
                        mapping.getIngredient().getIngredientId(),
                        mapping.getIngredient().getName(),
                        mapping.getQuantity()
                ))
                .collect(Collectors.toList());
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

    private void processIngredients(Recipe recipe, List<RecipeIngredientDto> ingredientsList) {
        for (RecipeIngredientDto dto : ingredientsList) {
            // Find or create the ingredient
            Ingredient ingredient;
            if (dto.getIngredientId() != null) {
                // Existing ingredient by ID
                ingredient = ingredientService.getIngredientById(dto.getIngredientId());
                if (ingredient == null) {
                    throw new IngredientNotFoundException("Ingredient not found with ID: " + dto.getIngredientId());
                }
            } else if (dto.getName() != null && !dto.getName().isEmpty()) {
                // Find or create by name
                Optional<Ingredient> existingIngredient = ingredientService.findByName(dto.getName());
                if (existingIngredient.isPresent()) {
                    ingredient = existingIngredient.get();
                } else {
                    // Create new ingredient
                    Ingredient newIngredient = new Ingredient();
                    newIngredient.setName(dto.getName());
                    ingredient = ingredientService.createIngredient(newIngredient);
                }
            } else {
                throw new IllegalArgumentException("Ingredient must have either ID or name");
            }

            // Create mapping between recipe and ingredient
            RecipeIngredientsMapping mapping = new RecipeIngredientsMapping();
            RecipeIngredientsMappingId mappingId = new RecipeIngredientsMappingId(recipe.getRecipeId(), ingredient.getIngredientId());
            mapping.setId(mappingId);
            mapping.setRecipe(recipe);
            mapping.setIngredient(ingredient);
            mapping.setQuantity(dto.getQuantity());

            recipeIngredientsMappingRepository.save(mapping);
        }
    }
}