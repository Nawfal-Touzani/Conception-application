package be.vinci.ipl.cae.api.models.dtos;

/**
 * DTO used to return the three necessary homepage tournaments in a single response from the already
 * existing DTO. Each field is null if no tournament matches the criteria.
 */
public record HomepageTournamentsDto(TournamentResponseDto lastFinished,
                                     TournamentResponseDto inProgress,
                                     TournamentResponseDto nextUpcoming) {

}

