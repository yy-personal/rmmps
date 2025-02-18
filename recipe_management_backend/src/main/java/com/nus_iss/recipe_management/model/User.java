package com.nus_iss.recipe_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

// Users Entity
@Entity
@Table(name = "Users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String  getPasswordHash() {
        return passwordHash;
    }
}