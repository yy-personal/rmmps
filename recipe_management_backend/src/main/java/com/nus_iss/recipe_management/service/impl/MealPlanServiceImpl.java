package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.exception.MealPlanRecipeMappingNotFoundException;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.MealPlan;
import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;
import com.nus_iss.recipe_management.model.MealPlanRecipeMappingId;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.repository.MealPlanRecipeMappingRepository;
import com.nus_iss.recipe_management.repository.MealPlanRepository;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.service.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MealPlanServiceImpl implements MealPlanService {
    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final MealPlanRecipeMappingRepository mealPlanRecipeMappingRepository;

    @Override
    public MealPlan createMealPlan(MealPlan mealPlan) {
        return mealPlanRepository.save(mealPlan);
    }

    @Override
    public List<MealPlan> getAllMealPlans() {
        return mealPlanRepository.findAll();
    }

    @Override
    public MealPlan getMealPlanById(Integer id) throws MealPlanNotFoundException {
        return mealPlanRepository.findById(id)
                .orElseThrow(() -> new MealPlanNotFoundException("MealPlan not found."));
    }

    @Override
    public MealPlan updateMealPlan(Integer id, MealPlan updatedMealPlan) throws MealPlanNotFoundException {
        return updatedMealPlan;
    }

    @Override
    public void deleteMealPlan(Integer id) {
        mealPlanRepository.deleteById(id);
    }

    @Override
    public MealPlanRecipeMapping addRecipeToMealPlan(Integer mealPlanId, Integer recipeId, Integer userId) {

        // Fetch the Meal Plan
        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new MealPlanNotFoundException("Meal Plan not found"));

        //todo::YH Userid will be taken from the custom user details in prod version

        // Check if the authenticated user owns the meal plan
        if (!mealPlan.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this meal plan.");
        }

        // Fetch the Recipe
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found"));

        // Create the mapping ID
        MealPlanRecipeMappingId mappingId = new MealPlanRecipeMappingId(mealPlanId, recipeId);

        // Check if the mapping already exists to prevent duplicates
        if (mealPlanRecipeMappingRepository.existsById(mappingId)) {
            throw new MealPlanNotFoundException("This recipe is already added to the meal plan.");
        }

        // Create a new MealPlanRecipeMapping instance
        MealPlanRecipeMapping mapping = new MealPlanRecipeMapping();
        mapping.setId(mappingId);
        mapping.setMealPlan(mealPlan);
        mapping.setRecipe(recipe);

        // Save the mapping
        return mealPlanRecipeMappingRepository.save(mapping);
    }

    @Override
    public void deleteMealPlanRecipeMapping(Integer mealPlanId, Integer recipeId, Integer userId) {
        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new MealPlanNotFoundException("Meal Plan not found"));

        //todo::YH Userid will be taken from the custom user details in prod version

        // Check if the authenticated user owns the meal plan
        if (!mealPlan.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this meal plan.");
        }

        MealPlanRecipeMappingId id = new MealPlanRecipeMappingId(mealPlanId, recipeId);

        // Fetch the mapping directly, throwing an exception if not found
        MealPlanRecipeMapping mapping = mealPlanRecipeMappingRepository.findById(id)
                .orElseThrow(() -> new MealPlanRecipeMappingNotFoundException("Mapping not found"));

        mealPlanRecipeMappingRepository.delete(mapping);
    }
}
