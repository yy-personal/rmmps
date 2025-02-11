package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;

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
}