package com.beautlyai.salon.booking.mapper;

import com.beautlyai.salon.booking.Appointment;
import com.beautlyai.salon.booking.dto.AppointmentResponse;
import com.beautlyai.salon.booking.dto.CreateAppointmentRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    Appointment toEntity(CreateAppointmentRequest request);

    AppointmentResponse toResponse(Appointment appointment);
}

