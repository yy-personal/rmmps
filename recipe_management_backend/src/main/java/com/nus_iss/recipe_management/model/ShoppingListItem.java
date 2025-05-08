package com.nus_iss.recipe_management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shopping_list_items")
@Getter @Setter
@NoArgsConstructor
public class ShoppingListItem {
    @EmbeddedId
    private ShoppingListItemId id = new ShoppingListItemId();

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("shoppingListId")
    @JoinColumn(name = "shopping_list_id", nullable = false)
    @JsonIgnore // To prevent recursive JSON serialization
    private ShoppingList shoppingList;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("ingredientId")
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private String quantity;

    @Column(nullable = false)
    private Boolean purchased = false;

    // A foreign key to the recipe this ingredient is from (optional)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @Column
    private Integer servings; // Optional - stores how many servings this item is for

    public ShoppingListItem(ShoppingList shoppingList, Ingredient ingredient, String quantity) {
        this.shoppingList = shoppingList;
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.id = new ShoppingListItemId(
                shoppingList != null ? shoppingList.getShoppingListId() : null,
                ingredient != null ? ingredient.getIngredientId() : null
        );
    }

    public ShoppingListItem(ShoppingList shoppingList, Ingredient ingredient, String quantity, Recipe recipe, Integer servings) {
        this(shoppingList, ingredient, quantity);
        this.recipe = recipe;
        this.servings = servings;
    }
}