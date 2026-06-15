package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.AuctionBid;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionBidRepository extends MongoRepository<AuctionBid, Long> {
}
