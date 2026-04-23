package com.Siddharth.internshiptracker.service;

import com.Siddharth.internshiptracker.model.Internship;
import com.Siddharth.internshiptracker.repository.InternshipRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InternshipService {

    @Autowired
    private InternshipRepository internshipRepository;

    public Internship saveInternship(Internship internship) {
        return internshipRepository.save(internship);
    }

    public List<Internship> getInternshipsByUserId(Long userId) {
        return internshipRepository.findByUser_Id(userId, PageRequest.of(0, 100)).getContent();
    }

    public Page<Internship> getInternshipsByStatus(String status, Long userId, Pageable pageable) {
        return internshipRepository.findByStatusAndUser_Id(status, userId, pageable);
    }

    public List<Internship> searchByCompany(String company, Long userId) {
        return internshipRepository.findByCompanyContainingIgnoreCaseAndUser_Id(company, userId, PageRequest.of(0, 100)).getContent();
    }

    public Internship updateStatus(Long id, String status) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Internship not found with id: " + id));
        internship.setStatus(status);
        return internshipRepository.save(internship);
    }

    public void deleteInternship(Long id) {
        if (!internshipRepository.existsById(id)) {
            throw new EntityNotFoundException("Internship not found with id: " + id);
        }
        internshipRepository.deleteById(id);
    }

    public Page<Internship> getInternshipsByUserId(Long userId, Pageable pageable) {
        return internshipRepository.findByUser_Id(userId, pageable);
    }

    public List<Internship> searchAndFilter(String company, String status, Long userId) {
        if ((company == null || company.isEmpty()) && (status == null || status.isEmpty())) {
            return internshipRepository.findByUser_Id(userId, PageRequest.of(0, 100)).getContent();
        } else if (company == null || company.isEmpty()) {
            return internshipRepository.findByStatusAndUser_Id(status, userId, PageRequest.of(0, 100)).getContent();
        } else if (status == null || status.isEmpty()) {
            return internshipRepository.findByCompanyContainingIgnoreCaseAndUser_Id(company, userId, PageRequest.of(0, 100)).getContent();
        } else {
            return internshipRepository.findByCompanyContainingIgnoreCaseAndStatusAndUser_Id(company, status, userId, PageRequest.of(0, 100)).getContent();
        }
    }

    public List<Internship> filterByStatus(String status, Long userId) {
        return internshipRepository.findByStatusAndUser_Id(status, userId, PageRequest.of(0, 100)).getContent();
    }
    
    public Internship findById(Long id) {
        return internshipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Internship not found with id: " + id));
    }
}
