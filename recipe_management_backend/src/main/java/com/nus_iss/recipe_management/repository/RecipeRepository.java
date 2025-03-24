package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nus_iss.recipe_management.model.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {
    @Query("""
        SELECT r FROM Recipe r
        JOIN RecipeDietaryRestrictionMapping rdm ON r.recipeId = rdm.recipe.recipeId
        JOIN DietaryRestriction dr ON rdm.dietaryRestriction.dietaryRestrictionId = dr.dietaryRestrictionId
        WHERE dr IN (
            SELECT ur FROM User u 
            JOIN u.dietaryRestrictions ur
            WHERE u.userId = :userId
        )
        GROUP BY r
        HAVING COUNT(DISTINCT dr) = (
            SELECT COUNT(ur) FROM User u 
            JOIN u.dietaryRestrictions ur 
            WHERE u.userId = :userId
        )
    """)
    List<Recipe> findRecommendedRecipes(@Param("userId") Integer userId);

    List<Recipe> findByCreatedAtAfter(LocalDateTime dateTime);
}