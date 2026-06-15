package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.GachaRedeemRequest;
import com.pokemon.marketplace.dto.OrderCreateRequest;
import com.pokemon.marketplace.dto.OrderDTO;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.entity.enums.OrderStatus;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderDTO>> placeOrder(@Valid @RequestBody OrderCreateRequest request) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to place order for User ID: {}", userId);
        OrderDTO order = orderService.placeOrder(userId, request);
        return new ResponseEntity<>(ApiResponse.success(order, "Order placed successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getOrderHistory() {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to get order history for User ID: {}", userId);
        List<OrderDTO> orders = orderService.getOrderHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(orders, "Fetched order history successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        log.info("REST request to update order ID: {} status to: {}", id, status);
        OrderDTO updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Order status updated successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id) {
        log.info("REST request to get order by ID: {}", id);
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Fetched order successfully"));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(@PathVariable Long id) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request by User ID: {} to cancel order ID: {}", userId, id);
        OrderDTO cancelled = orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Order cancelled successfully"));
    }

    @PostMapping("/gacha-redeem")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderDTO>> redeemGachaCards(@Valid @RequestBody GachaRedeemRequest request) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request by User ID: {} to redeem Gacha cards", userId);
        OrderDTO order = orderService.redeemGachaCards(userId, request);
        return new ResponseEntity<>(ApiResponse.success(order, "Đơn nhận thẻ đã được tạo thành công"), HttpStatus.CREATED);
    }
}
