package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction {

    @Id
    private Long id;

    @Field("card_name")
    private String cardName;

    @Field("image_url")
    private String imageUrl;

    private String rarity;

    @Field("card_condition")
    private String condition;

    @Field("current_bid")
    private BigDecimal currentBid;

    @Field("highest_bidder")
    private String highestBidder;

    @Field("bids_count")
    private Integer bidsCount;

    @Field("end_time")
    private LocalDateTime endTime;

    private String status; 

    @Field("created_by_admin")
    private Boolean createdByAdmin;

    @Field("bid_history")
    @Builder.Default
    private List<AuctionBid> bidHistory = new ArrayList<>();
}
