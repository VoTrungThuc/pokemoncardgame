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
public class AuctionClaimRequest {

    @NotBlank(message = "Tên người nhận là bắt buộc")
    private String recipientName;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    private String phone;

    @NotBlank(message = "Phương thức nhận hàng là bắt buộc")
    private String deliveryMethod; // "STORE_PICKUP" hoặc "SHIPPING"

    private String shippingAddress;

    private String storeName;

    private String note;

    private String paymentMethod;
}
