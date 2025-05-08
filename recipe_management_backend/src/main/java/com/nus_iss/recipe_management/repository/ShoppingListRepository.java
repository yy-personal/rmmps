package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.ShoppingList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Integer> {
    // Find all shopping lists for a specific user
    List<ShoppingList> findByUserUserId(Integer userId);

    // Find all shopping lists for a specific user with pagination
    Page<ShoppingList> findByUserUserId(Integer userId, Pageable pageable);
}