package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends MongoRepository<CartItem, Long> {
    @Query("{ 'user.$id': ?0 }")
    List<CartItem> findByUserId(Long userId);

    @Query("{ 'user.$id': ?0, 'product.$id': ?1 }")
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    @Query(value = "{ 'user.$id': ?0 }", delete = true)
    void deleteByUserId(Long userId);
}
