package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO representing a period of unavailabilities.
 */
public record UnavailabilityDto(

    @NotNull LocalDate startDate,

    @NotNull LocalDate endDate
) {

}
