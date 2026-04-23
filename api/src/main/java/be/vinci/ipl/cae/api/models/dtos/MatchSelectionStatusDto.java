package be.vinci.ipl.cae.api.models.dtos;

/**
 * Lightweight DTO used by the admin to check if both teams have submitted
 * their lineup for a given match.
 */
public record MatchSelectionStatusDto(
    Long id,
    Integer roundNumber,
    boolean teamAReady,
    boolean teamBReady
) {}
