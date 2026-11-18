package com.akyva.service;

import com.akyva.dto.user.ReportUserRequest;
import com.akyva.dto.user.UpdateUserRequest;
import com.akyva.dto.user.UserDto;
import com.akyva.entity.BlockedUser;
import com.akyva.entity.Report;
import com.akyva.entity.User;
import com.akyva.exception.BadRequestException;
import com.akyva.exception.ResourceNotFoundException;
import com.akyva.repository.BlockedUserRepository;
import com.akyva.repository.ReportRepository;
import com.akyva.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final ReportRepository reportRepository;

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String userId) {
        User user = getUserEntity(userId);
        return AuthService.mapToDto(user);
    }

    @Transactional
    public UserDto updateUser(String userId, UpdateUserRequest request) {
        User user = getUserEntity(userId);

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus().trim());
        }

        user = userRepository.save(user);
        return AuthService.mapToDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(String id) {
        User user = getUserEntity(id);
        return AuthService.mapToDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> searchUsers(String query, String currentUserId) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        return userRepository.searchUsers(query.trim(), currentUserId)
                .stream()
                .map(AuthService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void blockUser(String userId, String targetUserId) {
        if (userId.equals(targetUserId)) {
            throw new BadRequestException("You cannot block yourself");
        }

        User user = getUserEntity(userId);
        User targetUser = getUserEntity(targetUserId);

        if (!blockedUserRepository.existsByUserIdAndBlockedUserId(userId, targetUserId)) {
            BlockedUser blocked = BlockedUser.builder()
                    .id(UUID.randomUUID().toString())
                    .user(user)
                    .blockedUser(targetUser)
                    .build();
            blockedUserRepository.save(blocked);
        }
    }

    @Transactional
    public void unblockUser(String userId, String targetUserId) {
        blockedUserRepository.deleteByUserIdAndBlockedUserId(userId, targetUserId);
    }

    @Transactional
    public void reportUser(String reporterId, String reportedUserId, ReportUserRequest request) {
        if (reporterId.equals(reportedUserId)) {
            throw new BadRequestException("You cannot report yourself");
        }

        User reporter = getUserEntity(reporterId);
        User reportedUser = getUserEntity(reportedUserId);

        Report report = Report.builder()
                .id(UUID.randomUUID().toString())
                .reporter(reporter)
                .reportedUser(reportedUser)
                .reason(request.getReason())
                .details(request.getDetails())
                .status("PENDING")
                .build();

        reportRepository.save(report);
    }

    public User getUserEntity(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
