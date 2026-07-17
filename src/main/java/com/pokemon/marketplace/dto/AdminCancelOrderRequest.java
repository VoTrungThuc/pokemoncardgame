package com.pokemon.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCancelOrderRequest {
    @NotBlank(message = "Lý do hủy đơn hàng không được để trống")
    private String reason;
}
