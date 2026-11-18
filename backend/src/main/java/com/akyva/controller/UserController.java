package com.akyva.controller;

import com.akyva.dto.user.ReportUserRequest;
import com.akyva.dto.user.UpdateUserRequest;
import com.akyva.dto.user.UserDto;
import com.akyva.security.UserPrincipal;
import com.akyva.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile, search, block, and report management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getCurrentUser(principal.getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserDto> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(principal.getId(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by username, display name, or private AKYVA ID (never exposes phone numbers)")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam("query") String query,
                                                     @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.searchUsers(query, principal.getId()));
    }

    @PostMapping("/{id}/block")
    @Operation(summary = "Block a user from contacting you")
    public ResponseEntity<Map<String, String>> blockUser(@PathVariable String id,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        userService.blockUser(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
    }

    @DeleteMapping("/{id}/block")
    @Operation(summary = "Unblock a previously blocked user")
    public ResponseEntity<Map<String, String>> unblockUser(@PathVariable String id,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        userService.unblockUser(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
    }

    @PostMapping("/{id}/report")
    @Operation(summary = "Report a user for suspicious activity, harassment, or scam")
    public ResponseEntity<Map<String, String>> reportUser(@PathVariable String id,
                                                          @AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody ReportUserRequest request) {
        userService.reportUser(principal.getId(), id, request);
        return ResponseEntity.ok(Map.of("message", "User reported successfully. Security team notified."));
    }
}
