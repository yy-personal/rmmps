package com.nus_iss.recipe_management.service;


import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.model.Frequency;
import com.nus_iss.recipe_management.model.MealPlan;
import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;

import java.time.LocalDateTime;
import java.util.List;

public interface MealPlanService {
    MealPlan createMealPlan(String userEmail, LocalDateTime endDate, LocalDateTime startDate, Frequency frequency, String title, Integer mealsPerDay);
    List<MealPlan> getAllMealPlans();
    MealPlan getMealPlanById(Integer id);
    MealPlan updateMealPlan(Integer id, MealPlan mealPlan) throws MealPlanNotFoundException;
    void deleteMealPlan(Integer id);
    MealPlanRecipeMapping addMealPlanRecipeMapping(Integer mealPlanId, Integer recipeId);
    void deleteMealPlanRecipeMapping(Integer mealPlanId, Integer recipeId);
}
