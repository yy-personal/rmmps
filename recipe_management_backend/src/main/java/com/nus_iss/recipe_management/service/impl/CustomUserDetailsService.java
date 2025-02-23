package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<com.nus_iss.recipe_management.model.User> user = userRepository.findByEmail(username);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        // Convert User entity to Spring Security's UserDetails
        return User.builder()
                .username(user.get().getEmail())
                .password(user.get().getPasswordHash())
                .roles("USER") // TODO: dynamically assign when roles are implemented
                .build();
    }
}
