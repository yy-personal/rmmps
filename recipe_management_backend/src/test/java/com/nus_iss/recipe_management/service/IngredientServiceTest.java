package com.nus_iss.recipe_management.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.nus_iss.recipe_management.model.Ingredient;
import com.nus_iss.recipe_management.repository.IngredientRepository;
import com.nus_iss.recipe_management.service.impl.IngredientServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @InjectMocks
    private IngredientServiceImpl ingredientService;

    private Ingredient testIngredient1;
    private Ingredient testIngredient2;

    @BeforeEach
    void setUp() {
        testIngredient1 = new Ingredient();
        testIngredient1.setIngredientId(1);
        testIngredient1.setName("Test Ingredient 1");

        testIngredient2 = new Ingredient();
        testIngredient2.setIngredientId(2);
        testIngredient2.setName("Test Ingredient 2");
    }

    @Test
    void createIngredient_ShouldReturnSavedIngredient() {
        // Arrange
        when(ingredientRepository.save(any(Ingredient.class))).thenReturn(testIngredient1);

        // Act
        Ingredient result = ingredientService.createIngredient(testIngredient1);

        // Assert
        assertNotNull(result);
        assertEquals(testIngredient1.getIngredientId(), result.getIngredientId());
        assertEquals(testIngredient1.getName(), result.getName());

        // Verify
        verify(ingredientRepository).save(testIngredient1);
    }

    @Test
    void getAllIngredients_ShouldReturnListOfIngredients() {
        // Arrange
        List<Ingredient> ingredients = Arrays.asList(testIngredient1, testIngredient2);
        when(ingredientRepository.findAll()).thenReturn(ingredients);

        // Act
        List<Ingredient> result = ingredientService.getAllIngredients();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(testIngredient1.getName(), result.get(0).getName());
        assertEquals(testIngredient2.getName(), result.get(1).getName());

        // Verify
        verify(ingredientRepository).findAll();
    }

    @Test
    void getIngredientById_ShouldReturnIngredientWhenFound() {
        // Arrange
        when(ingredientRepository.findById(1)).thenReturn(Optional.of(testIngredient1));

        // Act
        Ingredient result = ingredientService.getIngredientById(1);

        // Assert
        assertNotNull(result);
        assertEquals(testIngredient1.getIngredientId(), result.getIngredientId());
        assertEquals(testIngredient1.getName(), result.getName());

        // Verify
        verify(ingredientRepository).findById(1);
    }

    @Test
    void getIngredientById_ShouldReturnNullWhenNotFound() {
        // Arrange
        when(ingredientRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Ingredient result = ingredientService.getIngredientById(999);

        // Assert
        assertNull(result);

        // Verify
        verify(ingredientRepository).findById(999);
    }

    @Test
    void findByName_ShouldReturnIngredientWhenFound() {
        // Arrange
        when(ingredientRepository.findByName("Test Ingredient 1")).thenReturn(Optional.of(testIngredient1));

        // Act
        Optional<Ingredient> result = ingredientService.findByName("Test Ingredient 1");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testIngredient1.getIngredientId(), result.get().getIngredientId());
        assertEquals(testIngredient1.getName(), result.get().getName());

        // Verify
        verify(ingredientRepository).findByName("Test Ingredient 1");
    }

    @Test
    void findByName_ShouldReturnEmptyOptionalWhenNotFound() {
        // Arrange
        when(ingredientRepository.findByName("Nonexistent Ingredient")).thenReturn(Optional.empty());

        // Act
        Optional<Ingredient> result = ingredientService.findByName("Nonexistent Ingredient");

        // Assert
        assertTrue(result.isEmpty());

        // Verify
        verify(ingredientRepository).findByName("Nonexistent Ingredient");
    }

    @Test
    void deleteIngredient_ShouldCallRepositoryDeleteById() {
        // Arrange
        doNothing().when(ingredientRepository).deleteById(1);

        // Act
        ingredientService.deleteIngredient(1);

        // Verify
        verify(ingredientRepository).deleteById(1);
    }
}