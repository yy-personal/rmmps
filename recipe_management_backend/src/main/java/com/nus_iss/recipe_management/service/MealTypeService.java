package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.MealType;
import java.util.List;
import java.util.Optional;

public interface MealTypeService {
    MealType createMealType(MealType mealType);
    List<MealType> getAllMealTypes();
    MealType getMealTypeById(Integer id);
    Optional<MealType> findByName(String name);
    void deleteMealType(Integer id);
}