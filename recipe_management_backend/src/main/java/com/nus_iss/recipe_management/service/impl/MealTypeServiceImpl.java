package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.model.MealType;
import com.nus_iss.recipe_management.repository.MealTypeRepository;
import com.nus_iss.recipe_management.service.MealTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MealTypeServiceImpl implements MealTypeService {
    private final MealTypeRepository mealTypeRepository;

    @Override
    public MealType createMealType(MealType mealType) {
        return mealTypeRepository.save(mealType);
    }

    @Override
    public List<MealType> getAllMealTypes() {
        return mealTypeRepository.findAll();
    }

    @Override
    public MealType getMealTypeById(Integer id) {
        return mealTypeRepository.findById(id).orElse(null);
    }

    @Override
    public Optional<MealType> findByName(String name) {
        return mealTypeRepository.findByName(name);
    }

    @Override
    public void deleteMealType(Integer id) {
        mealTypeRepository.deleteById(id);
    }
}