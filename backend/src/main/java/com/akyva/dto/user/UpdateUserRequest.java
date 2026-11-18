package com.akyva.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(min = 1, max = 100, message = "Display name must be between 1 and 100 characters")
    private String displayName;

    private String profileImage;

    @Size(max = 255, message = "Bio must not exceed 255 characters")
    private String bio;

    @Size(max = 100, message = "Status must not exceed 100 characters")
    private String status;
}
