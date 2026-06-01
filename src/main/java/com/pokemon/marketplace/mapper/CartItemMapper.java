package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.CartItemDTO;
import com.pokemon.marketplace.entity.CartItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CartItemMapper {

    private final ProductMapper productMapper;

    public CartItemDTO toDTO(CartItem cartItem) {
        if (cartItem == null) return null;
        return CartItemDTO.builder()
                .id(cartItem.getId())
                .product(productMapper.toDTO(cartItem.getProduct()))
                .quantity(cartItem.getQuantity())
                .build();
    }
}
