package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "RecipeSearchSubscriptions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecipeSearchSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subscriptionId;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    // Store search criteria as JSON
    @Column(nullable = false, columnDefinition = "TEXT")
    private String searchCriteria;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastNotified;
}