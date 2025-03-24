package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.RecipeSearchDTO;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.service.RecipeSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes/search")
@RequiredArgsConstructor
@Tag(name = "Recipe Search Controller")
@Slf4j
public class RecipeSearchController {

    private final RecipeSearchService recipeSearchService;

    @Operation(summary = "Search recipes with multiple criteria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid search criteria"),
            @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping
    public ResponseEntity<Page<Recipe>> searchRecipes(@RequestBody RecipeSearchDTO searchCriteria) {
        // Safely log search parameters without logging the entire object
        log.info("Search request received - title: '{}', difficulty: '{}', page: {}, sort: {}",
                sanitizeForLog(searchCriteria.getTitle()),
                sanitizeForLog(searchCriteria.getDifficultyLevel()),
                searchCriteria.getPage() != null ? searchCriteria.getPage() : 0,
                sanitizeForLog(searchCriteria.getSortBy()));

        // Default values if null
        int page = searchCriteria.getPage() != null ? searchCriteria.getPage() : 0;
        int size = searchCriteria.getSize() != null ? searchCriteria.getSize() : 10;

        // Create sort direction
        Sort.Direction direction = Sort.Direction.ASC;
        if (searchCriteria.getSortDirection() != null &&
                searchCriteria.getSortDirection().equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }

        // Create sort
        String sortBy = searchCriteria.getSortBy() != null ? searchCriteria.getSortBy() : "title";
        Sort sort = Sort.by(direction, sortBy);

        // Create pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        try {
            Page<Recipe> results = recipeSearchService.searchRecipes(searchCriteria, pageable);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            // Safely log the error message
            log.error("Invalid search criteria: {}", sanitizeForLog(e.getMessage()));
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            // Safely log the error message
            log.error("Error occurred during search: {}", sanitizeForLog(e.getMessage()));
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Sanitizes a string for safe logging to prevent log injection
     * @param input The input string to sanitize
     * @return A sanitized version of the input string
     */
    private String sanitizeForLog(String input) {
        if (input == null) return "null";
        String sanitized = input.replaceAll("[^a-zA-Z0-9\\s.,;:!?'\"()-]", "_");
        return sanitized.substring(0, Math.min(sanitized.length(), 50));
    }
}