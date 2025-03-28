package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nus_iss.recipe_management.model.*;

import java.util.List;

public interface RecipeDietaryRestrictionMappingRepository extends JpaRepository<RecipeDietaryRestrictionMapping, RecipeDietaryRestrictionMappingId> {
    List<RecipeDietaryRestrictionMapping> findByRecipeRecipeId(Integer recipeId);
    List<RecipeDietaryRestrictionMapping> findByIdRecipeIdAndIdDietaryRestrictionIdIn(Integer recipeId, List<Integer> dietaryRestrictionIds);
}
