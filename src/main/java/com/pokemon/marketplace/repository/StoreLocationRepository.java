package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.StoreLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreLocationRepository extends MongoRepository<StoreLocation, Long> {
}
