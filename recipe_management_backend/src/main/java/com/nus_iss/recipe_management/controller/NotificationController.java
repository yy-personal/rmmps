package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.model.Notification;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.service.NotificationService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Controller")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    @Operation(summary = "Get user's notifications")
    @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) auth.getPrincipal()).getUsername();

        User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUserNotifications(user.getUserId());
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get user's unread notifications")
    @ApiResponse(responseCode = "200", description = "Unread notifications retrieved successfully")
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) auth.getPrincipal()).getUsername();

        User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUserUnreadNotifications(user.getUserId());
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get count of unread notifications")
    @ApiResponse(responseCode = "200", description = "Unread notification count retrieved successfully")
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) auth.getPrincipal()).getUsername();

        User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = notificationService.getUnreadNotificationCount(user.getUserId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @Operation(summary = "Mark notification as read")
    @ApiResponse(responseCode = "204", description = "Notification marked as read successfully")
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Mark all notifications as read")
    @ApiResponse(responseCode = "204", description = "All notifications marked as read successfully")
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) auth.getPrincipal()).getUsername();

        User user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user.getUserId());
        return ResponseEntity.noContent().build();
    }
}