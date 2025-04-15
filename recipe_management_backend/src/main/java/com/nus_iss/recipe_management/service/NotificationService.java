package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.NotificationPreferences;

public interface NotificationService {

    public NotificationPreferences getPreferences(Integer userId);

    public NotificationPreferences createPreferences(NotificationPreferences notificationPreferences, Integer userId);

    public NotificationPreferences updatePreferences(NotificationPreferences notificationPreferences, Integer userId);
}
