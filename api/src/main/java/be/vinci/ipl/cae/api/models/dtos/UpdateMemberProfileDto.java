package be.vinci.ipl.cae.api.models.dtos;

/**
 * DTO used to update member profile.
 */
public record UpdateMemberProfileDto(
    String speciality,

    String profileImage
) {}
