package com.nus_iss.recipe_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nus_iss.recipe_management.model.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}
