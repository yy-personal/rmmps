package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.NotificationPreferences;
import com.nus_iss.recipe_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Long> {
    Optional<NotificationPreferences> findByUserUserId(Integer userId);
}
