package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.Ingredient;
import java.util.List;
import java.util.Optional;

public interface IngredientService {
    Ingredient createIngredient(Ingredient ingredient);
    List<Ingredient> getAllIngredients();
    Ingredient getIngredientById(Integer id);
    Optional<Ingredient> findByName(String name);
    void deleteIngredient(Integer id);
}