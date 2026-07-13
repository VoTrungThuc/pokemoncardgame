package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.ChatMessageDTO;
import com.pokemon.marketplace.entity.ChatMessage;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageMapper {

    public ChatMessageDTO toDTO(ChatMessage c) {
        if (c == null) return null;
        return ChatMessageDTO.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .sender(c.getSender())
                .message(c.getMessage())
                .imageUrl(c.getImageUrl())
                .createdAt(c.getCreatedAt())
                .isAutoReply(c.isAutoReply())
                .build();
    }
}
