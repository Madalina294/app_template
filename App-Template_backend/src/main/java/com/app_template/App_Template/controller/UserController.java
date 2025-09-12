package com.app_template.App_Template.controller;

import com.app_template.App_Template.entity.UpdateProfileRequest;
import com.app_template.App_Template.entity.User;
import com.app_template.App_Template.service.user.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor

public class UserController {

    @Autowired
    private UserService userService;

    @DeleteMapping("/delete/{userId}")
    public void delete(@PathVariable("userId") Long userId) {
        this.userService.deleteAccount(userId);
    }

    @PutMapping("/update-infos")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest updateProfileRequest) {
        try{
            User user = userService.updateProfileInfos(updateProfileRequest);
            return new ResponseEntity<>(user, HttpStatus.OK);
        }catch (EntityNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }
}
