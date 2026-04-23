package com.Siddharth.internshiptracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InternshipDTO {
    private Long id;
    private String company;
    private String platform;
    private String status;  // Applied, Interview, Rejected, Selected
    private LocalDate appliedDate;
}
