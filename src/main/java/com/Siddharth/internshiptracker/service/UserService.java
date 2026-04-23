package com.Siddharth.internshiptracker.service;

import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User findById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    public Authentication authenticate(String email, String password) {
        return authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
    }

    public String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        // Return the actual User object since it implements UserDetails
        return user;
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    // Password reset helpers
    public User findByResetToken(String token) {
        return userRepository.findByResetToken(token).orElse(null);
    }

    public void setResetTokenForUser(User user, String token, LocalDateTime expiry) {
        user.setResetToken(token);
        user.setResetTokenExpiry(expiry);
        userRepository.save(user);
    }

    public boolean resetPassword(String token, String newPassword) {
        User user = findByResetToken(token);
        if (user == null) return false;
        LocalDateTime now = LocalDateTime.now();
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(now)) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return true;
    }
}
