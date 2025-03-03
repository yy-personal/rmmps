package com.nus_iss.recipe_management.exception;

public class MealPlanRecipeMappingNotFoundException extends RuntimeException {

    public MealPlanRecipeMappingNotFoundException(String message) {
        super(message);
    }

    public MealPlanRecipeMappingNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
