package com.example.backend.repositories;

import com.example.backend.models.user.Role;
import com.example.backend.models.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findById(UUID id);
    List<User> findByRole(Role role);
    
    boolean existsByUsername(String username);
}
