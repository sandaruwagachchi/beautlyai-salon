package com.beautlyai.salon.booking.dto;

import com.beautlyai.salon.booking.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAppointmentStatusRequest {

    @NotNull
    private AppointmentStatus status;
}

