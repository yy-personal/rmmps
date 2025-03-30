package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.model.NotificationPreferences;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.repository.NotificationPreferencesRepository;
import com.nus_iss.recipe_management.service.NotificationService;
import com.nus_iss.recipe_management.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private final UserService userService;

    @Autowired
    private NotificationPreferencesRepository repository;

    @Override
    public NotificationPreferences getPreferences(Integer userId) {
        return repository.findByUserUserId(userId).orElse(new NotificationPreferences());
    }

    @Override
    public NotificationPreferences updatePreferences(NotificationPreferences notificationPreferences) {

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Value not present"));
        Integer userId = user.getUserId();

        // Check if the authenticated user owns the recipe
        if (!notificationPreferences.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this recipe.");
        }

        notificationPreferences.setUser(user);
        return repository.save(notificationPreferences);
    }
}
