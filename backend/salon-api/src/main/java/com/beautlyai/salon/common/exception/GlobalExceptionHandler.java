package com.beautlyai.salon.common.exception;

import com.beautlyai.salon.booking.exception.AppointmentNotFoundException;
import com.beautlyai.salon.booking.exception.InvalidAppointmentTransitionException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ResourceNotFoundException.class, AppointmentNotFoundException.class})
    public ProblemDetail handleNotFound(RuntimeException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource not found");
        problem.setType(URI.create("https://beautlyai.com/problems/resource-not-found"));
        return problem;
    }

    @ExceptionHandler({InvalidAppointmentStateException.class, InvalidAppointmentTransitionException.class})
    public ProblemDetail handleInvalidState(RuntimeException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Invalid appointment status transition");
        problem.setType(URI.create("https://beautlyai.com/problems/invalid-appointment-state"));
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            "Request validation failed"
        );
        problem.setTitle("Validation failed");
        problem.setType(URI.create("https://beautlyai.com/problems/validation"));

        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        problem.setProperty("errors", errors);
        return problem;
    }
}

