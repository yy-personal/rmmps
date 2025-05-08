package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.exception.MealPlanRecipeMappingNotFoundException;
import com.nus_iss.recipe_management.exception.RecipeAlreadyInMealPlanException;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.MealPlanRecipeMappingRepository;
import com.nus_iss.recipe_management.repository.MealPlanRepository;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.service.MealPlanService;
import com.nus_iss.recipe_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealPlanServiceImpl implements MealPlanService {
    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final MealPlanRecipeMappingRepository mealPlanRecipeMappingRepository;
    private final UserService userService;

    @Override
    public MealPlan createMealPlan(String userEmail, LocalDateTime endDate, LocalDateTime startDate, Frequency frequency, String title, Integer mealsPerDay) {
        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));
        User user2 = userService.findByEmail(userEmail).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));
        // Check if the authenticated user owns the meal plan
        if (!user.getUserId().equals(user2.getUserId())) {
            throw new AccessDeniedException("You do not have permission to modify this meal plan.");
        }

        MealPlan mealPlan = new MealPlan();
        mealPlan.setUser(user);
        mealPlan.setEndDate(endDate);
        mealPlan.setStartDate(startDate);
        mealPlan.setFrequency(frequency);
        mealPlan.setTitle(title);
        mealPlan.setMealsPerDay(mealsPerDay);

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

        // Fetch the Meal Plan
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new MealPlanNotFoundException("Meal Plan not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the meal plan
        if (!mealPlan.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this meal plan.");
        }

        mealPlan.setTitle(updatedMealPlan.getTitle());
        mealPlan.setStartDate(updatedMealPlan.getStartDate());
        mealPlan.setEndDate(updatedMealPlan.getEndDate());
        mealPlan.setFrequency(updatedMealPlan.getFrequency());
        mealPlan.setMealsPerDay(updatedMealPlan.getMealsPerDay());


        return mealPlanRepository.save(mealPlan);
    }

    @Override
    public void deleteMealPlan(Integer id) {

        // Fetch the Meal Plan
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new MealPlanNotFoundException("Meal Plan not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the meal plan
        if (!mealPlan.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to delete this meal plan.");
        }

        // Delete Meal Plan from DB
        mealPlanRepository.deleteById(id);
    }

    // Add recipe to Meal Plan
    @Override
    public MealPlanRecipeMapping addMealPlanRecipeMapping(Integer mealPlanId, Integer recipeId) {

        // Fetch the Meal Plan
        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new MealPlanNotFoundException("Meal Plan not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer userId = user.getUserId();

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
            throw new RecipeAlreadyInMealPlanException("This recipe is already added to the meal plan.");
        }

        // Create a new MealPlanRecipeMapping instance
        MealPlanRecipeMapping mapping = new MealPlanRecipeMapping();
        mapping.setId(mappingId);
        mapping.setMealPlan(mealPlan);
        mapping.setRecipe(recipe);

        // Save the mapping
        return mealPlanRecipeMappingRepository.save(mapping);
    }

    // Delete recipe from Meal Plan
    @Override
    public void deleteMealPlanRecipeMapping(Integer mealPlanId, Integer recipeId) {

        MealPlan mealPlan = mealPlanRepository.findById(mealPlanId)
                .orElseThrow(() -> new MealPlanNotFoundException("Meal Plan not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer userId = user.getUserId();

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
