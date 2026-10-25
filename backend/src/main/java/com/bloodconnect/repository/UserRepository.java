package com.bloodconnect.repository;

import com.bloodconnect.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<AppUser, UUID> {
    boolean existsByEmail(String email);

    Optional<AppUser> findByEmail(String email);

    List<AppUser> findAllByOrderByCreatedAtDesc();
}
