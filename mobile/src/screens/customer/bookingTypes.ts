export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  categoryName: string;
}

export interface ServiceCategoryGroup {
  categoryName: string;
  services: Service[];
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CreateAppointmentRequest {
  serviceId: string;
  startTime: string;
}

export interface AppointmentCreateResponse {
  id: string;
  status: string;
  startTime: string;
}
