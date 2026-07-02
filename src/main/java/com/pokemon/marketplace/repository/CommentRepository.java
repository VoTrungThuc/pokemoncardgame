package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, Long> {
    List<Comment> findByProductIdOrderByCreatedAtDesc(Long productId);
}
