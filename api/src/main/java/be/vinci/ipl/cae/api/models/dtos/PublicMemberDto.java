package be.vinci.ipl.cae.api.models.dtos;

import java.time.LocalDate;

/**
 * Data transfer object representing a public view of a member.
 */
public record PublicMemberDto(
    Long id,
    String tag,
    String profileImage,
    String speciality,
    String teamName,
    LocalDate profileCreationDate
) {

}
