package com.Siddharth.internshiptracker.config;

import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataFixConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataFixConfig(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        for (User user : userRepository.findAll()) {
            String pwd = user.getPassword();
            if (pwd == null || pwd.isEmpty()) {
                continue;
            }
            // If password is not already BCrypt (starts with $2a, $2b, or $2y), encode it
            if (!(pwd.startsWith("$2a$") || pwd.startsWith("$2b$") || pwd.startsWith("$2y$"))) {
                user.setPassword(passwordEncoder.encode(pwd));
                userRepository.save(user);
            }
        }
    }
}


