package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shopping_lists")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ShoppingList {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shoppingListId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ShoppingListItem> items = new HashSet<>();

    // Helper method to add an item
    public void addItem(ShoppingListItem item) {
        items.add(item);
        item.setShoppingList(this);
    }

    // Helper method to remove an item
    public void removeItem(ShoppingListItem item) {
        items.remove(item);
        item.setShoppingList(null);
    }
}