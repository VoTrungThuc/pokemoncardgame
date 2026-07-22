package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawCreateRequest {
    private BigDecimal amount;
    private String bankName;
    private String bankAccountNumber;
    private String accountHolder;
}
