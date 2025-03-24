package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.RecipeSearchCriteriaDTO;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search Controller")
public class SearchController {
    private final SearchService searchService;

    @Operation(summary = "Search recipes by criteria")
    @PostMapping("/recipes")
    public ResponseEntity<List<Recipe>> searchRecipes(@RequestBody RecipeSearchCriteriaDTO searchCriteria) {
        List<Recipe> results = searchService.searchRecipes(searchCriteria);
        return ResponseEntity.ok(results);
    }
}