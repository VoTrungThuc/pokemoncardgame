package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Auction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionRepository extends MongoRepository<Auction, Long> {
}
