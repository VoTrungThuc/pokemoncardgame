package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.TradeCreateRequest;
import com.pokemon.marketplace.dto.TradeDTO;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.TradeService;
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
@RequestMapping("/api/trades")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<TradeDTO>>> getUserTrades(@PathVariable Long userId) {
        Long authenticatedId = getAuthenticatedUserId();
        if (!authenticatedId.equals(userId)) {
            throw new IllegalArgumentException("Không thể xem lịch sử trao đổi của người khác.");
        }
        log.info("REST request to get trades for User ID: {}", userId);
        List<TradeDTO> trades = tradeService.getUserTrades(userId);
        return ResponseEntity.ok(ApiResponse.success(trades, "Fetched user trades successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TradeDTO>> createTrade(@RequestBody TradeCreateRequest request) {
        Long authenticatedId = getAuthenticatedUserId();
        log.info("REST request to propose trade by User ID: {}", authenticatedId);
        TradeDTO created = tradeService.createTrade(
                authenticatedId, request.getToUserId(), request.getOfferedCardId(), request.getRequestedCardId());
        return ResponseEntity.ok(ApiResponse.success(created, "Trade proposed successfully"));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<TradeDTO>> acceptTrade(@PathVariable Long id) {
        log.info("REST request to accept trade ID: {}", id);
        TradeDTO accepted = tradeService.acceptTrade(id);
        return ResponseEntity.ok(ApiResponse.success(accepted, "Trade accepted successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<TradeDTO>> rejectTrade(@PathVariable Long id) {
        log.info("REST request to reject trade ID: {}", id);
        TradeDTO rejected = tradeService.rejectTrade(id);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Trade rejected successfully"));
    }
}
