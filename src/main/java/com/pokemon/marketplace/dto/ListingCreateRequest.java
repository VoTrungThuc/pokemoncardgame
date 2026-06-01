package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingCreateRequest {
    private Long userId;
    private Long cardId;
    private BigDecimal price;
}
