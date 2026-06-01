package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    @Query("SELECT l FROM Listing l JOIN FETCH l.user JOIN FETCH l.card WHERE :availableOnly = false OR l.isAvailable = true")
    List<Listing> findAllListings(@Param("availableOnly") boolean availableOnly);

    @Query("SELECT l FROM Listing l JOIN FETCH l.user JOIN FETCH l.card WHERE l.id = :id")
    Optional<Listing> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT l FROM Listing l JOIN FETCH l.user JOIN FETCH l.card WHERE l.user.id = :userId AND l.card.id = :cardId AND l.isAvailable = true")
    List<Listing> findActiveByUserAndCard(@Param("userId") Long userId, @Param("cardId") Long cardId);
}
