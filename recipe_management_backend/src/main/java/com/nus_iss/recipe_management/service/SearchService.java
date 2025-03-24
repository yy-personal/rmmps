package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.dto.RecipeSearchCriteriaDTO;
import com.nus_iss.recipe_management.model.Recipe;
import java.util.List;

public interface SearchService {
    List<Recipe> searchRecipes(RecipeSearchCriteriaDTO searchCriteria);
}