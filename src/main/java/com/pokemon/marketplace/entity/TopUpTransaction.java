package com.pokemon.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "topup_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopUpTransaction {

    @Id
    private String id; 

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount; 

    @Column(nullable = false, length = 20)
    private String status; 

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
