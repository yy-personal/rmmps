package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MealPlanRecipeMapping")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MealPlanRecipeMapping {

    @EmbeddedId
    private MealPlanRecipeMappingId id;

    @ManyToOne
    @MapsId("mealPlanId")  // Maps to mealPlanId in MealPlanRecipeMappingId
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @ManyToOne
    @MapsId("recipeId")  // Maps to recipeId in MealPlanRecipeMappingId
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    // To prevent recursive get in JSON response
    @JsonIgnore
    public MealPlan getMealPlan() {
        return mealPlan;
    }
}
