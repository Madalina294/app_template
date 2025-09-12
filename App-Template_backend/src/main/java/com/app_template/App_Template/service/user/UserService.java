package com.app_template.App_Template.service.user;

import com.app_template.App_Template.auth.AuthenticationResponse;
import com.app_template.App_Template.entity.UpdateProfileRequest;
import com.app_template.App_Template.entity.User;

public interface UserService {
    void deleteAccount(Long userId);
    User updateProfileInfos(UpdateProfileRequest request);
}
