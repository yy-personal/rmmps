package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.ShoppingListItem;
import com.nus_iss.recipe_management.model.ShoppingListItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, ShoppingListItemId> {
    // Find all items for a specific shopping list
    List<ShoppingListItem> findByShoppingListShoppingListId(Integer shoppingListId);

    // Find all items for a specific shopping list and recipe
    List<ShoppingListItem> findByShoppingListShoppingListIdAndRecipeRecipeId(Integer shoppingListId, Integer recipeId);
}