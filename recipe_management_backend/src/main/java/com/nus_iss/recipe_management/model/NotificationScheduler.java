package com.nus_iss.recipe_management.model;

import com.nus_iss.recipe_management.repository.UserRepository;
import com.nus_iss.recipe_management.service.RecipeRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final RecipeRecommendationService recipeRecommendationService;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * *")  // Runs every 24 hours
    public void refreshAllRecommendations() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            recipeRecommendationService.getRecommendedRecipes(user.getUserId());
        }
    }
}

