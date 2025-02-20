package com.nus_iss.recipe_management.controller;

import com.nus_iss.recipe_management.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(credentials.get("username"), credentials.get("password")));

        UserDetails userDetails = userDetailsService.loadUserByUsername(credentials.get("username"));
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());


        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
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