package com.app_template.App_Template.entity;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String image;
    private boolean mfaEnabled;
}
