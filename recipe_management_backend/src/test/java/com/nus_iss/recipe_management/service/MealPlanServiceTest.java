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

    @BeforeEach
    void setUp() {
        mealPlan = new MealPlan();
        mealPlan.setMealPlanId(1);
        User user = new User();
        user.setUserId(1);
        mealPlan.setUser(user);
    }

    @Test
    void createMealPlan_ShouldReturnSavedMealPlan() {
        when(mealPlanRepository.save(mealPlan)).thenReturn(mealPlan);
        MealPlan savedMealPlan = mealPlanService.createMealPlan(mealPlan);
        assertEquals(mealPlan, savedMealPlan);
    }

    @Test
    void getAllMealPlans_ShouldReturnListOfMealPlans() {
        List<MealPlan> mealPlans = List.of(mealPlan);
        when(mealPlanRepository.findAll()).thenReturn(mealPlans);
        assertEquals(mealPlans, mealPlanService.getAllMealPlans());
    }

    @Test
    void getMealPlanById_ShouldReturnMealPlan() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        assertEquals(mealPlan, mealPlanService.getMealPlanById(1));
    }

    @Test
    void getMealPlanById_ShouldThrowMealPlanNotFoundException() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(MealPlanNotFoundException.class, () -> mealPlanService.getMealPlanById(1));
    }

    @Test
    void updateMealPlan_ShouldThrowAccessDeniedException() {
        when(mealPlanRepository.findById(1)).thenReturn(Optional.of(mealPlan));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("user@example.com");
        SecurityContextHolder.setContext(securityContext);
        when(userService.findByEmail("user@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(AccessDeniedException.class, () -> mealPlanService.updateMealPlan(1, mealPlan));
    }

    @Test
    void deleteMealPlan_ShouldCallDeleteById() {
        mealPlanService.deleteMealPlan(1);
        verify(mealPlanRepository, times(1)).deleteById(1);
    }
}
