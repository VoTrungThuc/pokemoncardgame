package com.pokemon.marketplace.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "withdraw_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequest {

    @Id
    private Long id;

    @Field("user_id")
    private Long userId;

    @Field("username")
    private String username;

    private BigDecimal amount;

    @Field("bank_name")
    private String bankName;

    @Field("bank_account_number")
    private String bankAccountNumber;

    @Field("account_holder")
    private String accountHolder;

    private String status;

    @Field("admin_note")
    private String adminNote;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
