package com.beautlyai.salon.booking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    /**
     * Finds appointments for a staff member within a date/time window.
     *
     * @param staffId staff identifier
     * @param from inclusive lower bound
     * @param to inclusive upper bound
     * @return staff appointments ordered by start time ascending
     */
    List<Appointment> findByStaffIdAndStartTimeBetweenOrderByStartTimeAsc(
        UUID staffId,
        LocalDateTime from,
        LocalDateTime to
    );

    /**
     * Finds upcoming appointments for a client from a given point in time.
     *
     * @param clientId client identifier
     * @param from inclusive lower bound for upcoming appointments
     * @return client appointments ordered by start time ascending
     */
    @Query("""
        select a from Appointment a
        where a.clientId = :clientId and a.startTime >= :from
        order by a.startTime asc
        """)
    List<Appointment> findUpcomingByClientId(
        @Param("clientId") UUID clientId,
        @Param("from") LocalDateTime from
    );

    /**
     * Finds appointments in a time window by status set.
     *
     * @param from inclusive lower bound
     * @param to inclusive upper bound
     * @param statuses allowed appointment statuses
     * @return appointments ordered by start time ascending
     */
    List<Appointment> findByStartTimeBetweenAndStatusInOrderByStartTimeAsc(
        LocalDateTime from,
        LocalDateTime to,
        Collection<AppointmentStatus> statuses
    );
}

