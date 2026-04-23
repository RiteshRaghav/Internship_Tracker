package com.Siddharth.internshiptracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;

@Configuration
public class WebConfig {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }

            @Override
            public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                // Serve uploaded files under /uploads/** from the filesystem directory
                String location = "file:" + uploadDir + "/";
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations(location);
            }
        };
    }
}
