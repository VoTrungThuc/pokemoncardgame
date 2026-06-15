package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Order;
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
}
