package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Trade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TradeRepository extends MongoRepository<Trade, Long> {

    @Query(value = "{ '$or': [ { 'fromUser.$id': ?0 }, { 'toUser.$id': ?0 } ] }", sort = "{ 'created_at': -1 }")
    List<Trade> findByUserIdWithRelations(Long userId);

    default Optional<Trade> findByIdWithRelations(Long id) {
        return findById(id);
    }
}
