package be.vinci.ipl.cae.api.models.dtos;

/**
 * Dto for service.
 *
 * @param scoreA the score of teamA
 * @param scoreB the score of teamB
 */
public record ResultRequest(
    Integer scoreA,
    Integer scoreB
) {

}
