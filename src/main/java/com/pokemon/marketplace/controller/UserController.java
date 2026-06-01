package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.RegisterRequest;
import com.pokemon.marketplace.dto.UpdateRoleRequest;
import com.pokemon.marketplace.dto.UserDTO;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.entity.enums.UserRole;
import com.pokemon.marketplace.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        log.info("REST request to get all users by Admin");
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .shippingAddress(user.getShippingAddress())
                        .role(user.getRole())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(userDTOs, "Fetched all users successfully"));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> createAdmin(@Valid @RequestBody RegisterRequest request) {
        log.info("REST request to create admin by Admin: {}", request.getUsername());
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .shippingAddress(request.getShippingAddress())
                .role(UserRole.ADMIN)
                .build();

        User savedUser = userRepository.save(user);

        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Admin created successfully"));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        log.info("REST request to update role of user {} to {}", id, request.getRole());

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setRole(request.getRole());
        User savedUser = userRepository.save(user);

        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.success(responseDTO, "User role updated successfully"));
    }
}
