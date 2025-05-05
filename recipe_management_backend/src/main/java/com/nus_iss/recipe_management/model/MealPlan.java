package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

// Meal Plans Entity
@Entity
@Table(name = "MealPlans")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MealPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mealPlanId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;

    @Column(nullable = false)
    private Integer mealsPerDay;

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MealPlanRecipeMapping> recipes = new HashSet<>();

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL)
    private Set<Notification> notifications = new HashSet<>();

    // ADD THIS NEW METHOD to expose user details without circular references
    @JsonProperty("user")
    public Map<String, Object> getUserForJson() {
        if (user == null) return null;
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("userId", user.getUserId());
        userMap.put("email", user.getEmail());
        return userMap;
    }
}
