package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.service.RecipeRecommendationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recipe Recommendation Controller")
public class RecipeRecommendationController {

    private final RecipeRecommendationService recommendationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Recipe>> getRecommendations(@PathVariable Integer userId) {
        List<Recipe> recipes = recommendationService.getRecommendedRecipes(userId);
        return ResponseEntity.ok(recipes);
    }
}