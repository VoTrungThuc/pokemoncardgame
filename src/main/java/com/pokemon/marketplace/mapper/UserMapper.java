package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.UserDTO;
import com.pokemon.marketplace.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .shippingAddress(user.getShippingAddress())
                .role(user.getRole())
                .build();
    }
}
