package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealPlanRepository extends JpaRepository<MealPlan, Integer> {}
