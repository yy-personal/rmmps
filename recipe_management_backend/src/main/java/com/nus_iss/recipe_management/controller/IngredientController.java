package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.model.Ingredient;
import com.nus_iss.recipe_management.service.IngredientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
@Tag(name = "Ingredient Controller")
public class IngredientController {
    private final IngredientService ingredientService;

    @Operation(summary = "Create a new ingredient")
    @ApiResponse(responseCode = "200", description = "Ingredient created successfully")
    @PostMapping
    public ResponseEntity<Ingredient> createIngredient(@RequestBody Ingredient ingredient) {
        Ingredient createdIngredient = ingredientService.createIngredient(ingredient);
        return ResponseEntity.ok(createdIngredient);
    }

    @Operation(summary = "Get all ingredients")
    @ApiResponse(responseCode = "200", description = "List of ingredients retrieved")
    @GetMapping
    public ResponseEntity<List<Ingredient>> getAllIngredients() {
        List<Ingredient> ingredients = ingredientService.getAllIngredients();
        return ResponseEntity.ok(ingredients);
    }

    @Operation(summary = "Get ingredient by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ingredient found"),
            @ApiResponse(responseCode = "404", description = "Ingredient not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> getIngredientById(@PathVariable Integer id) {
        Ingredient ingredient = ingredientService.getIngredientById(id);
        return ingredient != null ? ResponseEntity.ok(ingredient) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Delete ingredient by ID")
    @ApiResponse(responseCode = "204", description = "Ingredient deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Integer id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }
}