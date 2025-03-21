package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.RecipeDTO;
import com.nus_iss.recipe_management.dto.RecipeIngredientDTO;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.service.IngredientService;
import com.nus_iss.recipe_management.service.RecipeService;
import com.nus_iss.recipe_management.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipe Controller")
public class RecipeController {
    private final RecipeService recipeService;
    private final IngredientService ingredientService;
    private final UserService userService;

    @Operation(summary = "Create a new recipe")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe created successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody RecipeDTO recipeDTO) {
        ResponseEntity<Recipe> response;
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userService.findByEmail(username)
                    .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("User not found"));

            Recipe createdRecipe = recipeService.createRecipeWithIngredients(recipeDTO, user);
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
    public ResponseEntity<Recipe> updateRecipeById(@PathVariable Integer id, @RequestBody RecipeDTO recipeDTO) {
        ResponseEntity<Recipe> response;
        try {
            Recipe updatedRecipe = recipeService.updateRecipeWithIngredients(id, recipeDTO);
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
    public ResponseEntity<Recipe> updateRecipeIngredients(
            @PathVariable Integer id,
            @RequestBody List<RecipeIngredientDTO> ingredientDTOs) {

        try {
            // Create a RecipeDTO with only ingredients set
            RecipeDTO recipeDTO = new RecipeDTO();
            recipeDTO.setIngredients(ingredientDTOs);

            // Update using the existing method
            Recipe updatedRecipe = recipeService.updateRecipeWithIngredients(id, recipeDTO);
            return ResponseEntity.ok(updatedRecipe);
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (RecipeNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }
}