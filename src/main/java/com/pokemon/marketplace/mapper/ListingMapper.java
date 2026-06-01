package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.ListingDTO;
import com.pokemon.marketplace.entity.Listing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ListingMapper {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;

    public ListingDTO toDTO(Listing listing) {
        if (listing == null) return null;
        return ListingDTO.builder()
                .id(listing.getId())
                .user(userMapper.toDTO(listing.getUser()))
                .card(productMapper.toDTO(listing.getCard()))
                .price(listing.getPrice())
                .isAvailable(listing.getIsAvailable())
                .createdAt(listing.getCreatedAt())
                .build();
    }
}
