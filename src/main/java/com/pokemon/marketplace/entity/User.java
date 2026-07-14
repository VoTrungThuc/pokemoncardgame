package com.pokemon.marketplace.entity;

import com.pokemon.marketplace.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private Long id;

    private String username;

    private String name;

    private String email;

    private String password;

    private String phone;

    @Field("shipping_address")
    private String shippingAddress;

    private UserRole role;

    @Field("avatar_url")
    private String avatarUrl;

    @Field("fcm_token")
    private String fcmToken;

    @Builder.Default
    private Double balance = 0.0;
}
