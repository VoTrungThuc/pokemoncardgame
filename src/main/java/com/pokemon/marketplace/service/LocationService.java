package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.StoreLocationDTO;
import com.pokemon.marketplace.mapper.StoreLocationMapper;
import com.pokemon.marketplace.repository.StoreLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final StoreLocationRepository storeLocationRepository;
    private final StoreLocationMapper storeLocationMapper;

    @Transactional(readOnly = true)
    public List<StoreLocationDTO> getAllLocations() {
        log.info("Fetching all store locations");
        return storeLocationRepository.findAll().stream()
                .map(storeLocationMapper::toDTO)
                .collect(Collectors.toList());
    }
}
