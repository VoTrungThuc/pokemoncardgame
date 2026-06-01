package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradeCreateRequest {
    private Long fromUserId;
    private Long toUserId;
    private Long offeredCardId;
    private Long requestedCardId;
}
