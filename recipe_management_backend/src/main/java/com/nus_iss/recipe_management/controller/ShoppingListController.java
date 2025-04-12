package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.ShoppingListCreateDTO;
import com.nus_iss.recipe_management.dto.ShoppingListDTO;
import com.nus_iss.recipe_management.exception.ResourceNotFoundException;
import com.nus_iss.recipe_management.model.ShoppingList;
import com.nus_iss.recipe_management.service.ShoppingListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shopping-lists")
@RequiredArgsConstructor
@Tag(name = "Shopping List Controller")
@Slf4j
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    @Operation(summary = "Create a new shopping list")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Shopping list created"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Recipe not found")
    })
    @PostMapping
    public ResponseEntity<ShoppingListDTO> createShoppingList(@Valid @RequestBody ShoppingListCreateDTO dto) {
        try {
            ShoppingList createdList = shoppingListService.createShoppingList(
                    dto.getTitle(),
                    dto.getRecipeIds()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ShoppingListDTO.fromEntity(createdList));
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (AccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error creating shopping list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get all shopping lists")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shopping lists retrieved"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<List<ShoppingListDTO>> getAllShoppingLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<ShoppingList> shoppingListPage = shoppingListService.getAllShoppingLists(pageable);

            List<ShoppingListDTO> dtos = shoppingListPage.getContent().stream()
                    .map(ShoppingListDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (AccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error retrieving shopping lists", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get shopping list by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shopping list retrieved"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Shopping list not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ShoppingListDTO> getShoppingListById(@PathVariable Integer id) {
        try {
            ShoppingList shoppingList = shoppingListService.getShoppingListById(id);
            return ResponseEntity.ok(ShoppingListDTO.fromEntity(shoppingList));
        } catch (ResourceNotFoundException e) {
            log.error("Shopping list not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (AccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error retrieving shopping list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Delete shopping list")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Shopping list deleted"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Shopping list not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShoppingList(@PathVariable Integer id) {
        try {
            shoppingListService.deleteShoppingList(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            log.error("Shopping list not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (AccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error deleting shopping list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Update item purchased status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Item updated"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Item not found")
    })
    @PatchMapping("/{shoppingListId}/items/{ingredientId}")
    public ResponseEntity<Void> updateItemPurchasedStatus(
            @PathVariable Integer shoppingListId,
            @PathVariable Integer ingredientId,
            @RequestParam Boolean purchased
    ) {
        try {
            shoppingListService.updateItemPurchasedStatus(shoppingListId, ingredientId, purchased);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            log.error("Item not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (AccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error updating item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}