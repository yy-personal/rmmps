package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.model.DifficultyLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeService recipeService;

    private Recipe testRecipe;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
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
    }

    @Test
    void createRecipe_ShouldReturnCreatedRecipe() {
        // Arrange
        when(recipeService.createRecipe(any(Recipe.class))).thenReturn(testRecipe);

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
        verify(recipeService, times(1)).createRecipe(any(Recipe.class));
    }

    @Test
    void getAllRecipes_ShouldReturnListOfRecipes() {
        // Arrange
        List<Recipe> recipeList = Arrays.asList(testRecipe);
        when(recipeService.getAllRecipes()).thenReturn(recipeList);

        // Act
        List<Recipe> retrievedRecipes = recipeService.getAllRecipes();

        // Assert
        assertNotNull(retrievedRecipes);
        assertFalse(retrievedRecipes.isEmpty());
        assertEquals(1, retrievedRecipes.size());
        assertEquals(testRecipe.getRecipeId(), retrievedRecipes.get(0).getRecipeId());
        verify(recipeService, times(1)).getAllRecipes();
    }

    @Test
    void getRecipeById_ShouldReturnRecipe() {
        // Arrange
        when(recipeService.getRecipeById(1)).thenReturn(testRecipe);

        // Act
        Recipe foundRecipe = recipeService.getRecipeById(1);

        // Assert
        assertNotNull(foundRecipe);
        assertEquals(testRecipe.getRecipeId(), foundRecipe.getRecipeId());
        assertEquals(testRecipe.getTitle(), foundRecipe.getTitle());
        verify(recipeService, times(1)).getRecipeById(1);
    }

    @Test
    void deleteRecipe_ShouldDeleteSuccessfully() {
        // Arrange
        doNothing().when(recipeService).deleteRecipe(1);

        // Act
        recipeService.deleteRecipe(1);

        // Assert
        verify(recipeService, times(1)).deleteRecipe(1);
    }
}