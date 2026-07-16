package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.GachaRedeemRequest;
import com.pokemon.marketplace.dto.OrderCreateRequest;
import com.pokemon.marketplace.dto.OrderDTO;
import com.pokemon.marketplace.dto.OrderShippingUpdateRequest;
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
import com.pokemon.marketplace.dto.AuctionClaimRequest;
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
    private final AuctionRepository auctionRepository;
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

        String deliveryType = request.getDeliveryType();
        if (deliveryType == null || deliveryType.trim().isEmpty()) {
            deliveryType = "ONLINE_COLLECTION";
        } else {
            deliveryType = deliveryType.trim().toUpperCase();
        }

        if (!"ONLINE_COLLECTION".equals(deliveryType) && !"PHYSICAL_SHIPPING".equals(deliveryType)) {
            throw new IllegalArgumentException("Hình thức nhận hàng không hợp lệ (deliveryType).");
        }

        String paymentMethod = request.getPaymentMethod() != null
                ? request.getPaymentMethod().trim().toUpperCase()
                : "";
        if ("ONLINE_COLLECTION".equals(deliveryType) && "COD".equals(paymentMethod)) {
            throw new IllegalArgumentException("Hình thức lưu giữ online không hỗ trợ thanh toán tiền mặt (COD). Vui lòng chọn VNPay hoặc Số dư tài khoản.");
        }

        if (request.getRecipientName() == null || request.getRecipientName().trim().isEmpty()) {
            throw new IllegalArgumentException("Họ tên người nhận là bắt buộc.");
        }
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại liên hệ là bắt buộc.");
        }
        if (!request.getPhone().trim().matches("^\\d{9,11}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).");
        }
        if (request.getShippingAddress() == null || request.getShippingAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ nhận hàng là bắt buộc.");
        }

        Order order = Order.builder()
                .user(user)
                .recipientName(request.getRecipientName().trim())
                .phone(request.getPhone().trim())
                .shippingAddress(request.getShippingAddress().trim())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .deliveryType(deliveryType)
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

        if ("BALANCE".equalsIgnoreCase(request.getPaymentMethod())) {
            if (user.getBalance() < totalAmount.doubleValue()) {
                throw new IllegalArgumentException("Số dư tài khoản trong ứng dụng không đủ để thanh toán (Yêu cầu: $" + totalAmount + ", Hiện tại: $" + user.getBalance() + ").");
            }
            user.setBalance(user.getBalance() - totalAmount.doubleValue());
            userRepository.save(user);
            order.setStatus(OrderStatus.PROCESSING);
        }

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
        if (oldStatus == status) {
            return orderMapper.toDTO(order);
        }

        if (oldStatus == OrderStatus.COMPLETED || oldStatus == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể cập nhật trạng thái đơn hàng đã HOÀN THÀNH hoặc đã HỦY.");
        }

        // Prevent moving backward to previous workflow steps
        if (oldStatus == OrderStatus.SHIPPED && (status == OrderStatus.PROCESSING || status == OrderStatus.PENDING)) {
            throw new IllegalArgumentException("Đơn hàng đã GIAO HÀNG (SHIPPED) không thể quay lại trạng thái CHỜ DUYỆT (PENDING) hoặc ĐANG XỬ LÝ (PROCESSING).");
        }
        if (oldStatus == OrderStatus.PROCESSING && status == OrderStatus.PENDING) {
            throw new IllegalArgumentException("Đơn hàng đang XỬ LÝ (PROCESSING) không thể quay lại trạng thái CHỜ DUYỆT (PENDING).");
        }

        if (status == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                product.setIsAvailable(true);
                productRepository.save(product);
            }

            if ("AUCTION".equalsIgnoreCase(order.getPaymentMethod()) || "BALANCE".equalsIgnoreCase(order.getPaymentMethod())) {
                User user = order.getUser();
                user.setBalance(user.getBalance() + order.getTotalAmount().doubleValue());
                userRepository.save(user);
            }

            if (order.getAuctionId() != null) {
                auctionRepository.findById(order.getAuctionId()).ifPresent(auction -> {
                    auction.setStatus("cancelled");
                    auctionRepository.save(auction);
                });
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
        if ("AUCTION".equalsIgnoreCase(order.getPaymentMethod()) || "BALANCE".equalsIgnoreCase(order.getPaymentMethod())) {
            User user = order.getUser();
            user.setBalance(user.getBalance() + order.getTotalAmount().doubleValue());
            userRepository.save(user);
        }

        if (order.getAuctionId() != null) {
            auctionRepository.findById(order.getAuctionId()).ifPresent(auction -> {
                auction.setStatus("cancelled");
                auctionRepository.save(auction);
            });
        }
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

    @Transactional
    public OrderDTO updateOrderShipping(Long orderId, Long userId, OrderShippingUpdateRequest request) {
        log.info("User ID: {} updating shipping info for order ID: {}", userId, orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa đơn hàng này.");
        }

        if (order.getStatus() == OrderStatus.SHIPPED
                || order.getStatus() == OrderStatus.COMPLETED
                || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Đơn hàng đã được giao hoặc đã kết thúc nên không thể thay đổi thông tin giao nhận.");
        }

        String recipientName = request.getRecipientName();
        String phone = request.getPhone();
        String shippingAddress = request.getShippingAddress();

        if (recipientName == null || recipientName.trim().isEmpty()) {
            throw new IllegalArgumentException("Họ tên người nhận là bắt buộc.");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại liên hệ là bắt buộc.");
        }
        if (!phone.trim().matches("^\\d{9,11}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).");
        }
        if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ nhận hàng là bắt buộc.");
        }

        order.setRecipientName(recipientName.trim());
        order.setPhone(phone.trim());
        order.setShippingAddress(shippingAddress.trim());
        Order saved = orderRepository.save(order);

        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        String adminTitle = "📦 Đơn hàng #" + order.getId() + " đổi thông tin giao nhận";
        String adminContent = "Người dùng @" + order.getUser().getUsername()
                + " đã cập nhật thông tin giao nhận cho đơn #" + order.getId() + " (chưa giao hàng):\n"
                + "👤 " + recipientName.trim() + "\n📞 " + phone.trim() + "\n📍 " + shippingAddress.trim();
        for (User admin : admins) {
            Notification adminNotification = Notification.builder()
                    .user(admin)
                    .title(adminTitle)
                    .content(adminContent)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(adminNotification);
        }

        return orderMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        log.info("Fetching order by ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return orderMapper.toDTO(order);
    }

    @Transactional
    public OrderDTO redeemGachaCards(Long userId, GachaRedeemRequest request) {
        log.info("User ID: {} redeeming Gacha cards", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Quản trị viên không thể nhận thẻ bài.");
        }

        if (request.getProductIds().size() != request.getQuantities().size()) {
            throw new IllegalArgumentException("Danh sách sản phẩm và số lượng không khớp.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        
        String shippingAddress = request.getDeliveryMethod().equalsIgnoreCase("STORE_PICKUP")
                ? "Nhận tại cửa hàng: " + request.getStoreName()
                : request.getShippingAddress();

        Order order = Order.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .shippingAddress(shippingAddress)
                .note(request.getNote() != null ? "[GACHA REDEEM] " + request.getNote() : "[GACHA REDEEM]")
                .paymentMethod("GACHA")
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (int i = 0; i < request.getProductIds().size(); i++) {
            Long prodId = request.getProductIds().get(i);
            Integer quantity = request.getQuantities().get(i);
            
            Product product = productRepository.findById(prodId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ bài với ID: " + prodId));

            if (product.getStock() < quantity) {
                throw new IllegalArgumentException("Thẻ " + product.getName() + " không đủ số lượng trong kho (" + product.getStock() + ")");
            }
            product.setStock(product.getStock() - quantity);
            if (product.getStock() == 0) {
                product.setIsAvailable(false);
            }
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .price(BigDecimal.ZERO)
                    .quantity(quantity)
                    .build();

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        Notification statusNotification = Notification.builder()
                .user(user)
                .title("Đơn nhận thẻ Gacha #" + savedOrder.getId() + " thành công")
                .content("Yêu cầu " + (request.getDeliveryMethod().equalsIgnoreCase("STORE_PICKUP") ? "nhận tại cửa hàng" : "giao tận nhà") 
                        + " cho " + orderItems.size() + " loại thẻ bài đang được xử lý.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(statusNotification);

        return orderMapper.toDTO(savedOrder);
    }

    @Transactional
    public OrderDTO claimAuctionCard(Long userId, Long auctionId, AuctionClaimRequest request) {
        log.info("User ID: {} claiming auction ID: {}", userId, auctionId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên đấu giá với ID: " + auctionId));

        if (!"ended".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalArgumentException("Phiên đấu giá chưa kết thúc hoặc đã được nhận.");
        }

        // Check if current user is the winner
        String cleanWinner = auction.getHighestBidder();
        if (cleanWinner != null && cleanWinner.startsWith("@")) {
            cleanWinner = cleanWinner.substring(1);
        }
        
        if (cleanWinner == null || !cleanWinner.equalsIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Bạn không phải là người chiến thắng phiên đấu giá này.");
        }

        // Resolve payment method (default to AUCTION if empty/null)
        String paymentMethod = request.getPaymentMethod();
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            paymentMethod = "AUCTION";
        }

        double bidAmount = auction.getCurrentBid().doubleValue();
        if ("AUCTION".equalsIgnoreCase(paymentMethod)) {
            // Check user balance
            if (user.getBalance() < bidAmount) {
                throw new IllegalArgumentException("Số dư ví của bạn không đủ để thanh toán (" + String.format("%.2f", bidAmount) + ")");
            }

            // Deduct user balance
            user.setBalance(user.getBalance() - bidAmount);
            userRepository.save(user);
        }

        // Find the corresponding product by card name
        Product product = productRepository.findByName(auction.getCardName())
                .orElse(null);

        if (product != null) {
            if (product.getStock() > 0) {
                product.setStock(product.getStock() - 1);
                if (product.getStock() == 0) {
                    product.setIsAvailable(false);
                }
                productRepository.save(product);
            }
        }

        // Create Order
        String shippingAddress = request.getDeliveryMethod().equalsIgnoreCase("STORE_PICKUP")
                ? "Nhận tại cửa hàng: " + request.getStoreName()
                : request.getShippingAddress();

        Order order = Order.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .shippingAddress(shippingAddress)
                .note(request.getNote() != null && !request.getNote().isEmpty() ? "[ĐẤU GIÁ THẮNG] " + request.getNote() : "[ĐẤU GIÁ THẮNG]")
                .paymentMethod(paymentMethod)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .totalAmount(auction.getCurrentBid())
                .auctionId(auctionId)
                .build();

        // Create OrderItem
        List<OrderItem> orderItems = new ArrayList<>();
        
        // If product doesn't exist, we create/reference a placeholder product to avoid NullPointerException in OrderItems/Vite client
        Product resolvedProduct = product;
        if (resolvedProduct == null) {
            resolvedProduct = productRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Hệ thống chưa có sản phẩm nào để tạo đơn hàng."));
        }

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(resolvedProduct)
                .price(auction.getCurrentBid())
                .quantity(1)
                .build();
        orderItems.add(orderItem);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Update auction status
        auction.setStatus("claimed");
        auctionRepository.save(auction);

        // Notification for user
        Notification notification = Notification.builder()
                .user(user)
                .title("Xác nhận thông tin giao nhận đấu giá #" + savedOrder.getId() + " thành công")
                .content("Bạn đã xác nhận thông tin giao nhận cho thẻ " + auction.getCardName() 
                        + ". Số tiền $" + String.format("%.2f", bidAmount) + " đã được thanh toán.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        // Notification for Admin
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        String adminTitle = "🏆 Có đơn đấu giá mới #" + savedOrder.getId();
        String adminContent = "Người dùng @" + user.getUsername() + " đã thanh toán $" + String.format("%.2f", bidAmount)
                + " cho thẻ \"" + auction.getCardName() + "\" đấu giá thắng.\n"
                + "Hình thức nhận hàng: " + (request.getDeliveryMethod().equalsIgnoreCase("STORE_PICKUP") ? "Nhận tại cửa hàng (" + request.getStoreName() + ")" : "Giao về nhà (" + request.getShippingAddress() + ")") + ".\n"
                + "Người nhận: " + request.getRecipientName() + " - SĐT: " + request.getPhone();

        for (User admin : admins) {
            Notification adminNotification = Notification.builder()
                    .user(admin)
                    .title(adminTitle)
                    .content(adminContent)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(adminNotification);
        }

        return orderMapper.toDTO(savedOrder);
    }
}
