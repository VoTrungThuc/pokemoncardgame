package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.TradeDTO;
import com.pokemon.marketplace.entity.*;
import com.pokemon.marketplace.entity.enums.TradeStatus;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.TradeMapper;
import com.pokemon.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeRepository tradeRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final TradeMapper tradeMapper;

    @Transactional(readOnly = true)
    public List<TradeDTO> getUserTrades(Long userId) {
        log.info("Fetching trades for User ID: {}", userId);
        return tradeRepository.findByUserIdWithRelations(userId).stream()
                .map(tradeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TradeDTO createTrade(Long fromUserId, Long toUserId, Long offeredCardId, Long requestedCardId) {
        log.info("Creating trade proposal from User {} to User {}. Offered: {}, Requested: {}",
                fromUserId, toUserId, offeredCardId, requestedCardId);

        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + fromUserId));
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + toUserId));
        Product offeredCard = productRepository.findById(offeredCardId)
                .orElseThrow(() -> new ResourceNotFoundException("Offered card not found: " + offeredCardId));
        Product requestedCard = productRepository.findById(requestedCardId)
                .orElseThrow(() -> new ResourceNotFoundException("Requested card not found: " + requestedCardId));

        
        double offeredScore = offeredCard.getScore() != null ? offeredCard.getScore() : 1.0;
        double requestedScore = requestedCard.getScore() != null ? requestedCard.getScore() : 1.0;
        double scoreDiff = Math.abs(offeredScore - requestedScore);
        if (scoreDiff > 1.5) {
            throw new IllegalArgumentException("Không thể đề xuất trao đổi. Chênh lệch điểm sức mạnh (" 
                    + String.format("%.1f", scoreDiff) + ") vượt quá giới hạn 1.5.");
        }

        
        List<Listing> proposerListings = listingRepository.findActiveByUserAndCard(fromUserId, offeredCardId);
        List<Listing> receiverListings = listingRepository.findActiveByUserAndCard(toUserId, requestedCardId);

        if (proposerListings.isEmpty() || receiverListings.isEmpty()) {
            throw new IllegalArgumentException("Cả hai thẻ bài tham gia trao đổi đều phải có tin đăng bán hoạt động (còn hàng).");
        }

        Trade trade = Trade.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .offeredCard(offeredCard)
                .requestedCard(requestedCard)
                .status(TradeStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Trade saved = tradeRepository.save(trade);

        
        Notification notification = Notification.builder()
                .user(toUser)
                .title("Đề xuất trao đổi mới từ @" + fromUser.getUsername() + " ⇄")
                .content("Trainer @" + fromUser.getUsername() + " muốn đổi thẻ \"" + offeredCard.getName() 
                        + "\" (Điểm: " + offeredScore + ") lấy thẻ \"" + requestedCard.getName() 
                        + "\" (Điểm: " + requestedScore + ") của bạn. Hãy kiểm tra Bảng trao đổi!")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return tradeMapper.toDTO(saved);
    }

    @Transactional
    public TradeDTO acceptTrade(Long tradeId) {
        log.info("Accepting trade proposal ID: {}", tradeId);
        Trade trade = tradeRepository.findByIdWithRelations(tradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trade proposal not found with ID: " + tradeId));

        if (trade.getStatus() != TradeStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể chấp nhận đề xuất ở trạng thái CHỜ XỬ LÝ.");
        }

        
        List<Listing> proposerListings = listingRepository.findActiveByUserAndCard(
                trade.getFromUser().getId(), trade.getOfferedCard().getId());
        List<Listing> receiverListings = listingRepository.findActiveByUserAndCard(
                trade.getToUser().getId(), trade.getRequestedCard().getId());

        if (proposerListings.isEmpty() || receiverListings.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy tin đăng bán hoạt động hợp lệ để thực hiện trao đổi.");
        }

        
        Listing proposerListing = proposerListings.get(0);
        Listing receiverListing = receiverListings.get(0);

        proposerListing.setUser(trade.getToUser());
        proposerListing.setIsAvailable(false);

        receiverListing.setUser(trade.getFromUser());
        receiverListing.setIsAvailable(false);

        listingRepository.save(proposerListing);
        listingRepository.save(receiverListing);

        
        trade.setStatus(TradeStatus.ACCEPTED);
        Trade saved = tradeRepository.save(trade);

        
        Notification proposerNotification = Notification.builder()
                .user(trade.getFromUser())
                .title("Đề xuất trao đổi được CHẤP NHẬN! 🎉")
                .content("Trainer @" + trade.getToUser().getUsername() + " đã chấp nhận giao dịch! Bạn đã sở hữu thẻ \"" 
                        + trade.getRequestedCard().getName() + "\".")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(proposerNotification);

        Notification receiverNotification = Notification.builder()
                .user(trade.getToUser())
                .title("Bạn đã chấp nhận trao đổi thẻ! 🤝")
                .content("Giao dịch thành công! Bạn đã nhượng lại thẻ \"" + trade.getRequestedCard().getName() 
                        + "\" và nhận về thẻ \"" + trade.getOfferedCard().getName() + "\" từ @" 
                        + trade.getFromUser().getUsername() + ".")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(receiverNotification);

        return tradeMapper.toDTO(saved);
    }

    @Transactional
    public TradeDTO rejectTrade(Long tradeId) {
        log.info("Rejecting trade proposal ID: {}", tradeId);
        Trade trade = tradeRepository.findByIdWithRelations(tradeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trade proposal not found with ID: " + tradeId));

        if (trade.getStatus() != TradeStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể từ chối đề xuất ở trạng thái CHỜ XỬ LÝ.");
        }

        trade.setStatus(TradeStatus.REJECTED);
        Trade saved = tradeRepository.save(trade);

        
        Notification proposerNotification = Notification.builder()
                .user(trade.getFromUser())
                .title("Đề xuất trao đổi bị TỪ CHỐI ❌")
                .content("Trainer @" + trade.getToUser().getUsername() + " đã từ chối đề xuất đổi thẻ \"" 
                        + trade.getOfferedCard().getName() + "\" lấy thẻ \"" + trade.getRequestedCard().getName() + "\".")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(proposerNotification);

        return tradeMapper.toDTO(saved);
    }
}
