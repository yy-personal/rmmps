package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.Notification;
import com.nus_iss.recipe_management.model.NotificationPreferences;

import java.util.List;
import java.util.Optional;

public interface NotificationService {

    public NotificationPreferences getPreferences(Integer userId);

    public NotificationPreferences createPreferences(NotificationPreferences notificationPreferences, Integer userId);

    public NotificationPreferences updatePreferences(NotificationPreferences notificationPreferences, Integer userId);

    public Notification createNotification(String title, String description, Integer userId, Integer mealPlanId, Boolean notificationSentIndicator);

    public Notification updateNotificationSentFlagByNotificationId(Integer notificationId, Boolean notificationSentIndicator);

    public Optional<Notification> getNotificationById(Integer notificationId);

    public Integer updateNotificationFlagForUserToTrue(Integer userId);

    public List<Notification> getUnsentNotificationForUser(Integer userId);

    public List<Notification> getAllNotificationForUser(Integer userId);

    public List<Notification> getAllNotifications();

    public void deleteNotification(Integer notificationId);
}
