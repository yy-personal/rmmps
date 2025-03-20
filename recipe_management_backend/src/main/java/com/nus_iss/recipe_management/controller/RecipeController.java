package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipe Controller")
public class RecipeController {
    private final RecipeService recipeService;

    @Operation(summary = "Create a new recipe")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe created successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        ResponseEntity<Recipe> response;
        try {
            Recipe createdRecipe = recipeService.createRecipe(recipe);
            response = ResponseEntity.ok(createdRecipe);
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Get all recipes")
    @ApiResponse(responseCode = "200", description = "List of recipes retrieved")
    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }

    @Operation(summary = "Get recipe by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe found"),
            @ApiResponse(responseCode = "404", description = "Recipe not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Integer id) {
        ResponseEntity<Recipe> response;
        try {
            Recipe recipe = recipeService.getRecipeById(id);
            response = ResponseEntity.ok(recipe);
        } catch (RecipeNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Update recipe by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe updated"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Recipe not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipeById(@PathVariable Integer id, @RequestBody Recipe recipeDetails) {
        ResponseEntity<Recipe> response;
        try {
            Recipe updatedRecipe = recipeService.updateRecipe(id, recipeDetails);
            response = ResponseEntity.ok(updatedRecipe);
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (RecipeNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Delete recipe by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe deleted"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Recipe not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Integer id) {
        ResponseEntity<Void> response;
        try {
            recipeService.deleteRecipe(id);
            response = ResponseEntity.ok().build();
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (RecipeNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }
}