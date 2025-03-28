package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.exception.RecipeAlreadyInMealPlanException;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.MealPlan;
import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;
import com.nus_iss.recipe_management.service.MealPlanService;
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
@RequestMapping("/api/mealPlans")
@RequiredArgsConstructor
@Tag(name = "Meal Plan Controller")
public class MealPlanController {
    private final MealPlanService mealPlanService;

    @Operation(summary = "Create a new meal plan")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meal plan created successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/create")
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan mealPlan) {
        ResponseEntity<MealPlan> response;
        try {
            MealPlan createdMealPlan = mealPlanService.createMealPlan(mealPlan);
            response = ResponseEntity.ok(createdMealPlan);
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Add recipe to meal plan")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe added to meal plan"),
            @ApiResponse(responseCode = "404", description = "Meal plan or recipe not found"),
            @ApiResponse(responseCode = "409", description = "Recipe already in meal plan"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/add-recipe")
    public ResponseEntity<MealPlanRecipeMapping> addRecipeToMealPlan(
            @RequestParam Integer mealPlanId,
            @RequestParam Integer recipeId) {

        ResponseEntity<MealPlanRecipeMapping> response;
        try {
            MealPlanRecipeMapping createdMapping = mealPlanService.addMealPlanRecipeMapping(mealPlanId, recipeId);
            response = ResponseEntity.ok(createdMapping);
        } catch (MealPlanNotFoundException | RecipeNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (RecipeAlreadyInMealPlanException ex) {
            response = ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Get all meal plans")
    @ApiResponse(responseCode = "200", description = "List of meal plans retrieved")
    @GetMapping
    public ResponseEntity<List<MealPlan>> getAllMealPlans() {
        List<MealPlan> mealPlans = mealPlanService.getAllMealPlans();
        return ResponseEntity.ok(mealPlans);
    }

    @Operation(summary = "Get meal plan by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meal plan found"),
            @ApiResponse(responseCode = "404", description = "Meal plan not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MealPlan> getMealPlanById(@PathVariable Integer id) {
        ResponseEntity<MealPlan> response;
        try {
            MealPlan mealPlan = mealPlanService.getMealPlanById(id);
            response = ResponseEntity.ok(mealPlan);
        } catch (MealPlanNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Update meal plan by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meal plan updated"),
            @ApiResponse(responseCode = "404", description = "Meal plan not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MealPlan> updateMealPlanById(@PathVariable Integer id, @RequestBody MealPlan mealPlanDetails) {
        ResponseEntity<MealPlan> response;
        try {
            MealPlan updatedMealPlan = mealPlanService.updateMealPlan(id, mealPlanDetails);
            // print updatedMealPlan to console
            System.out.println("Updated Meal Plan: " + updatedMealPlan);
            response = ResponseEntity.ok(updatedMealPlan);
        } catch (MealPlanNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Delete meal plan by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meal plan deleted"),
            @ApiResponse(responseCode = "404", description = "Meal plan not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<MealPlan> deleteMealPlan(@PathVariable Integer id) {
        ResponseEntity<MealPlan> response;
        try {
            mealPlanService.deleteMealPlan(id);
            response = ResponseEntity.ok().build();
        } catch (MealPlanNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @Operation(summary = "Remove recipe from meal plan")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recipe removed from meal plan"),
            @ApiResponse(responseCode = "404", description = "Meal plan or recipe mapping not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping
    public ResponseEntity<String> removeRecipeFromMealPlan(
            @RequestParam Integer mealPlanId,
            @RequestParam Integer recipeId) {

        ResponseEntity<String> response;
        try {
            mealPlanService.deleteMealPlanRecipeMapping(mealPlanId, recipeId);
            response = ResponseEntity.ok("Recipe removed from meal plan successfully.");
        } catch (MealPlanNotFoundException | RecipeNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (RecipeAlreadyInMealPlanException ex) {
            response = ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }
}