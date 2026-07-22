package com.pokemon.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreBankInfo {
    private String bankName;
    private String bankAccountNumber;
    private String accountHolder;
}
