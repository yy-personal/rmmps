package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.RecipeIngredientDTO;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.service.IngredientService;
import com.nus_iss.recipe_management.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipe Controller")
@Slf4j

public class RecipeController {
    private final RecipeService recipeService;
    private final IngredientService ingredientService;

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

    @Operation(summary = "Get recipe ingredients")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ingredients retrieved"),
            @ApiResponse(responseCode = "404", description = "Recipe not found")
    })
    @GetMapping("/{id}/ingredients")
    public ResponseEntity<List<RecipeIngredientDTO>> getRecipeIngredients(@PathVariable Integer id) {
        try {
            Recipe recipe = recipeService.getRecipeById(id);

            List<RecipeIngredientDTO> ingredients = recipe.getIngredients().stream()
                    .map(mapping -> new RecipeIngredientDTO(
                            mapping.getIngredient().getIngredientId(),
                            mapping.getIngredient().getName(),
                            mapping.getQuantity()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ingredients);
        } catch (RecipeNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Update recipe ingredients")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ingredients updated"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Recipe not found")
    })
    @PutMapping("/{id}/ingredients")
    public ResponseEntity<?> updateRecipeIngredients(
            @PathVariable Integer id,
            @RequestBody List<RecipeIngredientDTO> ingredientDTOs) {

        try {
            // Get the existing recipe
            Recipe recipe = recipeService.getRecipeById(id);

            // Create a set of ingredient mappings from the DTOs
            Set<RecipeIngredientsMapping> ingredientMappings = new HashSet<>();

            for (RecipeIngredientDTO dto : ingredientDTOs) {
                // Skip invalid DTOs
                if ((dto.getIngredientId() == null && (dto.getName() == null || dto.getName().isEmpty())) ||
                        dto.getQuantity() == null) {
                    continue;
                }

                Ingredient ingredient = new Ingredient();

                // If ingredientId is provided, use it
                if (dto.getIngredientId() != null) {
                    ingredient.setIngredientId(dto.getIngredientId());
                } else {
                    // Otherwise use the name
                    ingredient.setName(dto.getName());
                }

                // Create the mapping
                RecipeIngredientsMapping mapping = new RecipeIngredientsMapping();
                mapping.setIngredient(ingredient);
                mapping.setQuantity(dto.getQuantity());

                ingredientMappings.add(mapping);
            }

            // Set the ingredients on the recipe
            recipe.setIngredients(ingredientMappings);

            // Update the recipe
            Recipe updatedRecipe = recipeService.updateRecipe(id, recipe);

            // Map the result to DTOs for response
            List<RecipeIngredientDTO> resultDTOs = updatedRecipe.getIngredients().stream()
                    .map(mapping -> new RecipeIngredientDTO(
                            mapping.getIngredient().getIngredientId(),
                            mapping.getIngredient().getName(),
                            mapping.getQuantity()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(resultDTOs);

        } catch (AccessDeniedException ex) {
            log.error("Access denied updating recipe ingredients: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "You do not have permission to update this recipe"));
        } catch (RecipeNotFoundException ex) {
            log.error("Recipe not found: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error updating recipe ingredients: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while updating ingredients: " + ex.getMessage()));
        }
    }
}