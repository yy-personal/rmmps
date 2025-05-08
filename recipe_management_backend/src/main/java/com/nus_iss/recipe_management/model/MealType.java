package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "MealTypes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MealType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mealTypeId;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "mealTypes")
    @JsonIgnore
    private Set<Recipe> recipes = new HashSet<>();
}