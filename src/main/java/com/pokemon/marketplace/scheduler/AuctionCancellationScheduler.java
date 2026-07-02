package com.pokemon.marketplace.scheduler;

import com.pokemon.marketplace.entity.Order;
import com.pokemon.marketplace.entity.Notification;
import com.pokemon.marketplace.entity.enums.OrderStatus;
import com.pokemon.marketplace.repository.OrderRepository;
import com.pokemon.marketplace.repository.NotificationRepository;
import com.pokemon.marketplace.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionCancellationScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final NotificationRepository notificationRepository;

    /**
     * Runs every hour to cancel unpaid won-auction orders older than 3 days.
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void cancelUnpaidAuctionOrders() {
        log.info("Starting check for unpaid auction orders older than 3 days...");
        
        List<Order> pendingAuctionOrders = orderRepository.findPendingAuctionOrders(OrderStatus.PENDING);
        LocalDateTime threshold = LocalDateTime.now().minusDays(3);

        for (Order order : pendingAuctionOrders) {
            // Exclude already paid balance orders
            if ("AUCTION".equalsIgnoreCase(order.getPaymentMethod())) {
                continue;
            }

            if (order.getCreatedAt() != null && order.getCreatedAt().isBefore(threshold)) {
                log.info("Auto-cancelling unpaid auction order ID: {} created at {}", order.getId(), order.getCreatedAt());
                try {
                    orderService.updateOrderStatus(order.getId(), OrderStatus.CANCELLED);
                    
                    // Create specific notification for the user
                    String cardName = "thẻ bài";
                    if (order.getItems() != null && !order.getItems().isEmpty()) {
                        cardName = "\"" + order.getItems().get(0).getProduct().getName() + "\"";
                    }
                    
                    Notification cancelNotification = Notification.builder()
                            .user(order.getUser())
                            .title("Kết quả đấu giá đã bị hủy ❌")
                            .content("Giao dịch cho thẻ " + cardName + " thuộc đơn hàng #" + order.getId() + 
                                    " đã bị hủy kết quả do không thanh toán trong vòng 3 ngày.")
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build();
                    notificationRepository.save(cancelNotification);
                    
                } catch (Exception e) {
                    log.error("Failed to auto-cancel order ID: {}", order.getId(), e);
                }
            }
        }
    }
}
