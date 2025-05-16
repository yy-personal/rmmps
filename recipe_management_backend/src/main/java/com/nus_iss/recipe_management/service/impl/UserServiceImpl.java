package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.dto.UserDTO;
import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.*;
import com.nus_iss.recipe_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final DietaryRestrictionRepository dietaryRestrictionRepository;

    @Override
    public User createUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(userDTO.getPasswordHash());
        user.setCreatedAt(LocalDateTime.now());

        // Get Dietary Restrictions
        List<DietaryRestriction> dietaryRestrictionList = dietaryRestrictionRepository.findAllById(userDTO.getDietaryRestrictionIdList());

        user.setDietaryRestrictions(new HashSet<>(dietaryRestrictionList));

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {return userRepository.findByEmail(email); }

    // User Dietary Restrictions
    @Override
    @Transactional
    public User addDietaryRestriction(Integer userId, Integer dietaryRestrictionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User authUser = findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer authUserId = authUser.getUserId();

        if(!authUserId.equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this user.");
        }

        DietaryRestriction dietaryRestriction = dietaryRestrictionRepository.findById(dietaryRestrictionId)
                .orElseThrow(() -> new RuntimeException("Dietary restriction not found"));

        // Add dietary restriction
        user.getDietaryRestrictions().add(dietaryRestriction);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeDietaryRestriction(Integer userId, Integer dietaryRestrictionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User authUser = findByEmail(username).orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Value not present"));;
        Integer authUserId = authUser.getUserId();

        if(!authUserId.equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this user.");
        }

        DietaryRestriction dietaryRestriction = dietaryRestrictionRepository.findById(dietaryRestrictionId)
                .orElseThrow(() -> new RuntimeException("Dietary restriction not found"));

        // Remove dietary restriction
        user.getDietaryRestrictions().remove(dietaryRestriction);

        userRepository.save(user);
    }
}
