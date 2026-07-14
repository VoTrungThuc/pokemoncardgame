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
                        .balance(user.getBalance())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(userDTOs, "Fetched all users successfully"));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> createAdmin(@Valid @RequestBody RegisterRequest request) {
        log.info("REST request to create admin by Admin: {}", request.getUsername());
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .username(username)
                .email(email)
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
                .balance(savedUser.getBalance())
                .avatarUrl(savedUser.getAvatarUrl())
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
                .balance(savedUser.getBalance())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();

        return ResponseEntity.ok(ApiResponse.success(responseDTO, "User role updated successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        UserDTO responseDTO = UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .shippingAddress(user.getShippingAddress())
                .role(user.getRole())
                .balance(user.getBalance() != null ? user.getBalance() : 0.0)
                .avatarUrl(user.getAvatarUrl())
                .build();
        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Profile fetched successfully"));
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<UserDTO>> deposit(@RequestParam Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (!"user".equals(username)) {
            throw new IllegalArgumentException("Tài khoản của bạn không được phép nạp tiền trực tiếp. Vui lòng nạp qua VNPay QR!");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        user.setBalance((user.getBalance() != null ? user.getBalance() : 0.0) + amount);
        User savedUser = userRepository.save(user);
        
        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .balance(savedUser.getBalance())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();
        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Deposited " + amount + " successfully"));
    }

    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<UserDTO>> refund(@RequestParam Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        user.setBalance((user.getBalance() != null ? user.getBalance() : 0.0) + amount);
        User savedUser = userRepository.save(user);
        
        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .balance(savedUser.getBalance())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();
        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Refunded " + amount + " successfully"));
    }

    @PostMapping("/deduct")
    public ResponseEntity<ApiResponse<UserDTO>> deduct(@RequestParam Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
        if (currentBalance < amount) {
            throw new IllegalStateException("Số dư không đủ để thực hiện giao dịch.");
        }
        
        user.setBalance(currentBalance - amount);
        User savedUser = userRepository.save(user);
        
        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .balance(savedUser.getBalance())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();
        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Deducted " + amount + " successfully"));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @Valid @RequestBody UserDTO updateDTO) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        if (updateDTO.getPhone() != null) {
            user.setPhone(updateDTO.getPhone().trim());
        }
        if (updateDTO.getShippingAddress() != null) {
            user.setShippingAddress(updateDTO.getShippingAddress().trim());
        }
        if (updateDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(updateDTO.getAvatarUrl().trim());
        }
        if (updateDTO.getName() != null) {
            user.setName(updateDTO.getName().trim());
        }

        User savedUser = userRepository.save(user);

        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .balance(savedUser.getBalance())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();
        log.info("Profile updated successfully for user: {}", username);
        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Profile updated successfully"));
    }
}
