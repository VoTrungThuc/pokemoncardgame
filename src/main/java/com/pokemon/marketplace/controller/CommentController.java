package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.entity.Comment;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.CommentRepository;
import com.pokemon.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products/{productId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long productId) {
        log.info("REST request to get comments for product ID: {}", productId);
        List<Comment> comments = commentRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return ResponseEntity.ok(ApiResponse.success(comments, "Fetched comments successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable Long productId,
            @RequestBody Comment commentRequest) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("REST request by user: {} to comment on product ID: {}", username, productId);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if (commentRequest.getContent() == null || commentRequest.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung nhận xét không được để trống.");
        }

        Comment comment = Comment.builder()
                .productId(productId)
                .userId(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .content(commentRequest.getContent().trim())
                .parentId(commentRequest.getParentId())
                .createdAt(LocalDateTime.now())
                .build();

        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(ApiResponse.success(saved, "Đã gửi nhận xét thành công"));
    }
}
