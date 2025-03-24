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
        log.info("Searching recipes with criteria: {}", searchCriteria);

        Specification<Recipe> spec = RecipeSpecifications.withSearchCriteria(searchCriteria);
        return recipeRepository.findAll(spec, pageable);
    }
}