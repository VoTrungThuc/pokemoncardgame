package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.AuctionDTO;
import com.pokemon.marketplace.dto.AuctionBidDTO;
import com.pokemon.marketplace.entity.Auction;
import com.pokemon.marketplace.entity.AuctionBid;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.AuctionMapper;
import com.pokemon.marketplace.repository.AuctionRepository;
import com.pokemon.marketplace.repository.AuctionBidRepository;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionBidRepository auctionBidRepository;
    private final UserRepository userRepository;
    private final AuctionMapper auctionMapper;

    @Transactional
    public List<AuctionDTO> getAllAuctions() {
        log.info("Fetching all auctions and verifying expiry");
        List<Auction> list = auctionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (Auction auction : list) {
            if ("active".equals(auction.getStatus()) && auction.getEndTime().isBefore(now)) {
                auction.setStatus("ended");
                auctionRepository.save(auction);
            }
        }
        
        return list.stream().map(auctionMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public AuctionDTO getAuctionById(Long id) {
        log.info("Fetching auction details for ID: {}", id);
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + id));
        
        LocalDateTime now = LocalDateTime.now();
        if ("active".equals(auction.getStatus()) && auction.getEndTime().isBefore(now)) {
            auction.setStatus("ended");
            auction = auctionRepository.save(auction);
        }
        
        return auctionMapper.toDTO(auction);
    }

    @Transactional
    public AuctionDTO placeBid(Long id, BigDecimal amount, String username) {
        log.info("User {} placing bid: ${} on auction ID: {}", username, amount, id);
        
        String cleanUsername = username.startsWith("@") ? username.substring(1) : username;
        User userObj = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + cleanUsername));
        if (userObj.getRole() == com.pokemon.marketplace.entity.enums.UserRole.ADMIN) {
            throw new IllegalStateException("Admin không được phép tham gia đấu giá thẻ bài!");
        }

        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + id));

        if (!"active".equals(auction.getStatus())) {
            throw new IllegalStateException("Phiên đấu giá đã kết thúc.");
        }

        if (auction.getEndTime().isBefore(LocalDateTime.now())) {
            auction.setStatus("ended");
            auctionRepository.save(auction);
            throw new IllegalStateException("Phiên đấu giá đã kết thúc.");
        }

        if (amount.compareTo(auction.getCurrentBid()) <= 0) {
            throw new IllegalArgumentException("Mức giá thầu phải lớn hơn mức giá hiện tại.");
        }

        
        String formattedBidder = username.startsWith("@") ? username : "@" + username;

        
        AuctionBid bid = AuctionBid.builder()
                .auction(auction)
                .bidder(formattedBidder)
                .amount(amount)
                .bidTime(LocalDateTime.now())
                .build();
        
        auction.getBidHistory().add(bid);
        auction.setCurrentBid(amount);
        auction.setHighestBidder(formattedBidder);
        auction.setBidsCount(auction.getBidsCount() + 1);

        Auction saved = auctionRepository.save(auction);
        return auctionMapper.toDTO(saved);
    }

    @Transactional
    public AuctionDTO createAuction(AuctionDTO dto) {
        log.info("Creating new auction for card: {}", dto.getCardName());
        
        
        LocalDateTime endTime = dto.getEndTime() != null 
                ? dto.getEndTime().withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime() 
                : LocalDateTime.now().plusMinutes(5);

        Auction auction = Auction.builder()
                .cardName(dto.getCardName())
                .imageUrl(dto.getImageUrl())
                .rarity(dto.getRarity())
                .condition(dto.getCondition())
                .currentBid(dto.getCurrentBid())
                .highestBidder("-")
                .bidsCount(0)
                .endTime(endTime)
                .status("active")
                .createdByAdmin(true)
                .bidHistory(new ArrayList<>())
                .build();

        Auction saved = auctionRepository.save(auction);
        return auctionMapper.toDTO(saved);
    }

    @Transactional
    public void deleteAuction(Long id) {
        log.info("Deleting auction ID: {}", id);
        if (!auctionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Auction not found with ID: " + id);
        }
        auctionRepository.deleteById(id);
    }

    @Transactional
    public List<AuctionDTO> resetAuctions() {
        log.info("Resetting auctions to default list");
        auctionRepository.deleteAll();

        LocalDateTime now = LocalDateTime.now();
        List<Auction> defaults = new ArrayList<>();

        defaults.add(Auction.builder()
                .cardName("Charizard VMAX Rainbow Rare")
                .imageUrl("https://images.pokemontcg.io/swsh35/74.png")
                .rarity("Secret Rare")
                .condition("Mint")
                .currentBid(new BigDecimal("260.00"))
                .highestBidder("-")
                .bidsCount(0)
                .endTime(now.plusHours(24))
                .status("active")
                .createdByAdmin(false)
                .bidHistory(new ArrayList<>())
                .build());

        defaults.add(Auction.builder()
                .cardName("Mewtwo VSTAR Alt Art")
                .imageUrl("https://images.pokemontcg.io/swsh12pt5gg/GG44.png")
                .rarity("Secret Rare")
                .condition("Mint")
                .currentBid(new BigDecimal("145.00"))
                .highestBidder("-")
                .bidsCount(0)
                .endTime(now.plusHours(36))
                .status("active")
                .createdByAdmin(false)
                .bidHistory(new ArrayList<>())
                .build());

        defaults.add(Auction.builder()
                .cardName("Umbreon VMAX Alt Art")
                .imageUrl("https://images.pokemontcg.io/swsh7/215.png")
                .rarity("Secret Rare")
                .condition("Mint")
                .currentBid(new BigDecimal("165.00"))
                .highestBidder("-")
                .bidsCount(0)
                .endTime(now.plusHours(48))
                .status("active")
                .createdByAdmin(false)
                .bidHistory(new ArrayList<>())
                .build());

        defaults.add(Auction.builder()
                .cardName("Rayquaza VMAX Alt Art")
                .imageUrl("https://images.pokemontcg.io/swsh7/218.png")
                .rarity("Secret Rare")
                .condition("Near Mint")
                .currentBid(new BigDecimal("130.00"))
                .highestBidder("-")
                .bidsCount(0)
                .endTime(now.plusHours(72))
                .status("active")
                .createdByAdmin(false)
                .bidHistory(new ArrayList<>())
                .build());

        List<Auction> saved = auctionRepository.saveAll(defaults);
        return saved.stream().map(auctionMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public AuctionDTO endAuction(Long id) {
        log.info("Force ending auction ID: {}", id);
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + id));
        auction.setStatus("ended");
        auction.setEndTime(LocalDateTime.now().minusMinutes(5));
        Auction saved = auctionRepository.save(auction);
        return auctionMapper.toDTO(saved);
    }
}
