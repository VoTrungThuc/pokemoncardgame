package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends MongoRepository<OrderItem, Long> {
}
