package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;

// Recipe-Category Mapping
@Entity
@Table(name = "RecipeCategoryMapping")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeCategoryMapping {
    @Id
    @ManyToOne
    @JoinColumn(name = "recipeId")
    private Recipe recipe;

    @Id
    @ManyToOne
    @JoinColumn(name = "categoryId")
    private RecipeCategory category;
}