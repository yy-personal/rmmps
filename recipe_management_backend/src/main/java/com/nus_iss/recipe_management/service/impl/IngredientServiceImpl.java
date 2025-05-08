package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.model.Ingredient;
import com.nus_iss.recipe_management.repository.IngredientRepository;
import com.nus_iss.recipe_management.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {
    private final IngredientRepository ingredientRepository;

    @Override
    public Ingredient createIngredient(Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }

    @Override
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    @Override
    public Ingredient getIngredientById(Integer id) {
        return ingredientRepository.findById(id).orElse(null);
    }

    @Override
    public Optional<Ingredient> findByName(String name) {
        return ingredientRepository.findByName(name);
    }

    @Override
    public void deleteIngredient(Integer id) {
        ingredientRepository.deleteById(id);
    }
}