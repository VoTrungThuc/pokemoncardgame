package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequestDTO {
    private Long id;
    private Long userId;
    private String username;
    private BigDecimal amount;
    private String bankName;
    private String bankAccountNumber;
    private String accountHolder;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
