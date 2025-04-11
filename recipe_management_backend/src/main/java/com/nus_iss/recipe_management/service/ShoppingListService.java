package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.ShoppingList;
import com.nus_iss.recipe_management.model.ShoppingListItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ShoppingListService {
    /**
     * Create a new shopping list
     * @param title The title of the shopping list
     * @param recipeIds The IDs of recipes to include
     * @return The created shopping list
     */
    ShoppingList createShoppingList(String title, List<Integer> recipeIds);

    /**
     * Get a shopping list by ID
     * @param id The ID of the shopping list
     * @return The shopping list
     */
    ShoppingList getShoppingListById(Integer id);

    /**
     * Get all shopping lists for the currently authenticated user
     * @return List of shopping lists
     */
    List<ShoppingList> getAllShoppingLists();

    /**
     * Get all shopping lists for the currently authenticated user with pagination
     * @param pageable Pagination information
     * @return Page of shopping lists
     */
    Page<ShoppingList> getAllShoppingLists(Pageable pageable);

    /**
     * Delete a shopping list
     * @param id The ID of the shopping list to delete
     */
    void deleteShoppingList(Integer id);

    /**
     * Update the purchased status of a shopping list item
     * @param shoppingListId The shopping list ID
     * @param ingredientId The ingredient ID
     * @param purchased The new purchased status
     * @return The updated shopping list item
     */
    ShoppingListItem updateItemPurchasedStatus(Integer shoppingListId, Integer ingredientId, Boolean purchased);
}