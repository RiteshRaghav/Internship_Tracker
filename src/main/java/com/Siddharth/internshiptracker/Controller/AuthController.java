package com.Siddharth.internshiptracker.Controller;

import com.Siddharth.internshiptracker.dto.LoginRequest;
import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.service.UserService;
import com.Siddharth.internshiptracker.service.EmailService;
import com.Siddharth.internshiptracker.config.JwtConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            if (isBlank(user.getEmail()) || isBlank(user.getPassword()) || isBlank(user.getName())
                || isBlank(user.getBranch()) || isBlank(user.getCollege())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Missing required fields"));
            }
            if (userService.userExistsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(java.util.Map.of("message", "Email already exists"));
            }
            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", "Registration failed"));
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = userService.authenticate(
                loginRequest.getEmail(), loginRequest.getPassword()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String token = jwtConfig.generateToken(authentication.getName());
            
            // Get the user details
            User user = userService.findByEmail(loginRequest.getEmail());
            
            AuthResponse authResponse = new AuthResponse(token, user);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userService.findByEmail(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (isBlank(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
        }

        User user = userService.findByEmail(email);
        if (user != null) {
            String token = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(30);
            userService.setResetTokenForUser(user, token, expiry);
            // Build reset URL to frontend and send email
            String resetUrl = String.format("%s/reset-password?token=%s", frontendBaseUrl, token);
            String subject = "Reset your Internship Tracker password";
            String text = "Hi,\n\n" +
                    "We received a request to reset your password. " +
                    "Click the link below to set a new password (valid for 30 minutes):\n\n" +
                    resetUrl + "\n\n" +
                    "If you didn't request this, you can safely ignore this email.\n\n" +
                    "Thanks.";
            try {
                emailService.sendSimpleMessage(email, subject, text);
            } catch (Exception e) {
                // Log and continue to avoid leaking whether the email exists
                System.err.println("Failed to send reset email: " + e.getMessage());
            }
            return ResponseEntity.ok(Map.of(
                "message", "If the email exists, a reset link has been sent."
            ));
        }
        // Always return OK to avoid user enumeration
        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");
        if (isBlank(token) || isBlank(newPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token and new password are required"));
        }
        boolean success = userService.resetPassword(token, newPassword);
        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired token"));
        }
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
    }

    public static class AuthResponse {
        private String token;
        private User user;

        public AuthResponse(String token, User user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }
    }
}
