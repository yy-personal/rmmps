package com.nus_iss.recipe_management.exception;

public class RecipeNotFoundException extends RuntimeException {

  public RecipeNotFoundException(String message) {
    super(message);
  }

  public RecipeNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
