package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// Recipes Entity
@Entity
@Table(name = "Recipes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Recipe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer recipeId;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer preparationTime;

    @Column(nullable = false)
    private Integer cookingTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public DifficultyLevel difficultyLevel;

    @Column(nullable = false)
    private Integer servings;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String steps;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

