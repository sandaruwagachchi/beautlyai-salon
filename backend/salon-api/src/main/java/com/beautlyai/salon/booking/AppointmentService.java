package com.beautlyai.salon.booking;

import com.beautlyai.salon.booking.dto.AppointmentResponse;
import com.beautlyai.salon.booking.dto.CreateAppointmentRequest;
import com.beautlyai.salon.booking.exception.AppointmentNotFoundException;
import com.beautlyai.salon.booking.exception.InvalidAppointmentTransitionException;
import com.beautlyai.salon.booking.mapper.AppointmentMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;

    /**
     * Creates a new appointment in BOOKED state.
     *
     * @param request creation payload
     * @return created appointment response
     */
    @Transactional
    public AppointmentResponse create(CreateAppointmentRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new InvalidAppointmentTransitionException("endTime must be after startTime");
        }

        Appointment appointment = appointmentMapper.toEntity(request);
        appointment.setStatus(AppointmentStatus.BOOKED);
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    /**
     * Finds one appointment by identifier.
     *
     * @param id appointment id
     * @return appointment response
     */
    @Transactional(readOnly = true)
    public AppointmentResponse getById(UUID id) {
        return appointmentMapper.toResponse(fetchById(id));
    }

    /**
     * Confirms a booked appointment.
     *
     * @param id appointment id
     * @return updated appointment response
     */
    @Transactional
    public AppointmentResponse confirm(UUID id) {
        return transition(id, AppointmentStatus.CONFIRMED);
    }

    /**
     * Marks an appointment as checked-in.
     *
     * @param id appointment id
     * @return updated appointment response
     */
    @Transactional
    public AppointmentResponse checkIn(UUID id) {
        return transition(id, AppointmentStatus.CHECKED_IN);
    }

    /**
     * Completes an appointment.
     *
     * @param id appointment id
     * @return updated appointment response
     */
    @Transactional
    public AppointmentResponse complete(UUID id) {
        return transition(id, AppointmentStatus.COMPLETED);
    }

    /**
     * Cancels an appointment.
     *
     * @param id appointment id
     * @return updated appointment response
     */
    @Transactional
    public AppointmentResponse cancel(UUID id) {
        return transition(id, AppointmentStatus.CANCELLED);
    }

    /**
     * Marks an appointment as no-show.
     *
     * @param id appointment id
     * @return updated appointment response
     */
    @Transactional
    public AppointmentResponse markNoShow(UUID id) {
        return transition(id, AppointmentStatus.NO_SHOW);
    }

    /**
     * Updates appointment status via generic endpoint.
     *
     * @param id appointment id
     * @param targetStatus requested target status
     * @return updated appointment response
     */
    @Transactional
    public AppointmentResponse updateStatus(UUID id, AppointmentStatus targetStatus) {
        return switch (targetStatus) {
            case CONFIRMED -> confirm(id);
            case CHECKED_IN -> checkIn(id);
            case COMPLETED -> complete(id);
            case CANCELLED -> cancel(id);
            case NO_SHOW -> markNoShow(id);
            case IN_PROGRESS -> transition(id, AppointmentStatus.IN_PROGRESS);
            case BOOKED -> throw new InvalidAppointmentTransitionException("Cannot set appointment back to BOOKED");
        };
    }

    /**
     * Returns calendar appointments for one staff member in a date range.
     *
     * @param staffId staff id
     * @param fromDate inclusive from date
     * @param toDate inclusive to date
     * @return list of appointment responses
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getCalendar(UUID staffId, LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay().minusNanos(1);
        return appointmentRepository
            .findByStaffIdAndStartTimeBetweenOrderByStartTimeAsc(staffId, from, to)
            .stream()
            .map(appointmentMapper::toResponse)
            .toList();
    }

    /**
     * Returns upcoming appointments for a client.
     *
     * @param clientId client id
     * @return list of appointment responses
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUpcomingForClient(UUID clientId) {
        return appointmentRepository
            .findUpcomingByClientId(clientId, LocalDateTime.now())
            .stream()
            .map(appointmentMapper::toResponse)
            .toList();
    }

    private AppointmentResponse transition(UUID id, AppointmentStatus targetStatus) {
        Appointment appointment = fetchById(id);
        validateTransition(appointment.getStatus(), targetStatus);
        appointment.setStatus(targetStatus);
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    private Appointment fetchById(UUID id) {
        return appointmentRepository
            .findById(id)
            .orElseThrow(() -> new AppointmentNotFoundException(id));
    }

    private void validateTransition(AppointmentStatus current, AppointmentStatus target) {
        if (current == target) {
            return;
        }

        Set<AppointmentStatus> allowedTargets = switch (current) {
            case BOOKED -> EnumSet.of(AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED);
            case CONFIRMED -> EnumSet.of(
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.CANCELLED,
                AppointmentStatus.NO_SHOW
            );
            case CHECKED_IN -> EnumSet.of(AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED);
            case IN_PROGRESS -> EnumSet.of(AppointmentStatus.COMPLETED);
            case COMPLETED, NO_SHOW, CANCELLED -> EnumSet.noneOf(AppointmentStatus.class);
        };

        if (!allowedTargets.contains(target)) {
            throw new InvalidAppointmentTransitionException(current, target);
        }
    }
}

