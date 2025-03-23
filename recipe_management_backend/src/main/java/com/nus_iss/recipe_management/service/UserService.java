package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.dto.UserDTO;
import com.nus_iss.recipe_management.model.*;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(UserDTO userDTO);
    List<User> getAllUsers();
    User getUserById(Integer id);
    void deleteUser(Integer id);
    Optional<User> findByEmail(String email);
    User addDietaryRestriction(Integer userId, Integer dietaryRestrictionId);
    void removeDietaryRestriction(Integer userId, Integer dietaryRestrictionId);
}
