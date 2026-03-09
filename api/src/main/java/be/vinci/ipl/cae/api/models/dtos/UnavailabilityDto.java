package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO representing a period of unavailabilities.
 */
@Getter
@Setter
public class UnavailabilityDto {

  @NotNull
  private LocalDate startDate;

  @NotNull
  private LocalDate endDate;
}
