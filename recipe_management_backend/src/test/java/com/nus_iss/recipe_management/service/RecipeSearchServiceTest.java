package com.nus_iss.recipe_management.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.nus_iss.recipe_management.dto.RecipeSearchDTO;
import com.nus_iss.recipe_management.model.DifficultyLevel;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.service.impl.RecipeSearchServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Arrays;
import java.util.List;

@ExtendWith(MockitoExtension.class)
public class RecipeSearchServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @InjectMocks
    private RecipeSearchServiceImpl recipeSearchService;

    private Recipe recipe1;
    private Recipe recipe2;
    private User user;
    private RecipeSearchDTO searchCriteria;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        // Create user
        user = new User();
        user.setUserId(1);
        user.setEmail("test@example.com");

        // Create recipes
        recipe1 = new Recipe();
        recipe1.setRecipeId(1);
        recipe1.setTitle("Spaghetti Carbonara");
        recipe1.setPreparationTime(15);
        recipe1.setCookingTime(20);
        recipe1.setDifficultyLevel(DifficultyLevel.MEDIUM);
        recipe1.setServings(4);
        recipe1.setUser(user);

        recipe2 = new Recipe();
        recipe2.setRecipeId(2);
        recipe2.setTitle("Pancakes");
        recipe2.setPreparationTime(10);
        recipe2.setCookingTime(10);
        recipe2.setDifficultyLevel(DifficultyLevel.EASY);
        recipe2.setServings(2);
        recipe2.setUser(user);

        // Create search criteria
        searchCriteria = new RecipeSearchDTO();

        // Create pageable
        pageable = PageRequest.of(0, 10);
    }

    @Test
    void searchRecipes_NoParameters_ReturnsAllRecipes() {
        // Arrange
        List<Recipe> recipeList = Arrays.asList(recipe1, recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipeList);

        // More specific mock to avoid ambiguous method call
        when(recipeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(recipePage);

        // Act
        Page<Recipe> result = recipeSearchService.searchRecipes(searchCriteria, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        verify(recipeRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void searchRecipes_WithTitle_ReturnsMatchingRecipes() {
        // Arrange
        searchCriteria.setTitle("Spaghetti");
        List<Recipe> recipeList = Arrays.asList(recipe1);
        Page<Recipe> recipePage = new PageImpl<>(recipeList);

        when(recipeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(recipePage);

        // Act
        Page<Recipe> result = recipeSearchService.searchRecipes(searchCriteria, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Spaghetti Carbonara", result.getContent().get(0).getTitle());
        verify(recipeRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void searchRecipes_WithDifficultyLevel_ReturnsMatchingRecipes() {
        // Arrange
        searchCriteria.setDifficultyLevel("EASY");
        List<Recipe> recipeList = Arrays.asList(recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipeList);

        when(recipeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(recipePage);

        // Act
        Page<Recipe> result = recipeSearchService.searchRecipes(searchCriteria, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(DifficultyLevel.EASY, result.getContent().get(0).getDifficultyLevel());
        verify(recipeRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void searchRecipes_WithTotalTimeRange_ReturnsMatchingRecipes() {
        // Arrange
        searchCriteria.setMinTotalTime(30);
        searchCriteria.setMaxTotalTime(40);
        List<Recipe> recipeList = Arrays.asList(recipe1);  // total time is 35
        Page<Recipe> recipePage = new PageImpl<>(recipeList);

        when(recipeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(recipePage);

        // Act
        Page<Recipe> result = recipeSearchService.searchRecipes(searchCriteria, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Spaghetti Carbonara", result.getContent().get(0).getTitle());
        verify(recipeRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void searchRecipes_WithServings_ReturnsMatchingRecipes() {
        // Arrange
        searchCriteria.setServings(2);
        List<Recipe> recipeList = Arrays.asList(recipe2);
        Page<Recipe> recipePage = new PageImpl<>(recipeList);

        when(recipeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(recipePage);

        // Act
        Page<Recipe> result = recipeSearchService.searchRecipes(searchCriteria, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(2, result.getContent().get(0).getServings());
        verify(recipeRepository).findAll(any(Specification.class), any(Pageable.class));
    }
}