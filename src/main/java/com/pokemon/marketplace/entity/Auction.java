package com.pokemon.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_name", nullable = false)
    private String cardName;

    @Column(name = "image_url")
    private String imageUrl;

    private String rarity;

    @Column(name = "card_condition")
    private String condition;

    @Column(name = "current_bid", nullable = false)
    private BigDecimal currentBid;

    @Column(name = "highest_bidder")
    private String highestBidder;

    @Column(name = "bids_count", nullable = false)
    private Integer bidsCount;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String status; 

    @Column(name = "created_by_admin", nullable = false)
    private Boolean createdByAdmin;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<AuctionBid> bidHistory = new ArrayList<>();
}
