package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.UserDTO;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Controller")
public class UserController {
    private final UserService userService;

    @Operation(summary = "Create a new user")
    @ApiResponse(responseCode = "200", description = "User created successfully")
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserDTO userDTO) {
        User createdUser = userService.createUser(userDTO);
        return ResponseEntity.ok(createdUser);
    }

    @Operation(summary = "Get all users")
    @ApiResponse(responseCode = "200", description = "List of users retrieved")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get user by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Delete user by ID")
    @ApiResponse(responseCode = "204", description = "User deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Add Dietary Restriction To User")
    @ApiResponse(responseCode = "200", description = "Dietary restriction added successfully")
    @PostMapping("/{userId}/dietary-restrictions")
    public ResponseEntity<User> addDietaryRestriction(
            @PathVariable Integer userId,
            @RequestParam Integer dietaryRestrictionId) {
        User user = userService.addDietaryRestriction(userId, dietaryRestrictionId);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Remove Dietary Restriction From User")
    @ApiResponse(responseCode = "200", description = "Dietary restriction removed successfully")
    @DeleteMapping("/{userId}/dietary-restrictions")
    public ResponseEntity<Void> removeDietaryRestriction(
            @PathVariable Integer userId,
            @RequestParam Integer dietaryRestrictionId) {
        userService.removeDietaryRestriction(userId, dietaryRestrictionId);
        return ResponseEntity.noContent().build();
    }
}