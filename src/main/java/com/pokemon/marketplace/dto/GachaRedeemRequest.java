package com.pokemon.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GachaRedeemRequest {

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Phone is required")
    private String phone;

    // "STORE_PICKUP" or "SHIPPING"
    @NotBlank(message = "Delivery method is required")
    private String deliveryMethod;

    // Required if SHIPPING
    private String shippingAddress;

    // Required if STORE_PICKUP
    private String storeName;

    private String note;

    @NotEmpty(message = "Product IDs to redeem are required")
    private List<Long> productIds;

    @NotEmpty(message = "Quantities to redeem are required")
    private List<Integer> quantities;
}
