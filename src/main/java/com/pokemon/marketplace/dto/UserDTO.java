package com.pokemon.marketplace.dto;

import com.pokemon.marketplace.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String shippingAddress;
    private UserRole role;
    private Double balance;
    private String avatarUrl;
}
