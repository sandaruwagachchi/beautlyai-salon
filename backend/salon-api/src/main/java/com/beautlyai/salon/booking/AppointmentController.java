package com.beautlyai.salon.booking;

import com.beautlyai.salon.booking.dto.AppointmentResponse;
import com.beautlyai.salon.booking.dto.CreateAppointmentRequest;
import com.beautlyai.salon.booking.dto.UpdateAppointmentStatusRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Creates a new appointment.
     *
     * @param request create payload
     * @return created appointment
     */
    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.create(request));
    }

    /**
     * Reads an appointment by id.
     *
     * @param id appointment id
     * @return appointment response
     */
    @GetMapping("/appointments/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.getById(id));
    }

    /**
     * Updates appointment status.
     *
     * @param id appointment id
     * @param request status payload
     * @return updated appointment
     */
    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAppointmentStatusRequest request
    ) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, request.getStatus()));
    }

    /**
     * Returns staff calendar in a date range.
     *
     * @param staffId staff id
     * @param fromDate range start date
     * @param toDate range end date
     * @return calendar items
     */
    @GetMapping("/calendar/{staffId}")
    public ResponseEntity<List<AppointmentResponse>> getCalendar(
        @PathVariable UUID staffId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return ResponseEntity.ok(appointmentService.getCalendar(staffId, fromDate, toDate));
    }
}

