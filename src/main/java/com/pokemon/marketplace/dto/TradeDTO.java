package com.pokemon.marketplace.dto;

import com.pokemon.marketplace.entity.enums.TradeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeDTO {
    private Long id;
    private UserDTO fromUser;
    private UserDTO toUser;
    private ProductDTO offeredCard;
    private ProductDTO requestedCard;
    private TradeStatus status;
    private LocalDateTime createdAt;
}
