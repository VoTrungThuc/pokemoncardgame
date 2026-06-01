package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.AuctionDTO;
import com.pokemon.marketplace.service.AuctionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuctionDTO>>> getAllAuctions() {
        log.info("REST request to get all auctions");
        List<AuctionDTO> list = auctionService.getAllAuctions();
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched auctions successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuctionDTO>> getAuctionById(@PathVariable Long id) {
        log.info("REST request to get auction ID: {}", id);
        AuctionDTO auction = auctionService.getAuctionById(id);
        return ResponseEntity.ok(ApiResponse.success(auction, "Fetched auction details"));
    }

    @PostMapping("/{id}/bid")
    public ResponseEntity<ApiResponse<AuctionDTO>> placeBid(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("REST request to place bid: ${} on auction ID: {} by user: {}", amount, id, username);
        AuctionDTO updated = auctionService.placeBid(id, amount, username);
        return ResponseEntity.ok(ApiResponse.success(updated, "Placed bid successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuctionDTO>> createAuction(@RequestBody AuctionDTO dto) {
        log.info("REST request to create auction: {}", dto.getCardName());
        AuctionDTO created = auctionService.createAuction(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Auction created successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteAuction(@PathVariable Long id) {
        log.info("REST request to delete auction ID: {}", id);
        auctionService.deleteAuction(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted auction successfully", "Deleted auction successfully"));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<List<AuctionDTO>>> resetAuctions() {
        log.info("REST request to reset auctions");
        List<AuctionDTO> list = auctionService.resetAuctions();
        return ResponseEntity.ok(ApiResponse.success(list, "Reset auctions successfully"));
    }
}
