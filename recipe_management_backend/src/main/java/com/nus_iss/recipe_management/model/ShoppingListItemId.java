package com.nus_iss.recipe_management.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ShoppingListItemId implements Serializable {
    private Integer shoppingListId;
    private Integer ingredientId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ShoppingListItemId that = (ShoppingListItemId) o;
        return Objects.equals(shoppingListId, that.shoppingListId) &&
                Objects.equals(ingredientId, that.ingredientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(shoppingListId, ingredientId);
    }
}