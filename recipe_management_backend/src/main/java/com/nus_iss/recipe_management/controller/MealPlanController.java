package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.exception.RecipeAlreadyInMealPlanException;
import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.MealPlan;
import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;
import com.nus_iss.recipe_management.service.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mealPlans")
@RequiredArgsConstructor
public class MealPlanController {
    private final MealPlanService mealPlanService;

    // Create a new meal plan
    @PostMapping("/create")
    public ResponseEntity<MealPlan> createMealPlan(@RequestBody MealPlan mealPlan) {
        ResponseEntity<MealPlan> response;
        try {
            MealPlan createdMealPlan = mealPlanService.createMealPlan(mealPlan);
            response =  ResponseEntity.ok(createdMealPlan);
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    // Add a recipe to a meal plan
    @PostMapping("/add-recipe")
    public ResponseEntity<MealPlanRecipeMapping> addRecipeToMealPlan(
            @RequestParam Integer mealPlanId,
            @RequestParam Integer recipeId) {

        ResponseEntity<MealPlanRecipeMapping> response;
        try {
            MealPlanRecipeMapping createdMealPlanRecipeMapping = mealPlanService.addMealPlanRecipeMapping(mealPlanId, recipeId);
            response = ResponseEntity.ok(createdMealPlanRecipeMapping);
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

    // Get all meal plans
    @GetMapping
    public ResponseEntity<List<MealPlan>> getAllMealPlans() {
        List<MealPlan> mealPlans = mealPlanService.getAllMealPlans();
        return ResponseEntity.ok(mealPlans);
    }

    // Get a meal plan by ID
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

    // Update a meal plan by ID
    @PutMapping("/{id}")
    public ResponseEntity<MealPlan> updateMealPlanById(@PathVariable Integer id, @RequestBody MealPlan mealPlanDetails) {
        ResponseEntity<MealPlan> response;
        try {
            MealPlan updatedMealPlan = mealPlanService.updateMealPlan(id, mealPlanDetails);
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

    // Delete a meal plan by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<MealPlan> deleteMealPlan(@PathVariable Integer id) {
        ResponseEntity<MealPlan> response;
        try {
            mealPlanService.deleteMealPlan(id);
            response = ResponseEntity.noContent().build();
        } catch (MealPlanNotFoundException ex) {
            response = ResponseEntity.notFound().build();
        } catch (AccessDeniedException ex) {
            response = ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }

        return response;
    }

    // Remove a recipe from a meal plan
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