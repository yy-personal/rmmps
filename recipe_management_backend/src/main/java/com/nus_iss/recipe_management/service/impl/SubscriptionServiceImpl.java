package com.nus_iss.recipe_management.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nus_iss.recipe_management.dto.RecipeSearchCriteriaDTO;
import com.nus_iss.recipe_management.dto.RecipeSearchSubscriptionDTO;
import com.nus_iss.recipe_management.model.Notification;
import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.model.RecipeSearchSubscription;
import com.nus_iss.recipe_management.model.User;
import com.nus_iss.recipe_management.repository.NotificationRepository;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.repository.RecipeSearchSubscriptionRepository;
import com.nus_iss.recipe_management.repository.UserRepository;
import com.nus_iss.recipe_management.service.SearchService;
import com.nus_iss.recipe_management.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {
    private final RecipeSearchSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SearchService searchService;
    private final RecipeRepository recipeRepository;
    private final ObjectMapper objectMapper;

    @Override
    public RecipeSearchSubscription createSubscription(Integer userId, RecipeSearchSubscriptionDTO subscriptionDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RecipeSearchSubscription subscription = new RecipeSearchSubscription();
        subscription.setUser(user);

        try {
            // Convert search criteria to JSON string
            String searchCriteriaJson = objectMapper.writeValueAsString(subscriptionDTO.getSearchCriteria());
            subscription.setSearchCriteria(searchCriteriaJson);
        } catch (Exception e) {
            throw new RuntimeException("Error serializing search criteria", e);
        }

        subscription.setCreatedAt(LocalDateTime.now());

        return subscriptionRepository.save(subscription);
    }

    @Override
    public List<RecipeSearchSubscription> getUserSubscriptions(Integer userId) {
        return subscriptionRepository.findByUserUserId(userId);
    }

    @Override
    public void deleteSubscription(Integer subscriptionId) {
        subscriptionRepository.deleteById(subscriptionId);
    }

    @Override
    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void checkForNewMatches() {
        List<RecipeSearchSubscription> allSubscriptions = subscriptionRepository.findAll();

        for (RecipeSearchSubscription subscription : allSubscriptions) {
            try {
                RecipeSearchCriteriaDTO searchCriteria = objectMapper.readValue(
                        subscription.getSearchCriteria(),
                        RecipeSearchCriteriaDTO.class
                );

                LocalDateTime lastNotified = subscription.getLastNotified();
                if (lastNotified == null) {
                    lastNotified = subscription.getCreatedAt();
                }

                // Get all recipes created after last notification
                List<Recipe> newRecipes = recipeRepository.findByCreatedAtAfter(lastNotified);

                // Filter recipes based on search criteria
                List<Recipe> matchingRecipes = searchService.searchRecipes(searchCriteria)
                        .stream()
                        .filter(recipe -> newRecipes.contains(recipe))
                        .collect(Collectors.toList());

                if (!matchingRecipes.isEmpty()) {
                    // Create notification
                    Notification notification = new Notification();
                    notification.setUser(subscription.getUser());
                    notification.setType("SEARCH_MATCH");

                    if (matchingRecipes.size() == 1) {
                        Recipe recipe = matchingRecipes.get(0);
                        notification.setMessage("New recipe found: " + recipe.getTitle());
                        notification.setRelatedEntityId(recipe.getRecipeId());
                    } else {
                        notification.setMessage(matchingRecipes.size() + " new recipes match your search criteria");
                    }

                    notificationRepository.save(notification);

                    // Update last notified time
                    subscription.setLastNotified(LocalDateTime.now());
                    subscriptionRepository.save(subscription);
                }
            } catch (Exception e) {
                log.error("Error processing subscription ID {}: {}", subscription.getSubscriptionId(), e.getMessage());
            }
        }
    }
}