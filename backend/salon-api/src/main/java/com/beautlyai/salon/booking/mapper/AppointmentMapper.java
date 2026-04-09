package com.beautlyai.salon.booking.mapper;

import com.beautlyai.salon.booking.Appointment;
import com.beautlyai.salon.booking.dto.AppointmentResponse;
import com.beautlyai.salon.booking.dto.CreateAppointmentRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    /**
     * Maps create-request DTO to appointment entity.
     *
     * @param request create payload
     * @return appointment entity with generated fields unset
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    Appointment toEntity(CreateAppointmentRequest request);

    /**
     * Maps appointment entity to response DTO.
     *
     * @param appointment appointment entity
     * @return response DTO
     */
    AppointmentResponse toResponse(Appointment appointment);
}

