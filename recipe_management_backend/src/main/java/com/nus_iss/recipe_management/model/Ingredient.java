package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

// Ingredients Entity
@Entity
@Table(name = "Ingredients")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Ingredient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ingredientId;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RecipeIngredientsMapping> recipes = new HashSet<>();

    // To prevent recursive get in JSON response
    @JsonIgnore
    public Set<RecipeIngredientsMapping> getRecipes() {
        return recipes;
    }
}