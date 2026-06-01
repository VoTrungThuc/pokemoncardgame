package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {

    @Query("SELECT t FROM Trade t JOIN FETCH t.fromUser JOIN FETCH t.toUser JOIN FETCH t.offeredCard JOIN FETCH t.requestedCard " +
           "WHERE t.fromUser.id = :userId OR t.toUser.id = :userId " +
           "ORDER BY t.createdAt DESC")
    List<Trade> findByUserIdWithRelations(@Param("userId") Long userId);

    @Query("SELECT t FROM Trade t JOIN FETCH t.fromUser JOIN FETCH t.toUser JOIN FETCH t.offeredCard JOIN FETCH t.requestedCard " +
           "WHERE t.id = :id")
    Optional<Trade> findByIdWithRelations(@Param("id") Long id);
}
