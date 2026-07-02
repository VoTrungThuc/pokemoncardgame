package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    private Long id;

    @Field("product_id")
    private Long productId;

    @Field("user_id")
    private Long userId;

    private String username;

    @Field("avatar_url")
    private String avatarUrl;

    private String content;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("parent_id")
    private Long parentId;
}
