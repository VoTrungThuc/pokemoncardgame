package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.WithdrawRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WithdrawRequestRepository extends MongoRepository<WithdrawRequest, Long> {
    List<WithdrawRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WithdrawRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<WithdrawRequest> findAllByOrderByCreatedAtDesc();
}
