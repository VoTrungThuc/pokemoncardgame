package com.pokemon.marketplace.entity;

import com.pokemon.marketplace.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    private Long id;

    @DBRef(lazy = true)
    private User user;

    @Field("recipient_name")
    private String recipientName;

    private String phone;

    @Field("shipping_address")
    private String shippingAddress;

    private String note;

    @Field("payment_method")
    private String paymentMethod;

    @Field("delivery_type")
    private String deliveryType; // "ONLINE_COLLECTION" or "PHYSICAL_SHIPPING"

    @Field("total_amount")
    private BigDecimal totalAmount;

    private OrderStatus status;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
