package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.MealPlanRecipeMapping;
import com.nus_iss.recipe_management.model.MealPlanRecipeMappingId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealPlanRecipeMappingRepository extends JpaRepository<MealPlanRecipeMapping, MealPlanRecipeMappingId> {}
