package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationId;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type; // e.g., "SEARCH_MATCH", "MEAL_PLAN"

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = true)
    private Integer relatedEntityId; // e.g., recipeId, mealPlanId

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}