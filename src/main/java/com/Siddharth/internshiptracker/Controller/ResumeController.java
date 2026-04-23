package com.Siddharth.internshiptracker.Controller;

import com.Siddharth.internshiptracker.model.Resume;
import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.service.ResumeService;
import com.Siddharth.internshiptracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private UserService userService;

    // POST /api/resumes
    @PostMapping
    public ResponseEntity<Resume> uploadResume(@RequestBody Resume resume) {
        // For simplicity, assume resume.user is set properly or get from auth context
        Resume savedResume = resumeService.saveResume(resume);
        return ResponseEntity.ok(savedResume);
    }

    // POST /api/resumes/upload (multipart)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resume> uploadResumeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("userId") Integer userId
    ) {
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        Resume saved = resumeService.storeResumeFile(file, title, user);
        return ResponseEntity.ok(saved);
    }

    // GET /api/resumes?userId=xxx
    @GetMapping
    public ResponseEntity<List<Resume>> getUserResumes(@RequestParam Integer userId) {
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Resume> resumes = resumeService.getResumesByUser(user);
        return ResponseEntity.ok(resumes);
    }

    // DELETE /api/resumes/{id}?userId=xxx
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable Integer id, @RequestParam Integer userId) {
        try {
            resumeService.deleteResume(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
