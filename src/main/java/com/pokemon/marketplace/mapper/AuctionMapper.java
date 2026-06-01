package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.AuctionDTO;
import com.pokemon.marketplace.dto.AuctionBidDTO;
import com.pokemon.marketplace.entity.Auction;
import com.pokemon.marketplace.entity.AuctionBid;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class AuctionMapper {

    public AuctionBidDTO toDTO(AuctionBid bid) {
        if (bid == null) return null;
        return AuctionBidDTO.builder()
                .id(bid.getId())
                .bidder(bid.getBidder())
                .amount(bid.getAmount())
                .bidTime(bid.getBidTime() != null
                        ? bid.getBidTime().atZone(java.time.ZoneId.systemDefault())
                        : null)
                .build();
    }

    public AuctionDTO toDTO(Auction auction) {
        if (auction == null) return null;
        return AuctionDTO.builder()
                .id(auction.getId())
                .cardName(auction.getCardName())
                .imageUrl(auction.getImageUrl())
                .rarity(auction.getRarity())
                .condition(auction.getCondition())
                .currentBid(auction.getCurrentBid())
                .highestBidder(auction.getHighestBidder())
                .bidsCount(auction.getBidsCount())
                .endTime(auction.getEndTime() != null
                        ? auction.getEndTime().atZone(java.time.ZoneId.systemDefault())
                        : null)
                .status(auction.getStatus())
                .createdByAdmin(auction.getCreatedByAdmin())
                .bidHistory(auction.getBidHistory() != null
                        ? auction.getBidHistory().stream()
                                .map(this::toDTO)
                                .sorted((b1, b2) -> b2.getBidTime().compareTo(b1.getBidTime())) 
                                .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
}
