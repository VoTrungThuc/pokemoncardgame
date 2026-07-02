package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Order;
import com.pokemon.marketplace.entity.enums.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, Long> {
    
    @Query(value = "{ 'user.$id': ?0 }", sort = "{ 'created_at': -1 }")
    List<Order> findByUserIdWithItems(Long userId);
    
    @Query(value = "{}", sort = "{ 'created_at': -1 }")
    List<Order> findAllWithItems();

    @Query("{ 'status': ?0, 'auction_id': { $ne: null } }")
    List<Order> findPendingAuctionOrders(OrderStatus status);
}
