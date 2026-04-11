package com.beautlyai.salon.booking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;

@Data
public class CreateAppointmentRequest {

    @NotNull
    private UUID clientId;

    @NotNull
    private UUID staffId;

    @NotNull
    private UUID serviceId;

    @NotNull
    @Future
    private LocalDateTime startTime;

    @NotNull
    @Future
    private LocalDateTime endTime;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal depositPaid;

    private String notes;
}

