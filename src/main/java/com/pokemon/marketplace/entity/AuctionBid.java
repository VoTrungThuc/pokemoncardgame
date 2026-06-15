package com.pokemon.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionBid {

    @Id
    private Long id;

    @Transient
    @JsonIgnore
    private Auction auction;

    private String bidder;

    private BigDecimal amount;

    @Field("bid_time")
    private LocalDateTime bidTime;
}
