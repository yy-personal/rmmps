package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.dto.RecipeSearchDTO;
import com.nus_iss.recipe_management.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RecipeSearchService {
    /**
     * Search for recipes based on multiple criteria
     *
     * @param searchCriteria The search criteria
     * @param pageable Pagination parameters
     * @return Page of Recipe objects matching the criteria
     */
    Page<Recipe> searchRecipes(RecipeSearchDTO searchCriteria, Pageable pageable);
}