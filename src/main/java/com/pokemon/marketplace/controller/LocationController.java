package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.StoreLocationDTO;
import com.pokemon.marketplace.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreLocationDTO>>> getAllLocations() {
        log.info("REST request to get all store locations");
        List<StoreLocationDTO> locations = locationService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.success(locations, "Fetched locations successfully"));
    }
}
