package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.TradeDTO;
import com.pokemon.marketplace.entity.Trade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeMapper {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;

    public TradeDTO toDTO(Trade trade) {
        if (trade == null) return null;
        return TradeDTO.builder()
                .id(trade.getId())
                .fromUser(userMapper.toDTO(trade.getFromUser()))
                .toUser(userMapper.toDTO(trade.getToUser()))
                .offeredCard(productMapper.toDTO(trade.getOfferedCard()))
                .requestedCard(productMapper.toDTO(trade.getRequestedCard()))
                .status(trade.getStatus())
                .createdAt(trade.getCreatedAt())
                .build();
    }
}
