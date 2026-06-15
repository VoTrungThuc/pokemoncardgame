package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, Long> {
    @Query(value = "{ 'user.$id': ?0 }", sort = "{ 'created_at': 1 }")
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    @Query(value = "{ 'user.$id': ?0, 'sender': ?1, 'is_auto_reply': ?2 }", exists = true)
    boolean existsByUserIdAndSenderAndIsAutoReply(Long userId, String sender, boolean isAutoReply);
}
