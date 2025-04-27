package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.Notification;
import com.nus_iss.recipe_management.model.Recipe;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    @Query("""
        SELECT n from Notification n WHERE n.notificationSentIndicator = false AND n.user.userId = :userId ORDER BY n.createdAt DESC
    """)
    List<Notification> findUnsentNotificationsByUserId(@Param("userId") Integer userId);

    @Query("""
        SELECT n from Notification n WHERE n.user.userId = :userId ORDER BY n.createdAt DESC
    """)
    List<Notification> findNotificationsByUserId(@Param("userId") Integer userId);

    @Transactional
    @Modifying
    @Query("""
        UPDATE Notification n SET n.notificationSentIndicator = true WHERE n.user.userId = :userId
    """)
    Integer updateNotificationFlagForUserToTrue(@Param("userId") Integer userId);
}
