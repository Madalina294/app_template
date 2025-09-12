package com.app_template.App_Template.service.user;

import com.app_template.App_Template.entity.UpdateProfileRequest;
import com.app_template.App_Template.entity.User;
import com.app_template.App_Template.repository.UserRepository;
import com.app_template.App_Template.tfa.TwoFactorAuthenticationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;
@Service
@RequiredArgsConstructor

public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TwoFactorAuthenticationService tfaService;

    @Override
    public void deleteAccount(Long userId) {
        Optional<User> user = userRepository.findFirstById(userId);
        if (user.isPresent()) {
            userRepository.deleteById(userId);
        }
        else{
            throw new EntityNotFoundException("User not found");
        }
    }

    @Override
    public User updateProfileInfos(UpdateProfileRequest request) {
        User presentUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

            // Convert base64 string to byte array for storage
            byte[] imageBytes = null;
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                try {
                    // Remove data URL prefix if present (data:image/jpeg;base64,)
                    String base64Data = request.getImage();
                    if (base64Data.contains(",")) {
                        base64Data = base64Data.split(",")[1];
                    }
                    imageBytes = Base64.getDecoder().decode(base64Data);
                } catch (IllegalArgumentException e) {
                    // Handle invalid base64 data
                    System.err.println("Invalid base64 image data: " + e.getMessage());
                }
            }
            // update picture
            presentUser.setImage(imageBytes);

            //update email
            if(!presentUser.getEmail().equals(request.getEmail())) {
                Optional<User> existingUser = userRepository.findFirstByEmail(request.getEmail());
                if (existingUser.isPresent()) {
                    throw new IllegalArgumentException("Email already exists");
                }
                presentUser.setEmail(request.getEmail());
            }

            //Update username
            presentUser.setFirstname(request.getFirstName());
            presentUser.setLastname(request.getLastName());

            //Update 2fa feature
            if(request.isMfaEnabled()){
                presentUser.setMfaEnabled(true);
                presentUser.setSecret(tfaService.generateNewSecret());
            }
            return userRepository.save(presentUser);
    }
}
