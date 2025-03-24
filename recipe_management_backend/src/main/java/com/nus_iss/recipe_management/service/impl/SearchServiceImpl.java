package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.dto.RecipeSearchCriteriaDTO;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.service.SearchService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {
    @PersistenceContext
    private EntityManager entityManager;

    private final RecipeRepository recipeRepository;

    @Override
    public List<Recipe> searchRecipes(RecipeSearchCriteriaDTO criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Recipe> query = cb.createQuery(Recipe.class);
        Root<Recipe> recipe = query.from(Recipe.class);

        List<Predicate> predicates = new ArrayList<>();

        // Apply title filter
        if (criteria.getTitle() != null && !criteria.getTitle().isEmpty()) {
            predicates.add(cb.like(cb.lower(recipe.get("title")), "%" + criteria.getTitle().toLowerCase() + "%"));
        }

        // Apply difficulty level filter
        if (criteria.getDifficultyLevel() != null && !criteria.getDifficultyLevel().isEmpty()) {
            predicates.add(cb.equal(recipe.get("difficultyLevel"), criteria.getDifficultyLevel()));
        }

        // Apply max preparation time filter
        if (criteria.getMaxPrepTime() != null) {
            predicates.add(cb.lessThanOrEqualTo(recipe.get("preparationTime"), criteria.getMaxPrepTime()));
        }

        // Apply max cooking time filter
        if (criteria.getMaxCookTime() != null) {
            predicates.add(cb.lessThanOrEqualTo(recipe.get("cookingTime"), criteria.getMaxCookTime()));
        }

        // Apply servings filter
        if (criteria.getServings() != null) {
            predicates.add(cb.equal(recipe.get("servings"), criteria.getServings()));
        }

        // Apply meal type filter
        if (criteria.getMealTypeIds() != null && !criteria.getMealTypeIds().isEmpty()) {
            Join<Object, Object> mealTypeJoin = recipe.join("mealTypes");
            predicates.add(mealTypeJoin.get("mealTypeId").in(criteria.getMealTypeIds()));
        }

        // Apply ingredients filter
        if (criteria.getIngredients() != null && !criteria.getIngredients().isEmpty()) {
            List<Predicate> ingredientPredicates = new ArrayList<>();

            for (String ingredient : criteria.getIngredients()) {
                Join<Object, Object> ingredientsJoin = recipe.join("ingredients");
                Join<Object, Object> ingredientJoin = ingredientsJoin.join("ingredient");

                Predicate ingredientNameMatch = cb.like(
                        cb.lower(ingredientJoin.get("name")),
                        "%" + ingredient.toLowerCase() + "%"
                );
                ingredientPredicates.add(ingredientNameMatch);
            }

            predicates.add(cb.or(ingredientPredicates.toArray(new Predicate[0])));
        }

        query.where(predicates.toArray(new Predicate[0]));
        query.distinct(true);

        return entityManager.createQuery(query).getResultList();
    }
}