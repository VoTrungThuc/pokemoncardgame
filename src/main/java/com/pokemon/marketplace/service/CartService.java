package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.CartItemDTO;
import com.pokemon.marketplace.entity.CartItem;
import com.pokemon.marketplace.entity.Product;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.CartItemMapper;
import com.pokemon.marketplace.repository.CartItemRepository;
import com.pokemon.marketplace.repository.ProductRepository;
import com.pokemon.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemMapper cartItemMapper;

    @Transactional(readOnly = true)
    public List<CartItemDTO> getCartForUser(Long userId) {
        log.info("Fetching cart for User ID: {}", userId);
        return cartItemRepository.findByUserId(userId).stream()
                .map(cartItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO addToCart(Long userId, Long productId, Integer quantity) {
        log.info("Adding product ID: {} (Quantity: {}) to user ID: {} cart", productId, quantity, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStock() + ")");
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (cartItem != null) {
            int newQty = cartItem.getQuantity() + quantity;
            if (product.getStock() < newQty) {
                throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStock() + ")");
            }
            cartItem.setQuantity(newQty);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(quantity)
                    .build();
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return cartItemMapper.toDTO(saved);
    }

    @Transactional
    public CartItemDTO updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        log.info("Updating cart item ID: {} quantity to {} for user ID: {}", cartItemId, quantity, userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this cart item");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        Product product = cartItem.getProduct();
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStock() + ")");
        }

        cartItem.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(cartItem);
        return cartItemMapper.toDTO(saved);
    }

    @Transactional
    public void deleteCartItem(Long userId, Long cartItemId) {
        log.info("Removing cart item ID: {} for user ID: {}", cartItemId, userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        log.info("Clearing cart for User ID: {}", userId);
        cartItemRepository.deleteByUserId(userId);
    }
}
