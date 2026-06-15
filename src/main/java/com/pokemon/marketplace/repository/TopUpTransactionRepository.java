package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.TopUpTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopUpTransactionRepository extends MongoRepository<TopUpTransaction, String> {
}
