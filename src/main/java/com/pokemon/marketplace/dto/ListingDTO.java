package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingDTO {
    private Long id;
    private UserDTO user;
    private ProductDTO card;
    private BigDecimal price;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
}
