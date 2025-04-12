package com.nus_iss.recipe_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListCreateDTO {

    @NotBlank(message = "Shopping list title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    @NotNull(message = "Recipe IDs list cannot be null")
    private List<Integer> recipeIds;
}