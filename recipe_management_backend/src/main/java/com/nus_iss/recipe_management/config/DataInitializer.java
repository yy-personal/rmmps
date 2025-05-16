package com.nus_iss.recipe_management.config;

import com.nus_iss.recipe_management.model.MealType;
import com.nus_iss.recipe_management.repository.MealTypeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final MealTypeRepository mealTypeRepository;
    private final JdbcTemplate jdbcTemplate;

    // Set this to true to reset meal types to the core set on application startup
    private static final boolean RESET_MEAL_TYPES = false;
//    private static final boolean RESET_MEAL_TYPES = true;


    @PostConstruct
    @Transactional
    public void initData() {
        // Core meal types that will always be included (with specific IDs)
        List<MealType> coreMealTypes = Arrays.asList(
                createMealType(1, "Breakfast"),
                createMealType(2, "Lunch"),
                createMealType(3, "Dinner"),
                createMealType(4, "Dessert"),
                createMealType(5, "Snack")
        );

        // If RESET_MEAL_TYPES is true, or the database is empty, initialize meal types
        if (RESET_MEAL_TYPES || mealTypeRepository.count() == 0) {
            // If we're resetting or initializing, ensure we have a clean slate
            // Delete all existing meal types
            mealTypeRepository.deleteAll();

            // Reset auto-increment counter in MySQL
            jdbcTemplate.execute("ALTER TABLE meal_types AUTO_INCREMENT = 1");

            // Save the core meal types
            mealTypeRepository.saveAll(coreMealTypes);
        }
    }

    private MealType createMealType(Integer id, String name) {
        MealType mealType = new MealType();
        mealType.setName(name);
        // We don't set the ID directly since it's auto-generated
        // The reset of the auto-increment ensures they'll start from 1
        return mealType;
    }
}