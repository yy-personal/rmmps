package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nus_iss.recipe_management.model.*;
import java.util.List;

public interface RecipeIngredientsMappingRepository extends JpaRepository<RecipeIngredientsMapping, RecipeIngredientsMappingId> {
    List<RecipeIngredientsMapping> findByRecipeRecipeId(Integer recipeId);
}