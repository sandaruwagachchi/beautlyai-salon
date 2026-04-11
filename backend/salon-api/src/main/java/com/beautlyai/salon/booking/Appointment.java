package com.beautlyai.salon.booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

	@Id
	@GeneratedValue
	private UUID id;

	@Column(nullable = false)
	private UUID clientId;

	@Column(nullable = false)
	private UUID staffId;

	@Column(nullable = false)
	private UUID serviceId;

	@Column(nullable = false)
	private LocalDateTime startTime;

	@Column(nullable = false)
	private LocalDateTime endTime;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AppointmentStatus status;

	@Column(precision = 12, scale = 2)
	private BigDecimal depositPaid;

	@Column(length = 1000)
	private String notes;

	@PrePersist
	void prePersist() {
		if (status == null) {
			status = AppointmentStatus.BOOKED;
		}
	}
}

