package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.ListingCreateRequest;
import com.pokemon.marketplace.dto.ListingDTO;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.ListingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingDTO>>> getAllListings(
            @RequestParam(name = "availableOnly", defaultValue = "false") boolean availableOnly) {
        log.info("REST request to get all listings. Available only: {}", availableOnly);
        List<ListingDTO> listings = listingService.getAllListings(availableOnly);
        return ResponseEntity.ok(ApiResponse.success(listings, "Fetched listings successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ListingDTO>> createListing(@RequestBody ListingCreateRequest request) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to create listing for Card ID: {} by User ID: {}", request.getCardId(), userId);
        ListingDTO created = listingService.createListing(userId, request.getCardId(), request.getPrice());
        return ResponseEntity.ok(ApiResponse.success(created, "Listing created successfully"));
    }
}
