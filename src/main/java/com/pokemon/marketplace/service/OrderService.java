package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.OrderCreateRequest;
import com.pokemon.marketplace.dto.OrderDTO;
import com.pokemon.marketplace.entity.*;
import com.pokemon.marketplace.entity.enums.OrderStatus;
import com.pokemon.marketplace.entity.enums.UserRole;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.OrderMapper;
import com.pokemon.marketplace.repository.*;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderDTO placeOrder(Long userId, OrderCreateRequest request) {
        log.info("User ID: {} placing order", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Quản trị viên không được phép đặt mua hàng.");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout. Giỏ hàng của bạn đang trống.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Product " + product.getName() + " does not have enough stock available (" + product.getStock() + ")");
            }

            
            product.setStock(product.getStock() - item.getQuantity());
            if (product.getStock() == 0) {
                product.setIsAvailable(false);
            }
            productRepository.save(product);

            
            BigDecimal itemPrice = product.getPromoPrice() != null ? product.getPromoPrice() : product.getPrice();
            BigDecimal itemSubtotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemSubtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .price(itemPrice)
                    .quantity(item.getQuantity())
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        
        cartItemRepository.deleteByUserId(userId);

        
        Notification statusNotification = Notification.builder()
                .user(user)
                .title("Đơn hàng mới #" + savedOrder.getId() + " đã đặt thành công")
                .content("Cảm ơn bạn đã mua sắm tại PokeCard Store 🎴 Đơn hàng thẻ bài trị giá $" + savedOrder.getTotalAmount() + " đang được xử lý.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(statusNotification);

        return orderMapper.toDTO(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrderHistory(Long userId) {
        log.info("Fetching order history for User ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() == UserRole.ADMIN) {
            return orderRepository.findAllWithItems().stream()
                    .map(orderMapper::toDTO)
                    .collect(Collectors.toList());
        } else {
            return orderRepository.findByUserIdWithItems(userId).stream()
                    .map(orderMapper::toDTO)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        log.info("Updating order ID: {} status to: {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == OrderStatus.COMPLETED || oldStatus == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể cập nhật trạng thái đơn hàng đã HOÀN THÀNH hoặc đã HỦY.");
        }

        if (status == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                product.setIsAvailable(true);
                productRepository.save(product);
            }
        }

        order.setStatus(status);
        Order saved = orderRepository.save(order);

        
        String title = "Cập nhật đơn hàng #" + order.getId();
        String content = "Đơn hàng của bạn đã được cập nhật trạng thái sang: " + status.name();

        switch (status) {
            case PENDING:
                title = "Đơn hàng #" + order.getId() + " đang chờ xử lý ⏳";
                content = "Đơn hàng thẻ bài Pokemon của bạn đã được tiếp nhận và đang chờ Admin xác nhận.";
                break;
            case PROCESSING:
                title = "Đơn hàng #" + order.getId() + " đã được xác nhận! ✅";
                content = "Đơn hàng của bạn đã được Admin xác nhận thành công. PokeCard Store đang tiến hành đóng gói các thẻ bài của bạn.";
                break;
            case SHIPPED:
                title = "Đơn hàng #" + order.getId() + " đang được giao 🚚";
                content = "Các thẻ bài Pokemon của bạn đã được bàn giao cho đơn vị vận chuyển và đang trên đường tới tay bạn.";
                break;
            case COMPLETED:
                title = "Đơn hàng #" + order.getId() + " giao thành công! 🎉";
                content = "Đơn hàng đã được giao thành công. Chúc bạn nhận được những thẻ bài Pokemon siêu ưng ý! Cảm ơn bạn đã tin tưởng PokeCard Store.";
                break;
            case CANCELLED:
                title = "Đơn hàng #" + order.getId() + " đã bị hủy ❌";
                content = "Rất tiếc, đơn hàng của bạn đã bị hủy. Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm thông tin chi tiết.";
                break;
        }

        Notification statusNotification = Notification.builder()
                .user(order.getUser())
                .title(title)
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(statusNotification);

        return orderMapper.toDTO(saved);
    }

    @Transactional
    public OrderDTO cancelOrder(Long orderId, Long userId) {
        log.info("User ID: {} cancelling order ID: {}", userId, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể hủy đơn hàng đang ở trạng thái CHỜ DUYỆT.");
        }

        
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            product.setIsAvailable(true);
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        
        Notification statusNotification = Notification.builder()
                .user(order.getUser())
                .title("Bạn đã hủy đơn hàng #" + order.getId() + " ❌")
                .content("Đơn hàng thẻ bài Pokemon của bạn đã được hủy theo yêu cầu.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(statusNotification);

        return orderMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        log.info("Fetching order by ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return orderMapper.toDTO(order);
    }
}
