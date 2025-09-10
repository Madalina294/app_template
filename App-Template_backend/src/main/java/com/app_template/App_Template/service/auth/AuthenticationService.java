package com.app_template.App_Template.service.auth;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.app_template.App_Template.auth.AuthenticationRequest;
import com.app_template.App_Template.auth.AuthenticationResponse;
import com.app_template.App_Template.auth.RegisterRequest;
import com.app_template.App_Template.auth.VerificationRequest;
import com.app_template.App_Template.config.JwtService;
import com.app_template.App_Template.entity.User;
import com.app_template.App_Template.enums.Role;
import com.app_template.App_Template.repository.UserRepository;
import com.app_template.App_Template.tfa.TwoFactorAuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TwoFactorAuthenticationService tfaService;

    @PostConstruct
    public void createAdminAccount(){
        Optional<User> optionalAdmin = userRepository.findByRole(Role.ADMIN);
        if(optionalAdmin.isEmpty()){
            User admin = new User();
            admin.setFirstname("Admin");
            admin.setLastname("Management");
            admin.setEmail("admin@gmail.com");
            admin.setRole(Role.ADMIN);
            admin.setPassword(new BCryptPasswordEncoder().encode("Adminul_0"));
            admin.setMfaEnabled(true);
            admin.setSecret(tfaService.generateNewSecret());
            userRepository.save(admin);
            System.out.println("Admin created successfully!");
        }
        else{
            System.out.println("Admin already exists!");
        }
    }

    public AuthenticationResponse register(RegisterRequest registerRequest) {
        var user = User.builder()
                .firstname(registerRequest.getFirstname())
                .lastname(registerRequest.getLastname())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole() != null ? registerRequest.getRole() : Role.USER)
                .mfaEnabled(registerRequest.isMfaEnabled())
                .build();

        // if mfaEnabled --> generate secret

        if(registerRequest.isMfaEnabled()){
            user.setSecret(tfaService.generateNewSecret());
        }

        userRepository.save(user);

        var jwtToken  = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .userId(user.getId())
                .userFirstName(user.getFirstname())
                .userLastName(user.getLastname())
                .userRole(user.getRole())
                .secretImageUri(user.isMfaEnabled() ? tfaService.generateQrCodeImageUri(user.getSecret()) : null)
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .mfaEnabled(user.isMfaEnabled())
                .build();

    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        if(user.isMfaEnabled()){
            return AuthenticationResponse.builder()
                    .userId(user.getId())
                    .userFirstName(user.getFirstname())
                    .userLastName(user.getLastname())
                    .userRole(user.getRole())
                    .accessToken("")
                    .refreshToken("")
                    .mfaEnabled(true)
                    .secretImageUri(tfaService.generateQrCodeImageUri(user.getSecret()))
                    .build();
        }
        var jwtToken  = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .userId(user.getId())
                .userFirstName(user.getFirstname())
                .userLastName(user.getLastname())
                .userRole(user.getRole())
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false)
                .build();
    }

    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.userRepository.findByEmail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .mfaEnabled(false)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

    public AuthenticationResponse verifyCode(VerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException(String.format("User with email %s not found", request.getEmail())));
        if(tfaService.isOtpNotValid(user.getSecret(), request.getCode())){
            throw new BadCredentialsException("Code is not correct");
        }
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .mfaEnabled(user.isMfaEnabled())
                .build();
    }
}
