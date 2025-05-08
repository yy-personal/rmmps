package com.nus_iss.recipe_management.exception;

public class RecipeAlreadyInMealPlanException extends RuntimeException {
    public RecipeAlreadyInMealPlanException(String message) {
        super(message);
    }
    public RecipeAlreadyInMealPlanException(String message, Throwable cause) {
        super(message, cause);
    }
}
