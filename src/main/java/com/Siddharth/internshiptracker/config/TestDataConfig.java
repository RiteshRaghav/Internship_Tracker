package com.Siddharth.internshiptracker.config;

import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TestDataConfig implements CommandLineRunner {
    
    @Autowired
    private UserService userService;
    
    @Override
    public void run(String... args) throws Exception {
        // Create test user if not exists
        if (!userService.userExistsByEmail("test@example.com")) {
            User testUser = new User();
            testUser.setName("Test User");
            testUser.setEmail("test@example.com");
            testUser.setPassword("password123"); // Let UserService handle the encoding
            testUser.setBranch("Computer Science");
            testUser.setCollege("Test College");
            
            userService.registerUser(testUser);
        }
    }
}
