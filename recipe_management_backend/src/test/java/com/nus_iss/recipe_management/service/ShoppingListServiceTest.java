package com.nus_iss.recipe_management.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.impl.ShoppingListServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class ShoppingListServiceTest {

    @Mock
    private ShoppingListRepository shoppingListRepository;

    @Mock
    private ShoppingListItemRepository shoppingListItemRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private RecipeIngredientsMappingRepository recipeIngredientsRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private ShoppingListServiceImpl shoppingListService;

    private User user;
    private ShoppingList shoppingList;

    @BeforeEach
    void setUp() {
        // Create test user
        user = new User();
        user.setUserId(1);
        user.setEmail("test@example.com");

        // Create test shopping list
        shoppingList = new ShoppingList();
        shoppingList.setShoppingListId(1);
        shoppingList.setTitle("Test Shopping List");
        shoppingList.setUser(user);
        shoppingList.setItems(new HashSet<>());

        // Set up security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("test@example.com");
    }

    @Test
    void getAllShoppingLists_ShouldReturnUserShoppingLists() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(shoppingListRepository.findByUserUserId(1)).thenReturn(List.of(shoppingList));

        // Act
        List<ShoppingList> results = shoppingListService.getAllShoppingLists();

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test Shopping List", results.get(0).getTitle());
    }
}