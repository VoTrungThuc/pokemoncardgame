package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.CartItemDTO;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.CartService;
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
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemDTO>>> getCart() {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to get cart for User ID: {}", userId);
        List<CartItemDTO> cart = cartService.getCartForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Fetched cart successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartItemDTO>> addToCart(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to add product ID: {} to cart for User ID: {}", productId, userId);
        CartItemDTO item = cartService.addToCart(userId, productId, quantity);
        return ResponseEntity.ok(ApiResponse.success(item, "Added item to cart"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CartItemDTO>> updateCartItemQuantity(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to update quantity for cart item ID: {}", id);
        CartItemDTO item = cartService.updateCartItemQuantity(userId, id, quantity);
        return ResponseEntity.ok(ApiResponse.success(item, "Updated item quantity"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCartItem(@PathVariable Long id) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to remove cart item ID: {}", id);
        cartService.deleteCartItem(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Removed cart item successfully", "Removed cart item successfully"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart() {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to clear cart for User ID: {}", userId);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cleared cart successfully", "Cleared cart successfully"));
    }
}
