package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.ChatMessage;
import com.pokemon.marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    @Query("SELECT DISTINCT m.user FROM ChatMessage m ORDER BY m.user.username ASC")
    List<User> findDistinctUsersWithMessages();

    @Query("SELECT COUNT(m) > 0 FROM ChatMessage m WHERE m.user.id = :userId AND m.sender = :sender AND m.isAutoReply = :isAutoReply")
    boolean existsByUserIdAndSenderAndIsAutoReply(
        @org.springframework.data.repository.query.Param("userId") Long userId,
        @org.springframework.data.repository.query.Param("sender") String sender,
        @org.springframework.data.repository.query.Param("isAutoReply") boolean isAutoReply
    );
}
