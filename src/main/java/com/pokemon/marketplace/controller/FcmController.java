package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
public class FcmController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestParam String token) {
        Long userId = getAuthenticatedUserId();
        log.info("Registering FCM token for User ID: {}", userId);
        chatService.registerToken(userId, token);
        return ResponseEntity.ok(ApiResponse.success(null, "FCM token registered"));
    }
}
