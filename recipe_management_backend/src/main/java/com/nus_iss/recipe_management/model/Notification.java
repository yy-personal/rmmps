package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Setter
    @Getter
    @Column(nullable = false)
    private Boolean notificationSentIndicator;


    public Notification(String title, String description, User user, MealPlan mealPlan, Boolean notificationSentIndicator) {
        this.title = title;
        this.description = description;
        this.user = user;
        this.mealPlan = mealPlan;
        this.notificationSentIndicator = notificationSentIndicator;
    }

}