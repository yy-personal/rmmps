package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.exception.RecipeNotFoundException;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.model.DifficultyLevel;
import com.nus_iss.recipe_management.repository.MealPlanRecipeMappingRepository;
import com.nus_iss.recipe_management.repository.MealPlanRepository;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.service.impl.RecipeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private UserDetails userDetails;

    @Mock
    private RecipeRepository recipeRepository;

    @InjectMocks
    private RecipeServiceImpl recipeService;

    private Recipe testRecipe;
    private Recipe updatedRecipe;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setUserId(1);

        // Set necessary user properties

        // Create test recipe
        testRecipe = new Recipe();
        testRecipe.setRecipeId(1);
        testRecipe.setUser(testUser);
        testRecipe.setTitle("Test Recipe");
        testRecipe.setPreparationTime(30);
        testRecipe.setCookingTime(45);
        testRecipe.setDifficultyLevel(DifficultyLevel.MEDIUM);
        testRecipe.setServings(4);
        testRecipe.setSteps("1. Test step 1\n2. Test step 2");
        // createdAt is automatically set by the entity

        updatedRecipe = new Recipe();
        updatedRecipe.setServings(2);
        updatedRecipe.setSteps("1. Test step 1\n2. Test step 2\n3. Test step 3");
        updatedRecipe.setTitle("Updated Recipe");
        updatedRecipe.setCookingTime(25);
        updatedRecipe.setDifficultyLevel(DifficultyLevel.MEDIUM);
        updatedRecipe.setPreparationTime(15);
    }

    @Test
    void createRecipe_ShouldReturnCreatedRecipe() {
        // Arrange
        when(recipeRepository.save(any(Recipe.class))).thenReturn(testRecipe);

        // Act
        Recipe createdRecipe = recipeService.createRecipe(testRecipe);

        // Assert
        assertNotNull(createdRecipe);
        assertEquals(testRecipe.getRecipeId(), createdRecipe.getRecipeId());
        assertEquals(testRecipe.getTitle(), createdRecipe.getTitle());
        assertEquals(testRecipe.getPreparationTime(), createdRecipe.getPreparationTime());
        assertEquals(testRecipe.getCookingTime(), createdRecipe.getCookingTime());
        assertEquals(testRecipe.getDifficultyLevel(), createdRecipe.getDifficultyLevel());
        assertEquals(testRecipe.getServings(), createdRecipe.getServings());
        assertEquals(testRecipe.getSteps(), createdRecipe.getSteps());
        verify(recipeRepository, times(1)).save(any(Recipe.class));
    }

    @Test
    void getAllRecipes_ShouldReturnListOfRecipes() {
        // Arrange
        List<Recipe> recipeList = new ArrayList<>();
        recipeList.add(testRecipe);
        when(recipeRepository.findAll()).thenReturn(recipeList);

        // Act
        List<Recipe> retrievedRecipes = recipeService.getAllRecipes();

        // Assert
        assertNotNull(retrievedRecipes);
        assertFalse(retrievedRecipes.isEmpty());
        assertEquals(1, retrievedRecipes.size());
        assertEquals(testRecipe.getRecipeId(), retrievedRecipes.get(0).getRecipeId());
        verify(recipeRepository).findAll();
    }

    @Test
    void getRecipeById_ShouldReturnRecipe() {
        // Arrange
        when(recipeRepository.findById(1)).thenReturn(Optional.of(testRecipe));

        // Act
        Recipe foundRecipe = recipeService.getRecipeById(1);

        // Assert
        assertNotNull(foundRecipe);
        assertEquals(testRecipe.getRecipeId(), foundRecipe.getRecipeId());
        assertEquals(testRecipe.getTitle(), foundRecipe.getTitle());
        verify(recipeRepository, times(1)).findById(1);
    }

    @Test
    void getRecipeById_ShouldThrowRecipeNotFoundException_WhenRecipeDoesNotExist() {
        // Arrange
        when(recipeRepository.findById(anyInt())).thenReturn(Optional.empty());

        // Act & Assert
        RecipeNotFoundException exception = assertThrows(RecipeNotFoundException.class, () -> {
            recipeService.getRecipeById(1);
        });

        assertEquals("Recipe not found.", exception.getMessage());
        verify(recipeRepository).findById(1);
    }

    @Test
    void updateRecipe_ShouldReturnRecipe_WhenRecipeIsFound() throws RecipeNotFoundException {
        // Arrange: mock repository to return existingRecipe when findById is called
        when(recipeRepository.findById(1)).thenReturn(Optional.of(testRecipe));
        when(recipeRepository.save(testRecipe)).thenReturn(testRecipe);

        // Act: call the update method
        Recipe result = recipeService.updateRecipe(1, updatedRecipe);

        // Assert: verify the result and that the repository methods were called
        assertNotNull(result);
        assertEquals(2, result.getServings());
        assertEquals("Updated Recipe", result.getTitle());
        assertEquals(25, result.getCookingTime());
        assertEquals(DifficultyLevel.MEDIUM, result.getDifficultyLevel());
        assertEquals(15, result.getPreparationTime());

        verify(recipeRepository).findById(1);  // Verify findById was called
        verify(recipeRepository).save(testRecipe);  // Verify save was called
    }

    @Test
    void updateRecipe_ShouldThrowRecipeNotFoundException_WhenRecipeIsNotFound() {
        // Arrange: mock repository to return empty Optional for findById
        when(recipeRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert: expect RecipeNotFoundException to be thrown
        RecipeNotFoundException exception = assertThrows(RecipeNotFoundException.class, () -> {
            recipeService.updateRecipe(1, updatedRecipe);
        });

        assertEquals("Recipe not found.", exception.getMessage());  // Check exception message
        verify(recipeRepository).findById(1);  // Verify findById was called
        verify(recipeRepository, never()).save(any());  // Verify save was not called
    }

    @Test
    void deleteRecipe_ShouldThrowAccessDeniedException_WhenUserNotOwner() {
        User anotherUser = new User();
        anotherUser.setUserId(2);
        testRecipe.setUser(anotherUser);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        User currentUser = new User();
        currentUser.setUserId(1);
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(currentUser));
        when(recipeRepository.findById(1)).thenReturn(Optional.of(testRecipe));

        assertThrows(AccessDeniedException.class, () -> recipeService.deleteRecipe(1));
    }
}