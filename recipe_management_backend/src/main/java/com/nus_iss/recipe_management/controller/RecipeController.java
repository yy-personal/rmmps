package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {
    private final RecipeService recipeService;

    // Create a new recipe
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        Recipe createdRecipe = recipeService.createRecipe(recipe);
        return ResponseEntity.ok(createdRecipe);
    }

    // Get all recipes
    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }

    // Get a recipe by ID
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Integer id) {
        Recipe recipe = recipeService.getRecipeById(id);
        return recipe != null ? ResponseEntity.ok(recipe) : ResponseEntity.notFound().build();
    }

    // Update a recipe by ID
    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipeById(@PathVariable Integer id, @RequestBody Recipe recipeDetails) {
        ResponseEntity<Recipe> response;
        try {
            Recipe updatedRecipe = recipeService.updateRecipe(id, recipeDetails);
            response = ResponseEntity.ok(updatedRecipe);
        } catch (RecipeNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    // Delete a recipe by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Integer id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}