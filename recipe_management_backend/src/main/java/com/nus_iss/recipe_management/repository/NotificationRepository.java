package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Integer userId);

    List<Notification> findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(Integer userId);

    long countByUserUserIdAndIsReadFalse(Integer userId);
}