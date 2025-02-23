package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.*;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(User recipe);
    List<User> getAllUsers();
    User getUserById(Integer id);
    void deleteUser(Integer id);
    Optional<User> findByEmail(String email);
}
