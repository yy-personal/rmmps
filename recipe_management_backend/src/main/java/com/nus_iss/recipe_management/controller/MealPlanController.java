package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.exception.MealPlanNotFoundException;
import com.nus_iss.recipe_management.model.MealPlan;
import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;
import com.nus_iss.recipe_management.service.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        MealPlan createdMealPlan = mealPlanService.createMealPlan(mealPlan);
        return ResponseEntity.ok(createdMealPlan);
    }

    // Add a recipe to a meal plan
    @PostMapping("/add-recipe")
    public ResponseEntity<MealPlanRecipeMapping> addRecipeToMealPlan(
            @RequestParam Integer mealPlanId,
            @RequestParam Integer recipeId,
            @RequestParam Integer userId) {

        MealPlanRecipeMapping createdMealPlanRecipeMapping = mealPlanService.addMealPlanRecipeMapping(mealPlanId, recipeId);
        return ResponseEntity.ok(createdMealPlanRecipeMapping);
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
        } catch (Exception ex) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    // Delete a meal plan by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlan(@PathVariable Integer id) {
        mealPlanService.deleteMealPlan(id);
        return ResponseEntity.noContent().build();
    }

//    @DeleteMapping("/{mealPlanId}/recipes/{recipeId}")
//    public ResponseEntity<String> removeRecipeFromMealPlan(@PathVariable Integer mealPlanId,
//                                                           @PathVariable Integer recipeId) {
//
//        return ResponseEntity.ok("Recipe removed from Meal Plan");
//    }

    // Remove a recipe from a meal plan
    @DeleteMapping
    public ResponseEntity<String> removeRecipeFromMealPlan(
            @RequestParam Integer mealPlanId,
            @RequestParam Integer recipeId) {

        mealPlanService.deleteMealPlanRecipeMapping(mealPlanId, recipeId);
        return ResponseEntity.ok("Recipe removed from meal plan successfully.");
    }
}