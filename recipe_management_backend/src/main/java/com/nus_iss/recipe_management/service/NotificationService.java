package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getUserNotifications(Integer userId);
    List<Notification> getUserUnreadNotifications(Integer userId);
    long getUnreadNotificationCount(Integer userId);
    void markAsRead(Integer notificationId);
    void markAllAsRead(Integer userId);
}