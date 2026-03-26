package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import java.time.LocalDate;

public record TournamentFilterDto(
    Status status,
    String teamName,
    LocalDate startFrom,
    LocalDate startTo
) {
}
