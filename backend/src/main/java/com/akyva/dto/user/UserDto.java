package com.akyva.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String username;
    private String displayName;
    private String email;
    private String profileImage;
    private String bio;
    private String status;
    private String akyvaId;
    private Instant createdAt;
    private Instant updatedAt;
}
