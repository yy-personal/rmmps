package com.nus_iss.recipe_management.service;


import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.model.MealPlan;
import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;

import java.util.List;

public interface MealPlanService {
    MealPlan createMealPlan(MealPlan mealPlan);
    List<MealPlan> getAllMealPlans();
    MealPlan getMealPlanById(Integer id);
    MealPlan updateMealPlan(Integer id, MealPlan mealPlan) throws MealPlanNotFoundException;
    void deleteMealPlan(Integer id);
    MealPlanRecipeMapping addRecipeToMealPlan(Integer mealPlanId, Integer recipeId, Integer userId);
    void deleteMealPlanRecipeMapping(Integer mealPlanId, Integer recipeId, Integer userId);
}
