package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionDTO {
    private Long id;
    private String cardName;
    private String imageUrl;
    private String rarity;
    private String condition;
    private BigDecimal currentBid;
    private String highestBidder;
    private Integer bidsCount;
    private ZonedDateTime endTime;
    private String status;
    private Boolean createdByAdmin;
    private List<AuctionBidDTO> bidHistory;
}
