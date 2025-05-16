package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.nus_iss.recipe_management.model.Ingredient;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {
    Optional<Ingredient> findByName(String name);

    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) = LOWER(:name)")
    Optional<Ingredient> findByNameIgnoreCase(@Param("name") String name);
}