package com.beautlyai.salon.booking.dto;

import com.beautlyai.salon.booking.AppointmentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;

@Data
public class AppointmentResponse {

    private UUID id;
    private UUID clientId;
    private UUID staffId;
    private UUID serviceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private BigDecimal depositPaid;
    private String notes;
}

