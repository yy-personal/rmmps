package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.dto.RecipeSearchSubscriptionDTO;
import com.nus_iss.recipe_management.model.RecipeSearchSubscription;
import java.util.List;

public interface SubscriptionService {
    RecipeSearchSubscription createSubscription(Integer userId, RecipeSearchSubscriptionDTO subscriptionDTO);
    List<RecipeSearchSubscription> getUserSubscriptions(Integer userId);
    void deleteSubscription(Integer subscriptionId);
    void checkForNewMatches();
}