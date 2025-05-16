package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.dto.RecipeSearchDTO;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.repository.RecipeSpecifications;
import com.nus_iss.recipe_management.service.RecipeSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeSearchServiceImpl implements RecipeSearchService {

    private final RecipeRepository recipeRepository;

    @Override
    public Page<Recipe> searchRecipes(RecipeSearchDTO searchCriteria, Pageable pageable) {
        // Log without including the full search criteria object
        log.info("Processing recipe search with {} filters", getFilterCount(searchCriteria));

        Specification<Recipe> spec = RecipeSpecifications.withSearchCriteria(searchCriteria);
        return recipeRepository.findAll(spec, pageable);
    }

    /**
     * Counts the number of active filters in the search criteria
     * @param criteria The search criteria
     * @return The number of active filters
     */
    private int getFilterCount(RecipeSearchDTO criteria) {
        int count = 0;

        if (criteria.getTitle() != null && !criteria.getTitle().trim().isEmpty()) count++;
        if (criteria.getDifficultyLevel() != null && !criteria.getDifficultyLevel().trim().isEmpty()) count++;
        if (criteria.getMaxTotalTime() != null) count++;
        if (criteria.getMinTotalTime() != null) count++;
        if (criteria.getUserId() != null) count++;
        if (criteria.getUsername() != null && !criteria.getUsername().trim().isEmpty()) count++;
        if (criteria.getServings() != null) count++;
        if (criteria.getIngredientIds() != null && !criteria.getIngredientIds().isEmpty()) count++;
        if (criteria.getMealTypeIds() != null && !criteria.getMealTypeIds().isEmpty()) count++;

        return count;
    }
}