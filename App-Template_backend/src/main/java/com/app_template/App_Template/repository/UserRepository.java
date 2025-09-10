package com.app_template.App_Template.repository;

import com.app_template.App_Template.entity.User;
import com.app_template.App_Template.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRole(Role role);
}
