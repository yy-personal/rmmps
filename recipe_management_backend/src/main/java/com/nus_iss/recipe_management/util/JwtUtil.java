package com.nus_iss.recipe_management.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET_KEY = "nus-iss-Secret-Key-JWT-Generation-31415926"; // Use a long, random secret key
    private static final long EXPIRATION_TIME = 86400000; // 1 day in milliseconds
    private static final long ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000;  // 15 minutes
    private static final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 3600 * 1000; // 7 days
//    private static final long EXPIRATION_TIME = 180000; // 3 minutes in milliseconds

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generateAccessToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("tokenType", "ACCESS") // Add token type
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("tokenType", "REFRESH") // Add token type
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract Token Type
    public String extractTokenType(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().get("tokenType", String.class);
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token, String username) {
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getExpiration().before(new Date());
    }
}
