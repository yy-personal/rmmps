package com.nus_iss.recipe_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String email;
    private String passwordHash;
    private List<Integer> dietaryRestrictionIdList;
}
