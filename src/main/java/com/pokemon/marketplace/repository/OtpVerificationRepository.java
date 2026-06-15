package com.pokemon.marketplace.repository;

import com.pokemon.marketplace.entity.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
    Optional<OtpVerification> findByEmail(String email);
    Optional<OtpVerification> findByUsername(String username);
}
