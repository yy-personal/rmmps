package com.nus_iss.recipe_management.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.nus_iss.recipe_management.model.MealType;
import com.nus_iss.recipe_management.repository.MealTypeRepository;
import com.nus_iss.recipe_management.service.impl.MealTypeServiceImpl;

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
class MealTypeServiceTest {

    @Mock
    private MealTypeRepository mealTypeRepository;

    @InjectMocks
    private MealTypeServiceImpl mealTypeService;

    private MealType breakfast;
    private MealType lunch;

    @BeforeEach
    void setUp() {
        breakfast = new MealType();
        breakfast.setMealTypeId(1);
        breakfast.setName("Breakfast");

        lunch = new MealType();
        lunch.setMealTypeId(2);
        lunch.setName("Lunch");
    }

    @Test
    void createMealType_ShouldReturnSavedMealType() {
        // Arrange
        when(mealTypeRepository.save(any(MealType.class))).thenReturn(breakfast);

        // Act
        MealType result = mealTypeService.createMealType(breakfast);

        // Assert
        assertNotNull(result);
        assertEquals(breakfast.getMealTypeId(), result.getMealTypeId());
        assertEquals(breakfast.getName(), result.getName());

        // Verify
        verify(mealTypeRepository).save(breakfast);
    }

    @Test
    void getAllMealTypes_ShouldReturnListOfMealTypes() {
        // Arrange
        List<MealType> mealTypes = Arrays.asList(breakfast, lunch);
        when(mealTypeRepository.findAll()).thenReturn(mealTypes);

        // Act
        List<MealType> result = mealTypeService.getAllMealTypes();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Breakfast", result.get(0).getName());
        assertEquals("Lunch", result.get(1).getName());

        // Verify
        verify(mealTypeRepository).findAll();
    }

    @Test
    void getMealTypeById_ShouldReturnMealTypeWhenFound() {
        // Arrange
        when(mealTypeRepository.findById(1)).thenReturn(Optional.of(breakfast));

        // Act
        MealType result = mealTypeService.getMealTypeById(1);

        // Assert
        assertNotNull(result);
        assertEquals(breakfast.getMealTypeId(), result.getMealTypeId());
        assertEquals(breakfast.getName(), result.getName());

        // Verify
        verify(mealTypeRepository).findById(1);
    }

    @Test
    void getMealTypeById_ShouldReturnNullWhenNotFound() {
        // Arrange
        when(mealTypeRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        MealType result = mealTypeService.getMealTypeById(999);

        // Assert
        assertNull(result);

        // Verify
        verify(mealTypeRepository).findById(999);
    }

    @Test
    void findByName_ShouldReturnMealTypeWhenFound() {
        // Arrange
        when(mealTypeRepository.findByName("Breakfast")).thenReturn(Optional.of(breakfast));

        // Act
        Optional<MealType> result = mealTypeService.findByName("Breakfast");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(breakfast.getMealTypeId(), result.get().getMealTypeId());
        assertEquals(breakfast.getName(), result.get().getName());

        // Verify
        verify(mealTypeRepository).findByName("Breakfast");
    }

    @Test
    void findByName_ShouldReturnEmptyOptionalWhenNotFound() {
        // Arrange
        when(mealTypeRepository.findByName("Nonexistent Meal Type")).thenReturn(Optional.empty());

        // Act
        Optional<MealType> result = mealTypeService.findByName("Nonexistent Meal Type");

        // Assert
        assertTrue(result.isEmpty());

        // Verify
        verify(mealTypeRepository).findByName("Nonexistent Meal Type");
    }

    @Test
    void deleteMealType_ShouldCallRepositoryDeleteById() {
        // Arrange
        doNothing().when(mealTypeRepository).deleteById(1);

        // Act
        mealTypeService.deleteMealType(1);

        // Verify
        verify(mealTypeRepository).deleteById(1);
    }
}