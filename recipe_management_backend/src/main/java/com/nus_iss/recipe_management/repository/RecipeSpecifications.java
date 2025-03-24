package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.dto.RecipeSearchDTO;
import com.nus_iss.recipe_management.model.DifficultyLevel;
import com.nus_iss.recipe_management.model.Recipe;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class RecipeSpecifications {

    public static Specification<Recipe> withSearchCriteria(RecipeSearchDTO criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always return distinct results to avoid duplicates due to joins
            query.distinct(true);

            // Title search
            if (criteria.getTitle() != null && !criteria.getTitle().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + criteria.getTitle().toLowerCase() + "%"
                ));
            }

            // Difficulty level search
            if (criteria.getDifficultyLevel() != null && !criteria.getDifficultyLevel().trim().isEmpty()) {
                try {
                    DifficultyLevel level = DifficultyLevel.valueOf(criteria.getDifficultyLevel().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("difficultyLevel"), level));
                } catch (IllegalArgumentException e) {
                    // Invalid difficulty level, ignore this criterion
                }
            }

            // Total time range search (prep + cooking)
            if (criteria.getMinTotalTime() != null) {
                predicates.add(criteriaBuilder.ge(
                        criteriaBuilder.sum(root.get("preparationTime"), root.get("cookingTime")),
                        criteria.getMinTotalTime()
                ));
            }

            if (criteria.getMaxTotalTime() != null) {
                predicates.add(criteriaBuilder.le(
                        criteriaBuilder.sum(root.get("preparationTime"), root.get("cookingTime")),
                        criteria.getMaxTotalTime()
                ));
            }

            // User/Owner search
            if (criteria.getUserId() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("user").get("userId"),
                        criteria.getUserId()
                ));
            }

            // Servings search
            if (criteria.getServings() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("servings"),
                        criteria.getServings()
                ));
            }

            // Ingredient search
            if (criteria.getIngredient() != null && !criteria.getIngredient().trim().isEmpty()) {
                Join<Object, Object> ingredientsJoin = root.join("ingredients", JoinType.LEFT);
                Join<Object, Object> ingredientJoin = ingredientsJoin.join("ingredient", JoinType.LEFT);

                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(ingredientJoin.get("name")),
                        "%" + criteria.getIngredient().toLowerCase() + "%"
                ));
            }

            // Meal type search
            if (criteria.getMealTypeIds() != null && !criteria.getMealTypeIds().isEmpty()) {
                Join<Object, Object> mealTypesJoin = root.join("mealTypes", JoinType.LEFT);
                predicates.add(mealTypesJoin.get("mealTypeId").in(criteria.getMealTypeIds()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}