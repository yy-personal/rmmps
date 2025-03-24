package com.nus_iss.recipe_management.repository;

import com.nus_iss.recipe_management.model.RecipeSearchSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeSearchSubscriptionRepository extends JpaRepository<RecipeSearchSubscription, Integer> {
    List<RecipeSearchSubscription> findByUserUserId(Integer userId);
}