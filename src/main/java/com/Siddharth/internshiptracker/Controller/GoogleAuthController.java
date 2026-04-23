package com.Siddharth.internshiptracker.Controller;

import com.Siddharth.internshiptracker.config.JwtConfig;
import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.repository.UserRepository;
import com.Siddharth.internshiptracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogle(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        
        // Verify the token with Google
        String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        ResponseEntity<Map> response = restTemplate.getForEntity(
            googleUserInfoUrl + "?access_token=" + token,
            Map.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> userInfo = response.getBody();
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            // Find or create user
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user = existingUser.orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                // Set a secure random password for OAuth2 users
                newUser.setPassword(UUID.randomUUID().toString());
                return userRepository.save(newUser);
            });

            // Generate JWT token
            String jwtToken = jwtConfig.generateToken(user.getEmail());

            return ResponseEntity.ok(Map.of(
                "token", jwtToken,
                "user", user
            ));
        }

        return ResponseEntity.badRequest().body("Failed to authenticate with Google");
    }
}