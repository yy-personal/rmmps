package com.nus_iss.recipe_management.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.nus_iss.recipe_management.exception.*;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.UserService;
import com.nus_iss.recipe_management.service.impl.MealPlanServiceImpl;
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
import java.util.*;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class MealPlanServiceTest {

    @Mock
    private MealPlanRepository mealPlanRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private MealPlanRecipeMappingRepository mealPlanRecipeMappingRepository;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private MealPlanServiceImpl mealPlanService;

    private MealPlan mealPlan;
    private Recipe recipe;
    private User user;
    private User otherUser;

    @BeforeEach
    void setUp() {
        mealPlan = new MealPlan();
        mealPlan.setMealPlanId(1);
        user = new User();
        user.setUserId(1);
        mealPlan.setUser(user);
        recipe = new Recipe();
        recipe.setRecipeId(1);
        otherUser = new User();
        otherUser.setUserId(2);

        lenient(). when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(userDetails.getUsername()).thenReturn("user@example.com");
        SecurityContextHolder.setContext(securityContext);
        lenient().when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    }

//    @Test
//    void createMealPlan_ShouldReturnSavedMealPlan() {
//        when(mealPlanRepository.save(mealPlan)).thenReturn(mealPlan);
//        MealPlan savedMealPlan = mealPlanService.createMealPlan(mealPlan);
//        assertEquals(mealPlan, savedMealPlan);
//    }

    @Test
    void addMealPlanRecipeMapping_ShouldReturnSavedMapping() {
        MealPlanRecipeMappingId mappingId = new MealPlanRecipeMappingId(1, 1);
        MealPlanRecipeMapping mapping = new MealPlanRecipeMapping();
        mapping.setId(mappingId);
        mapping.setMealPlan(mealPlan);
        mapping.setRecipe(recipe);

        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        when(recipeRepository.findById(1)).thenReturn(Optional.of(recipe));
        when(mealPlanRecipeMappingRepository.existsById(mappingId)).thenReturn(false);
        when(mealPlanRecipeMappingRepository.save(any())).thenReturn(mapping);

        MealPlanRecipeMapping result = mealPlanService.addMealPlanRecipeMapping(1, 1);
        assertEquals(mapping, result);
    }

    @Test
    void deleteMealPlanRecipeMapping_ShouldCallDelete() {
        MealPlanRecipeMappingId mappingId = new MealPlanRecipeMappingId(1, 1);
        MealPlanRecipeMapping mapping = new MealPlanRecipeMapping();
        mapping.setId(mappingId);
        mapping.setMealPlan(mealPlan);
        mapping.setRecipe(recipe);

        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        when(mealPlanRecipeMappingRepository.findById(mappingId)).thenReturn(Optional.of(mapping));

        mealPlanService.deleteMealPlanRecipeMapping(1, 1);
        verify(mealPlanRecipeMappingRepository, times(1)).delete(mapping);
    }


    // TEST EXCEPTIONS
    @Test
    void addMealPlanRecipeMapping_ShouldThrowRecipeAlreadyInMealPlanException() {
        MealPlanRecipeMappingId mappingId = new MealPlanRecipeMappingId(1, 1);

        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        when(recipeRepository.findById(1)).thenReturn(Optional.of(recipe));
        when(mealPlanRecipeMappingRepository.existsById(mappingId)).thenReturn(true);

        assertThrows(RecipeAlreadyInMealPlanException.class, () -> mealPlanService.addMealPlanRecipeMapping(1, 1));
    }

    @Test
    void addMealPlanRecipeMapping_ShouldThrowMealPlanNotFoundException() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(MealPlanNotFoundException.class, () -> mealPlanService.addMealPlanRecipeMapping(1, 1));
    }

    @Test
    void addMealPlanRecipeMapping_ShouldThrowRecipeNotFoundException() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        when(recipeRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(RecipeNotFoundException.class, () -> mealPlanService.addMealPlanRecipeMapping(1, 1));
    }

    @Test
    void addMealPlanRecipeMapping_ShouldThrowAccessDeniedException() {
        mealPlan.setUser(otherUser);
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        assertThrows(AccessDeniedException.class, () -> mealPlanService.addMealPlanRecipeMapping(1, 1));
    }

    @Test
    void deleteMealPlanRecipeMapping_ShouldThrowAccessDeniedException() {
        mealPlan.setUser(otherUser);
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        assertThrows(AccessDeniedException.class, () -> mealPlanService.deleteMealPlanRecipeMapping(1, 1));
    }

    @Test
    void deleteMealPlanRecipeMapping_ShouldThrowMealPlanRecipeMappingNotFoundException() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        when(mealPlanRecipeMappingRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(MealPlanRecipeMappingNotFoundException.class, () -> mealPlanService.deleteMealPlanRecipeMapping(1, 1));
    }

    @Test
    void updateMealPlan_ShouldThrowAccessDeniedException() {
        mealPlan.setUser(otherUser);
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        assertThrows(AccessDeniedException.class, () -> mealPlanService.updateMealPlan(1, mealPlan));
    }

    @Test
    void updateMealPlan_ShouldThrowMealPlanNotFoundException() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(MealPlanNotFoundException.class, () -> mealPlanService.updateMealPlan(1, mealPlan));
    }
}
