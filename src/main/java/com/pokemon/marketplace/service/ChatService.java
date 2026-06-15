package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.ChatMessageDTO;
import com.pokemon.marketplace.dto.UserDTO;
import com.pokemon.marketplace.entity.ChatMessage;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.entity.enums.UserRole;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.ChatMessageMapper;
import com.pokemon.marketplace.mapper.UserMapper;
import com.pokemon.marketplace.repository.ChatMessageRepository;
import com.pokemon.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatMessageMapper chatMessageMapper;
    private final UserMapper userMapper;
    private final MongoTemplate mongoTemplate;

    private static final List<String> AUTO_REPLIES = Arrays.asList(
            "Xin chào Trainer! Chào mừng đến với PokeCard Store 🎴 Bạn đang tìm kiếm thẻ bài Pokemon nào? Chúng tôi có hơn 35 loại thẻ từ Common đến Illustrator, bao gồm VMAX, VSTAR, Gold Star và thẻ Base Set gốc từ 1999!",
            "Toàn bộ thẻ bài tại PokeCard Store đều được cam kết 100% chính hãng và đi kèm chứng chỉ xác thực. Thẻ được đóng gói bảo vệ sleeve + toploader, giao hàng toàn quốc. Trong vòng 7 ngày nếu thẻ bị lỗi hoặc không đúng mô tả, chúng tôi hoàn tiền hoặc đổi thẻ ngay!",
            "Tuần này PokeCard Store đang có chương trình SALE THẺ HIẾM - giảm tới 20% cho Charizard VMAX, Umbreon VMAX Alt Art và Rayquaza VMAX! Bạn có muốn tôi kiểm tra xem thẻ bạn quan tâm có đang giảm giá không?",
            "Đơn hàng thẻ bài của bạn được đóng gói bảo vệ kỹ lưỡng và giao trong 1-2 ngày với TP.HCM, 2-4 ngày với các tỉnh thành. Bạn có thể theo dõi trạng thái đơn hàng trong mục Đơn Hàng. Nếu cần hỗ trợ gấp hãy gọi hotline 0909 123 456!"
    );

    private static final String DEFAULT_REPLY = "Cảm ơn Trainer đã liên hệ! Admin của PokeCard Store đã nhận được tin nhắn và sẽ chat trực tiếp với bạn ngay lập tức. Trong lúc chờ đợi, bạn có thể hỏi về các chủ đề tự động như: 'giao hàng', 'chính hãng', hoặc 'khuyến mãi' để được phản hồi tức thì nhé!";

    public List<ChatMessageDTO> getChatMessages(Long userId) {
        log.info("Fetching chat history for User ID: {}", userId);
        return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getChatUsers() {
        log.info("Fetching distinct customer users with chat history");
        List<Long> userIds = mongoTemplate.findDistinct(new Query(), "user.$id", ChatMessage.class, Long.class);
        List<User> users = mongoTemplate.find(new Query(Criteria.where("id").in(userIds)), User.class);
        return users.stream()
                .filter(u -> u.getRole() != UserRole.ADMIN)
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDTO sendAdminMessage(Long customerUserId, String message) {
        log.info("Admin sending message to User ID: {}, message: {}", customerUserId, message);
        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerUserId));

        ChatMessage storeMsg = ChatMessage.builder()
                .user(customer)
                .sender("STORE")
                .message(message)
                .isAutoReply(false)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(storeMsg);

        return chatMessageMapper.toDTO(storeMsg);
    }

    @Transactional
    public ChatMessageDTO sendMessage(Long userId, String message) {
        log.info("User ID: {} sending message: {}", userId, message);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        
        boolean isFirstMessage = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId).isEmpty();

        
        ChatMessage customerMsg = ChatMessage.builder()
                .user(user)
                .sender("CUSTOMER")
                .message(message)
                .isAutoReply(false)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(customerMsg);

        
        boolean hasAdminReplied = chatMessageRepository.existsByUserIdAndSenderAndIsAutoReply(userId, "STORE", false);

        
        if (!hasAdminReplied) {
            String replyText = getSimulatedReply(message, isFirstMessage);
            if (replyText != null) {
                ChatMessage storeMsg = ChatMessage.builder()
                        .user(user)
                        .sender("STORE")
                        .message(replyText)
                        .isAutoReply(true)
                        .createdAt(LocalDateTime.now().plusSeconds(1))
                        .build();
                chatMessageRepository.save(storeMsg);
            }
        }

        return chatMessageMapper.toDTO(customerMsg);
    }

    private String getSimulatedReply(String userMessage, boolean isFirstMessage) {
        String msg = userMessage.toLowerCase().trim();
        if (msg.contains("hello") || msg.contains("hi") || msg.contains("chào") || msg.contains("chao") || msg.contains("alo") || msg.equals("heloo")) {
            return AUTO_REPLIES.get(0);
        } else if (msg.contains("bảo hành") || msg.contains("bao hanh") || msg.contains("chính hãng") || msg.contains("xác thực") || msg.contains("fake")) {
            return AUTO_REPLIES.get(1);
        } else if (msg.contains("khuyến mãi") || msg.contains("giam gia") || msg.contains("khuyen mai") || msg.contains("giảm giá") || msg.contains("sale") || msg.contains("discount")) {
            return AUTO_REPLIES.get(2);
        } else if (msg.contains("đơn hàng") || msg.contains("don hang") || msg.contains("giao hang") || msg.contains("giao hàng") || msg.contains("vận chuyển") || msg.contains("ship")) {
            return AUTO_REPLIES.get(3);
        }
        
        
        if (isFirstMessage) {
            return DEFAULT_REPLY;
        }
        
        return null;
    }
}
