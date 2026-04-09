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

    List<Appointment> findByStaffIdAndStartTimeBetweenOrderByStartTimeAsc(
        UUID staffId,
        LocalDateTime from,
        LocalDateTime to
    );

    @Query("""
        select a from Appointment a
        where a.clientId = :clientId and a.startTime >= :from
        order by a.startTime asc
        """)
    List<Appointment> findUpcomingByClientId(
        @Param("clientId") UUID clientId,
        @Param("from") LocalDateTime from
    );
}

