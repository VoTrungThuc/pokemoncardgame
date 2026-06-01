package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.NotificationDTO;
import com.pokemon.marketplace.entity.Notification;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.NotificationMapper;
import com.pokemon.marketplace.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        log.info("Fetching notifications for User ID: {}", userId);
        return notificationRepository.findByUserIdOrGlobal(userId).stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id, Long userId) {
        log.info("Marking notification ID: {} as read by User ID: {}", id, userId);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        if (notification.getUser() != null && !notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
