package com.nus_iss.recipe_management.dto;

import com.nus_iss.recipe_management.model.MealPlan;

public class CreateMealPlanDTO {
    private String userEmail;
    private MealPlan mealPlan;

    // Getters and Setters

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public MealPlan getMealPlan() {
        return mealPlan;
    }

    public void setMealPlan(MealPlan mealPlan) {
        this.mealPlan = mealPlan;
    }
}