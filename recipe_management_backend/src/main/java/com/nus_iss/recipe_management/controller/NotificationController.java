package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.model.Notification;
import com.nus_iss.recipe_management.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
@Tag(name = "Notification Controller")
public class NotificationController {
    private final NotificationService notificationService;

    @Operation(summary = "Create a new notification")
    @ApiResponse(responseCode = "200", description = "Notification created successfully")
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestParam String title, @RequestParam String description, @RequestParam Integer userId, @RequestParam Integer mealPlanId, @RequestParam Boolean notificationSentIndicator) {
        Notification createdNotification = notificationService.createNotification(title, description, userId, mealPlanId, notificationSentIndicator);
        return ResponseEntity.ok(createdNotification);
    }

    @Operation(summary = "Get all notifications")
    @ApiResponse(responseCode = "200", description = "List of notifications retrieved")
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get notification by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notification found"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Integer id) {
        Optional<Notification> optionalNotification = notificationService.getNotificationById(id);
        Notification notification = optionalNotification.orElse(null);
        return notification != null ? ResponseEntity.ok(notification) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Get notification by user ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notification found"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @GetMapping("/userId/{userId}")
    public ResponseEntity<List<Notification>> getNotificationByUserId(@PathVariable Integer userId) {
        List<Notification> notifications = notificationService.getAllNotificationForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get unsent notification by user ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notification found"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @GetMapping("/unsent/userId/{userId}")
    public ResponseEntity<List<Notification>> getUnsentNotificationByUserId(@PathVariable Integer userId) {
        List<Notification> notifications = notificationService.getUnsentNotificationForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Delete notification by ID")
    @ApiResponse(responseCode = "204", description = "Notification deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Integer id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update all notification to sent for user")
    @ApiResponse(responseCode = "200", description = "Updated all notifications for user to sent")
    @PutMapping("/user/{userId}")
    public ResponseEntity<Integer> updateAllUserNotificationsToSent(@PathVariable Integer userId) {
        Integer i = notificationService.updateNotificationFlagForUserToTrue(userId);
        return ResponseEntity.ok(i);
    }

    @Operation(summary = "Update sent flag for a notification")
    @ApiResponse(responseCode = "200", description = "Updated notification sent flag")
    @PutMapping("/{id}/{sentFlag}")
    public ResponseEntity<Notification> updateSentFlagOfNotification(
            @PathVariable Integer id,
            @PathVariable Boolean sentFlag
    ) {
        Notification notification = notificationService.updateNotificationSentFlagByNotificationId(id, sentFlag);
        return ResponseEntity.ok(notification);
    }
}