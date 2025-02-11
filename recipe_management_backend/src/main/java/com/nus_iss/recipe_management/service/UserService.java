package com.nus_iss.recipe_management.service;

import com.nus_iss.recipe_management.model.*;
import java.util.List;

public interface UserService {
    User createUser(User recipe);
    List<User> getAllUsers();
    User getUserById(Integer id);
    void deleteUser(Integer id);
}
