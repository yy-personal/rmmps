package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MealTypeRepository extends JpaRepository<MealType, Integer> {
    Optional<MealType> findByName(String name);
}