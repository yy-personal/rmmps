package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.exception.ResourceNotFoundException;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.ShoppingListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShoppingListServiceImpl implements ShoppingListService {

    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeIngredientsMappingRepository recipeIngredientsRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ShoppingList createShoppingList(String title, List<Integer> recipeIds) {
        // Get the currently authenticated user
        User user = getCurrentUser();

        // Create new shopping list
        ShoppingList shoppingList = new ShoppingList();
        shoppingList.setTitle(title);
        shoppingList.setUser(user);

        // Save the shopping list to get an ID
        shoppingList = shoppingListRepository.save(shoppingList);

        // Process each recipe
        if (recipeIds != null && !recipeIds.isEmpty()) {
            for (Integer recipeId : recipeIds) {
                Recipe recipe = recipeRepository.findById(recipeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

                // Get ingredient mappings for this recipe
                List<RecipeIngredientsMapping> ingredientMappings =
                        recipeIngredientsRepository.findByRecipeRecipeId(recipeId);

                // Add each ingredient to the shopping list
                for (RecipeIngredientsMapping mapping : ingredientMappings) {
                    Ingredient ingredient = mapping.getIngredient();

                    // Create shopping list item
                    ShoppingListItem item = new ShoppingListItem(
                            shoppingList,
                            ingredient,
                            mapping.getQuantity(),
                            recipe,
                            recipe.getServings()
                    );

                    // Set purchased to false by default
                    item.setPurchased(false);

                    shoppingList.addItem(item);
                }
            }

            // Save the updated shopping list with items
            shoppingList = shoppingListRepository.save(shoppingList);
        }

        return shoppingList;
    }

    @Override
    public ShoppingList getShoppingListById(Integer id) {
        ShoppingList shoppingList = shoppingListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + id));

        // Verify the current user owns this shopping list
        verifyOwnership(shoppingList);

        return shoppingList;
    }

    @Override
    public List<ShoppingList> getAllShoppingLists() {
        // Get the currently authenticated user
        User user = getCurrentUser();

        return shoppingListRepository.findByUserUserId(user.getUserId());
    }

    @Override
    public Page<ShoppingList> getAllShoppingLists(Pageable pageable) {
        // Get the currently authenticated user
        User user = getCurrentUser();

        return shoppingListRepository.findByUserUserId(user.getUserId(), pageable);
    }

    @Override
    @Transactional
    public void deleteShoppingList(Integer id) {
        ShoppingList shoppingList = shoppingListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + id));

        // Verify the current user owns this shopping list
        verifyOwnership(shoppingList);

        shoppingListRepository.delete(shoppingList);
    }

    @Override
    @Transactional
    public ShoppingListItem updateItemPurchasedStatus(Integer shoppingListId, Integer ingredientId, Boolean purchased) {
        // Create the composite key
        ShoppingListItemId id = new ShoppingListItemId(shoppingListId, ingredientId);

        // Find the item
        ShoppingListItem item = shoppingListItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list item not found"));

        // Verify the current user owns the shopping list
        verifyOwnership(item.getShoppingList());

        // Update purchased status
        item.setPurchased(purchased);

        return shoppingListItemRepository.save(item);
    }

    /**
     * Get the currently authenticated user
     * @return The current user
     * @throws AuthenticationCredentialsNotFoundException if not authenticated
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new AuthenticationCredentialsNotFoundException("Not authenticated");
        }

        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("User not found"));
    }

    /**
     * Verify the current user owns the shopping list
     * @param shoppingList The shopping list to check
     * @throws AccessDeniedException if the current user doesn't own the shopping list
     */
    private void verifyOwnership(ShoppingList shoppingList) {
        User currentUser = getCurrentUser();

        if (!Objects.equals(shoppingList.getUser().getUserId(), currentUser.getUserId())) {
            throw new AccessDeniedException("You don't have permission to access this shopping list");
        }
    }
}