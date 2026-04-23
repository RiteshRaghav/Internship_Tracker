package com.Siddharth.internshiptracker.repository;

import com.Siddharth.internshiptracker.model.Resume;
import com.Siddharth.internshiptracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Integer> {
    List<Resume> findByUser(User user);
}

