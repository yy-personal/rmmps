package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.model.Recipe;
import com.nus_iss.recipe_management.repository.RecipeRepository;
import com.nus_iss.recipe_management.repository.UserRepository;
import com.nus_iss.recipe_management.service.RecipeRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RecipeRecommendationServiceImpl implements RecipeRecommendationService {
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    private final Map<Integer, List<Recipe>> cachedRecommendations = new ConcurrentHashMap<>();
    private final Map<Integer, LocalDateTime> lastUpdated = new ConcurrentHashMap<>();

    // Refreshes Recommendations Every 24 Hours
    @Override

    public List<Recipe> getRecommendedRecipes(Integer userId) {
        // Check if recommendations were updated in the last 24 hours
        if (cachedRecommendations.containsKey(userId) &&
                lastUpdated.containsKey(userId) &&
                lastUpdated.get(userId).isAfter(LocalDateTime.now().minusHours(24))) {
            return cachedRecommendations.get(userId);
        }

        // Fetch new recommendations
        List<Recipe> recommendations = recipeRepository.findRecommendedRecipes(userId);

        // Cache recommendations and update timestamp
        cachedRecommendations.put(userId, recommendations);
        lastUpdated.put(userId, LocalDateTime.now());

        return recommendations;
    }
}
