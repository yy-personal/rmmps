package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.service.UserService;
import com.nus_iss.recipe_management.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
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
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;
import com.nus_iss.recipe_management.model.User;

import java.io.IOException;
import java.io.PrintWriter;
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is already in use!"));
        }

        // Hash password with BCrypt
        String hashedPassword = passwordEncoder.encode(newUser.getPasswordHash());

        // Save user to the database
        newUser.setPasswordHash(hashedPassword);
        userService.createUser(newUser);

        UserDetails userDetails = userDetailsService.loadUserByUsername(newUser.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("accessToken", accessToken, "refreshToken", refreshToken));
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body(Map.of("message","Missing or invalid Authorization header"));
        }

        String refreshToken = authHeader.substring(7); // Extract token after "Bearer "

        try {
            String tokenType = jwtUtil.extractTokenType(refreshToken);

            if (!"REFRESH".equals(tokenType)) {
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(Map.of("message", "Only refresh tokens are allowed for refresh"));
            }

            String username = jwtUtil.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtUtil.validateToken(refreshToken, userDetails.getUsername())) {
                return ResponseEntity.status(HttpServletResponse.SC_FORBIDDEN).body(Map.of("message","Invalid refresh token"));
            }

            String newAccessToken = jwtUtil.generateAccessToken(username);

            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken
            ));
        } catch (ExpiredJwtException e) {
            return ResponseEntity
                    .status(HttpServletResponse.SC_UNAUTHORIZED)
                    .body(Map.of("message", "Token expired. Please login again."));
        } catch (SignatureException | MalformedJwtException e) {
            return ResponseEntity
                    .status(HttpServletResponse.SC_UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token. Authentication failed."));
        } catch (UnsupportedJwtException e) {
            return ResponseEntity
                    .status(HttpServletResponse.SC_UNAUTHORIZED)
                    .body(Map.of("message", "Unsupported JWT token."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpServletResponse.SC_UNAUTHORIZED)
                    .body(Map.of("message", "Token claims string is empty."));
        }
    }
}