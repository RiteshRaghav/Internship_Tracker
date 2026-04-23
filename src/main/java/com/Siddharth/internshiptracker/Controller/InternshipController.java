package com.Siddharth.internshiptracker.Controller;

import com.Siddharth.internshiptracker.model.Internship;
import com.Siddharth.internshiptracker.model.Resume;
import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.service.InternshipService;
import com.Siddharth.internshiptracker.service.ResumeService;
import com.Siddharth.internshiptracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
public class InternshipController {

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private ResumeService resumeService;

    // Add new internship
    @PostMapping
    public ResponseEntity<?> addInternship(@RequestBody Internship internship) {
        try {
            // Set the user object based on userId
            if (internship.getUser() == null && internship.getUserId() != null) {
                User user = userService.findById(internship.getUserId().intValue());
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(java.util.Map.of("message", "Invalid userId"));
                }
                internship.setUser(user);
            }
            if (internship.getUser() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "userId is required"));
            }
            if (internship.getCompany() == null || internship.getRole() == null || internship.getStatus() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Missing required fields"));
            }
            Internship saved = internshipService.saveInternship(internship);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", "Failed to create internship: " + e.getMessage()));
        }
    }

    // Get all internships for a user
    @GetMapping
    public ResponseEntity<List<Internship>> getUserInternships(@RequestParam(required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        return ResponseEntity.ok(internshipService.getInternshipsByUserId(userId));
    }

    // Get a single internship by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getInternship(@PathVariable Long id) {
        try {
            Internship internship = internshipService.findById(id);
            if (internship == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("message", "Internship not found with id: " + id));
            }
            return ResponseEntity.ok(internship);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error retrieving internship: " + e.getMessage()));
        }
    }


    // Update internship status
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInternship(@PathVariable Long id, @RequestBody(required = false) Internship internship, @RequestParam(required = false) String status) {
        try {
            // If only status update is requested
            if (status != null && !status.isEmpty()) {
                // If the request body contains a status field, use that instead of the query parameter
                if (internship != null && internship.getStatus() != null && !internship.getStatus().isEmpty()) {
                    status = internship.getStatus();
                }
                return ResponseEntity.ok(internshipService.updateStatus(id, status));
            }
            
            // For full internship update
            if (internship == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(java.util.Map.of("message", "Request body is required for full update or provide 'status' query param for status update"));
            }

            if (internship.getUser() == null && internship.getUserId() != null) {
                User user = userService.findById(internship.getUserId().intValue());
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(java.util.Map.of("message", "Invalid userId"));
                }
                internship.setUser(user);
            }
            
            // Set the ID to ensure we're updating the correct record
            internship.setId(id);
            
            // Get the existing internship to preserve any fields not included in the update
            Internship existingInternship = internshipService.findById(id);
            
            // Handle resume if resumeId is provided
            if (internship.getResumeId() != null) {
                try {
                    Resume resume = resumeService.findById(internship.getResumeId());
                    if (resume != null) {
                        internship.setResume(resume);
                    }
                } catch (Exception e) {
                    // If resume not found, just log and continue without setting resume
                    System.out.println("Resume not found with id: " + internship.getResumeId());
                }
            }
            
            // Update the internship with the new data
            Internship updated = internshipService.saveInternship(internship);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", "Failed to update internship: " + e.getMessage()));
        }
    }

    // Delete internship
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternship(@PathVariable Long id) {
        internshipService.deleteInternship(id);
        return ResponseEntity.noContent().build();
    }

    // Search internships by company (case-insensitive)
    @GetMapping("/search")
    public ResponseEntity<List<Internship>> searchInternships(
            @RequestParam String company,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(internshipService.searchByCompany(company, userId));
    }

    // Filter internships by status
    @GetMapping("/filter")
    public ResponseEntity<List<Internship>> filterInternships(
            @RequestParam String status,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(internshipService.filterByStatus(status, userId));
    }

    // Combined search + filter
    @GetMapping("/search-filter")
    public ResponseEntity<List<Internship>> searchAndFilter(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String status,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(internshipService.searchAndFilter(company, status, userId));
    }
}
