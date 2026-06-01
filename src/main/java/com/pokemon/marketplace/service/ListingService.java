package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.ListingDTO;
import com.pokemon.marketplace.entity.Listing;
import com.pokemon.marketplace.entity.Product;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.ListingMapper;
import com.pokemon.marketplace.repository.ListingRepository;
import com.pokemon.marketplace.repository.ProductRepository;
import com.pokemon.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ListingMapper listingMapper;

    @Transactional(readOnly = true)
    public List<ListingDTO> getAllListings(boolean availableOnly) {
        log.info("Fetching all listings. Available only: {}", availableOnly);
        return listingRepository.findAllListings(availableOnly).stream()
                .map(listingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ListingDTO createListing(Long userId, Long cardId, BigDecimal price) {
        log.info("Creating listing for User ID: {} and Card ID: {} with price: {}", userId, cardId, price);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        Product card = productRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá rao bán phải lớn hơn 0");
        }

        Listing listing = Listing.builder()
                .user(user)
                .card(card)
                .price(price)
                .isAvailable(true)
                .createdAt(LocalDateTime.now())
                .build();

        Listing saved = listingRepository.save(listing);
        return listingMapper.toDTO(saved);
    }
}
