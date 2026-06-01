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

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\d{9,11}$", message = "Số điện thoại chỉ được chứa số và dài từ 9 đến 11 ký tự")
    private String phone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String note;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
