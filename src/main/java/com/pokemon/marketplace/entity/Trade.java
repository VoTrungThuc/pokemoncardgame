package com.pokemon.marketplace.entity;

import com.pokemon.marketplace.entity.enums.TradeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "trades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trade {

    @Id
    private Long id;

    @DBRef(lazy = true)
    private User fromUser;

    @DBRef(lazy = true)
    private User toUser;

    @DBRef(lazy = true)
    private Product offeredCard;

    @DBRef(lazy = true)
    private Product requestedCard;

    private TradeStatus status;

    @Field("created_at")
    private LocalDateTime createdAt;
}
