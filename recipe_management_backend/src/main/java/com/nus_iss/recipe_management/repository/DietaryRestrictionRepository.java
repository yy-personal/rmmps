package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.DietaryRestriction;
import com.nus_iss.recipe_management.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DietaryRestrictionRepository extends JpaRepository<DietaryRestriction, Integer> {}
