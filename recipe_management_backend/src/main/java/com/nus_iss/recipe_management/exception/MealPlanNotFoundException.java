package com.nus_iss.recipe_management.exception;

public class MealPlanNotFoundException extends RuntimeException {

    public MealPlanNotFoundException(String message) {
        super(message);
    }

    public MealPlanNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
