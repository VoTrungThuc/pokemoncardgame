package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Listing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ListingRepository extends MongoRepository<Listing, Long> {
    List<Listing> findByIsAvailable(boolean isAvailable);

    @Query("{ 'user.$id': ?0, 'card.$id': ?1, 'is_available': true }")
    List<Listing> findActiveByUserAndCard(Long userId, Long cardId);
}
