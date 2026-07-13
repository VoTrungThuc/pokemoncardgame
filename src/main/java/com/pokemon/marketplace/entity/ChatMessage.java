package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    private Long id;

    @DBRef(lazy = true)
    private User user;

    private String sender; 

    private String message;

    @Field("image_url")
    private String imageUrl;

    @Field("is_auto_reply")
    @Builder.Default
    private boolean isAutoReply = false;

    @Field("created_at")
    private LocalDateTime createdAt;
}
