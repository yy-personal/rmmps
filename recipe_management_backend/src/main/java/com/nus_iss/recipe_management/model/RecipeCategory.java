package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

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

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RecipeCategoryMapping> recipes = new HashSet<>();

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Set<RecipeCategoryMapping> getRecipes() {
        return recipes;
    }
}