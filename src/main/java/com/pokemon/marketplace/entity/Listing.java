package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    private Long id;

    @DBRef(lazy = true)
    private User user;

    @DBRef(lazy = true)
    private Product card;

    private BigDecimal price;

    @Field("is_available")
    private Boolean isAvailable;

    @Field("created_at")
    private LocalDateTime createdAt;
}
