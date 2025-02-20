package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.service.UserService;
import com.nus_iss.recipe_management.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.nus_iss.recipe_management.model.User;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User newUser) {
        // Check if email is already taken
        if (userService.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Hash password with BCrypt
        String hashedPassword = passwordEncoder.encode(newUser.getPasswordHash());

        // Save user to the database
        newUser.setPasswordHash(hashedPassword);
        userService.createUser(newUser);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?>login(@RequestBody User user) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPasswordHash()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("accessToken", accessToken, "refreshToken", refreshToken));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String refreshToken = authHeader.substring(7); // Extract token after "Bearer "
        String tokenType = jwtUtil.extractTokenType(refreshToken);

        if (!"REFRESH".equals(tokenType)) {
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body("Only refresh tokens are allowed for refresh");
        }


        String username = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtUtil.validateToken(refreshToken, userDetails.getUsername())) {
            return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body("Invalid refresh token");
        }

        String newAccessToken = jwtUtil.generateAccessToken(username);

        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken
        ));
    }
}