package com.Siddharth.internshiptracker.repository;

import com.Siddharth.internshiptracker.model.Internship;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternshipRepository extends JpaRepository<Internship, Long> {

    Page<Internship> findByUser_Id(Long userId, Pageable pageable);

    Page<Internship> findByStatusAndUser_Id(String status, Long userId, Pageable pageable);

    Page<Internship> findByCompanyContainingIgnoreCaseAndUser_Id(String company, Long userId, Pageable pageable);

    Page<Internship> findByCompanyContainingIgnoreCaseAndStatusAndUser_Id(String company, String status, Long userId, Pageable pageable);

    List<Internship> findByResume_Id(Integer resumeId);
}
