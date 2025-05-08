package com.nus_iss.recipe_management.dto;

import com.nus_iss.recipe_management.model.ShoppingList;
import com.nus_iss.recipe_management.model.ShoppingListItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListDTO {
    private Integer id;
    private String title;
    private String userEmail;
    private LocalDateTime createdAt;
    private List<ShoppingListItemDTO> items;

    // Helper method to convert from entity to DTO
    public static ShoppingListDTO fromEntity(ShoppingList shoppingList) {
        ShoppingListDTO dto = new ShoppingListDTO();
        dto.setId(shoppingList.getShoppingListId());
        dto.setTitle(shoppingList.getTitle());
        dto.setUserEmail(shoppingList.getUser().getEmail());
        dto.setCreatedAt(shoppingList.getCreatedAt());

        // Convert items
        List<ShoppingListItemDTO> itemDtos = shoppingList.getItems().stream()
                .map(item -> {
                    ShoppingListItemDTO itemDto = new ShoppingListItemDTO();
                    itemDto.setIngredientId(item.getIngredient().getIngredientId());
                    itemDto.setIngredientName(item.getIngredient().getName());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setPurchased(item.getPurchased());

                    // Add recipe info if available
                    if (item.getRecipe() != null) {
                        itemDto.setRecipeId(item.getRecipe().getRecipeId());
                        itemDto.setRecipeTitle(item.getRecipe().getTitle());
                        itemDto.setServings(item.getServings());
                    }

                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setItems(itemDtos);

        return dto;
    }
}