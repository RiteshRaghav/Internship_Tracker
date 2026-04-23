package com.Siddharth.internshiptracker.service;

import com.Siddharth.internshiptracker.model.Resume;
import com.Siddharth.internshiptracker.model.Internship;
import com.Siddharth.internshiptracker.model.User;
import com.Siddharth.internshiptracker.repository.ResumeRepository;
import com.Siddharth.internshiptracker.repository.InternshipRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.util.List;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private InternshipRepository internshipRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public Resume saveResume(Resume resume) {
        return resumeRepository.save(resume);
    }

    /**
     * Delete a resume by id for a given user. Removes the PDF file from disk and deletes the DB record.
     * Throws IllegalArgumentException if not found or not owned by user.
     */
    public void deleteResume(Integer id, Integer userId) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));
        if (resume.getUser() == null || resume.getUser().getId() == null || !resume.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this resume");
        }

        // Detach resume from any internships that reference it to avoid FK constraint errors
        try {
            for (Internship i : internshipRepository.findByResume_Id(id)) {
                i.setResume(null);
                internshipRepository.save(i);
            }
        } catch (Exception e) {
            // Log and proceed; if this fails, DB delete may still fail due to constraints
            System.err.println("Failed to detach resume from internships: " + e.getMessage());
        }

        // Derive stored filename from public URL like "/uploads/<name>.pdf"
        String url = resume.getUrl();
        if (url != null && !url.isBlank()) {
            String prefix = "/uploads/";
            String fileName = url.startsWith(prefix) ? url.substring(prefix.length()) : url;
            try {
                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path filePath = uploadPath.resolve(fileName).normalize();
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            } catch (Exception ex) {
                // Log and proceed with DB deletion to avoid orphan DB rows
                // You may replace with a logger
                System.err.println("Failed to delete resume file: " + ex.getMessage());
            }
        }

        resumeRepository.delete(resume);
    }

    public List<Resume> getResumesByUser(User user) {
        return resumeRepository.findByUser(user);
    }
    
    public Resume findById(Integer id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resume not found with id: " + id));
    }

    /**
     * Store a resume PDF on disk and persist a Resume entity with a public URL.
     */
    public Resume storeResumeFile(MultipartFile file, String title, User user) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        // Validate PDF content type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && !contentType.equals("application/octet-stream"))) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }

        // Sanitize and generate unique filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "resume.pdf";
        }
        originalFilename = StringUtils.cleanPath(originalFilename);
        String extension = originalFilename.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
        String baseName = originalFilename.replaceAll("(?i)\\.pdf$", "").replaceAll("[^a-zA-Z0-9-_]", "_");
        String storedFilename = baseName + "_" + Instant.now().toEpochMilli() + extension;

        Path target = uploadPath.resolve(storedFilename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        // Public URL mapping served by WebMvc resource handler
        String publicUrl = "/uploads/" + storedFilename;

        Resume resume = new Resume();
        resume.setTitle(title);
        resume.setUrl(publicUrl);
        resume.setUser(user);
        return resumeRepository.save(resume);
    }
}
