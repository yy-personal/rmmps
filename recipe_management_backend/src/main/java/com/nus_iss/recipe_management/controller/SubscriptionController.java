package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.dto.RecipeSearchSubscriptionDTO;
import com.nus_iss.recipe_management.model.RecipeSearchSubscription;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.service.SubscriptionService;
import com.nus_iss.recipe_management.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscription Controller")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final UserService userService;

    @Operation(summary = "Create a search subscription")
    @ApiResponse(responseCode = "200", description = "Subscription created successfully")
    @PostMapping
    public ResponseEntity<RecipeSearchSubscription> createSubscription(@RequestBody RecipeSearchSubscriptionDTO subscriptionDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) auth.getPrincipal()).getUsername();

        User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RecipeSearchSubscription subscription = subscriptionService.createSubscription(user.getUserId(), subscriptionDTO);
        return ResponseEntity.ok(subscription);
    }

    @Operation(summary = "Get user's subscriptions")
    @ApiResponse(responseCode = "200", description = "Subscriptions retrieved successfully")
    @GetMapping
    public ResponseEntity<List<RecipeSearchSubscription>> getUserSubscriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) auth.getPrincipal()).getUsername();

        User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<RecipeSearchSubscription> subscriptions = subscriptionService.getUserSubscriptions(user.getUserId());
        return ResponseEntity.ok(subscriptions);
    }

    @Operation(summary = "Delete a subscription")
    @ApiResponse(responseCode = "204", description = "Subscription deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Integer id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }
}