package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.WithdrawRequestDTO;
import com.pokemon.marketplace.entity.WithdrawRequest;
import org.springframework.stereotype.Component;

@Component
public class WithdrawRequestMapper {

    public WithdrawRequestDTO toDTO(WithdrawRequest w) {
        if (w == null) return null;
        return WithdrawRequestDTO.builder()
                .id(w.getId())
                .userId(w.getUserId())
                .username(w.getUsername())
                .amount(w.getAmount())
                .bankName(w.getBankName())
                .bankAccountNumber(w.getBankAccountNumber())
                .accountHolder(w.getAccountHolder())
                .status(w.getStatus())
                .adminNote(w.getAdminNote())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
