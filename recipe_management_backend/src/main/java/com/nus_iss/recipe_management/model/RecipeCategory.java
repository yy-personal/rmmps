package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;

// Recipe Categories Entity
@Entity
@Table(name = "RecipeCategories")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;

    @Column(nullable = false, unique = true)
    private String categoryName;
}