package com.Siddharth.internshiptracker.Controller;

import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userService.findByEmail(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        User currentUser = userService.findByEmail(authentication.getName());
        if (currentUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        // Update user fields but preserve the ID and password
        updatedUser.setId(currentUser.getId());
        updatedUser.setPassword(currentUser.getPassword());
        
        try {
            User savedUser = userService.updateUser(updatedUser);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }
}