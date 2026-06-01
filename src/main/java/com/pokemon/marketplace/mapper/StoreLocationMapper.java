package com.pokemon.marketplace.mapper;

import com.pokemon.marketplace.dto.StoreLocationDTO;
import com.pokemon.marketplace.entity.StoreLocation;
import org.springframework.stereotype.Component;

@Component
public class StoreLocationMapper {

    public StoreLocationDTO toDTO(StoreLocation s) {
        if (s == null) return null;
        return StoreLocationDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .address(s.getAddress())
                .phone(s.getPhone())
                .workingHours(s.getWorkingHours())
                .latitude(s.getLatitude())
                .longitude(s.getLongitude())
                .build();
    }
}
