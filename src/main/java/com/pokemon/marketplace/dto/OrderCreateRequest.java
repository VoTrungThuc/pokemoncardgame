package com.pokemon.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequest {

    private String recipientName;

    private String phone;

    private String shippingAddress;

    private String note;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String deliveryType; // "ONLINE_COLLECTION" or "PHYSICAL_SHIPPING"
}
