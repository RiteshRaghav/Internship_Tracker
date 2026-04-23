package com.Siddharth.internshiptracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "internships")
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String platform;

    private String deadline;

    private String appliedOn;

    @Column(nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    @JsonIgnore
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Transient field to accept userId from JSON requests
    @Transient
    private Long userId;
    
    // Transient field to accept resumeId from JSON requests
    @Transient
    private Integer resumeId;

    // Transient fields to expose resume info in JSON without serializing the entire Resume entity
    @Transient
    private String resumeTitle;

    @Transient
    private String resumeUrl;

    // Getters and Setters

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getAppliedOn() {
        return appliedOn;
    }

    public void setAppliedOn(String appliedOn) {
        this.appliedOn = appliedOn;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getUserId() {
        if (this.userId != null) {
            return this.userId;
        }
        return user != null ? user.getId().longValue() : null;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Integer getResumeId() {
        if (this.resumeId != null) {
            return this.resumeId;
        }
        return resume != null ? resume.getId() : null;
    }
    
    public void setResumeId(Integer resumeId) {
        this.resumeId = resumeId;
    }

    public String getResumeTitle() {
        if (this.resumeTitle != null) {
            return this.resumeTitle;
        }
        return resume != null ? resume.getTitle() : null;
    }

    public void setResumeTitle(String resumeTitle) {
        this.resumeTitle = resumeTitle;
    }

    public String getResumeUrl() {
        if (this.resumeUrl != null) {
            return this.resumeUrl;
        }
        return resume != null ? resume.getUrl() : null;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }
}
