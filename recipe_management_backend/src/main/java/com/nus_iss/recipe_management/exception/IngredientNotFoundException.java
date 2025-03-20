package com.nus_iss.recipe_management.exception;

public class IngredientNotFoundException extends RuntimeException {
    public IngredientNotFoundException(String message) {
        super(message);
    }

    public IngredientNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}