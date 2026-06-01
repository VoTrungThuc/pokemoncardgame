package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.TopUpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopUpTransactionRepository extends JpaRepository<TopUpTransaction, String> {
}
