package com.bloodconnect.service;

import com.bloodconnect.dto.UserResponse;
import com.bloodconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(UserResponse::from)
                .toList();
    }
}