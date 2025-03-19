package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.model.MealType;
import com.nus_iss.recipe_management.service.MealTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mealtypes")
@RequiredArgsConstructor
@Tag(name = "Meal Type Controller")
public class MealTypeController {
    private final MealTypeService mealTypeService;

    @Operation(summary = "Create a new meal type")
    @ApiResponse(responseCode = "200", description = "Meal type created successfully")
    @PostMapping
    public ResponseEntity<MealType> createMealType(@RequestBody MealType mealType) {
        MealType createdMealType = mealTypeService.createMealType(mealType);
        return ResponseEntity.ok(createdMealType);
    }

    @Operation(summary = "Get all meal types")
    @ApiResponse(responseCode = "200", description = "List of meal types retrieved")
    @GetMapping
    public ResponseEntity<List<MealType>> getAllMealTypes() {
        List<MealType> mealTypes = mealTypeService.getAllMealTypes();
        return ResponseEntity.ok(mealTypes);
    }

    @Operation(summary = "Get meal type by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meal type found"),
            @ApiResponse(responseCode = "404", description = "Meal type not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MealType> getMealTypeById(@PathVariable Integer id) {
        MealType mealType = mealTypeService.getMealTypeById(id);
        return mealType != null ? ResponseEntity.ok(mealType) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Delete meal type by ID")
    @ApiResponse(responseCode = "204", description = "Meal type deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealType(@PathVariable Integer id) {
        mealTypeService.deleteMealType(id);
        return ResponseEntity.noContent().build();
    }
}