package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nus_iss.recipe_management.model.*;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeIngredientsMappingRepository extends JpaRepository<RecipeIngredientsMapping, RecipeIngredientsMappingId> {
    List<RecipeIngredientsMapping> findByRecipeId(Integer recipeId);

    @Modifying
    @Query("DELETE FROM RecipeIngredientsMapping rim WHERE rim.id.recipeId = :recipeId")
    void deleteAllByRecipeId(@Param("recipeId") Integer recipeId);
}