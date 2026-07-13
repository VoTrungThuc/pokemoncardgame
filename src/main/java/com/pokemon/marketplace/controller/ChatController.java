package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.ChatMessageDTO;
import com.pokemon.marketplace.dto.UserDTO;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getChatHistory() {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to get chat history for User ID: {}", userId);
        List<ChatMessageDTO> chat = chatService.getChatMessages(userId);
        return ResponseEntity.ok(ApiResponse.success(chat, "Fetched chat history successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendMessage(
            @RequestParam String message,
            @RequestParam(required = false) String imageUrl) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to send message from User ID: {}", userId);
        ChatMessageDTO chatMessage = chatService.sendMessage(userId, message, imageUrl);
        return ResponseEntity.ok(ApiResponse.success(chatMessage, "Message sent successfully"));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getChatUsers() {
        log.info("REST request by Admin to get all users with chat history");
        List<UserDTO> users = chatService.getChatUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Fetched chat users successfully"));
    }

    @GetMapping("/admin/{userId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getCustomerChatHistory(@PathVariable Long userId) {
        log.info("REST request by Admin to get chat history for Customer User ID: {}", userId);
        List<ChatMessageDTO> chat = chatService.getChatMessages(userId);
        return ResponseEntity.ok(ApiResponse.success(chat, "Fetched customer chat history successfully"));
    }

    @PostMapping("/admin/{userId}")
    public ResponseEntity<ApiResponse<ChatMessageDTO>> sendAdminMessage(
            @PathVariable Long userId,
            @RequestParam String message,
            @RequestParam(required = false) String imageUrl) {
        log.info("REST request by Admin to send message to Customer User ID: {}", userId);
        ChatMessageDTO chatMessage = chatService.sendAdminMessage(userId, message, imageUrl);
        return ResponseEntity.ok(ApiResponse.success(chatMessage, "Admin message sent successfully"));
    }
}
