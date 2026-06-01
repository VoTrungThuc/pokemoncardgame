package com.pokemon.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String sender; 

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "is_auto_reply", nullable = false)
    @Builder.Default
    private boolean isAutoReply = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
