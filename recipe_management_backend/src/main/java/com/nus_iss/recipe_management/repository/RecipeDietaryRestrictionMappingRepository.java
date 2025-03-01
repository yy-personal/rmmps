package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nus_iss.recipe_management.model.*;

public interface RecipeDietaryRestrictionMappingRepository extends JpaRepository<RecipeDietaryRestrictionMapping, RecipeDietaryRestrictionMappingId> {}
