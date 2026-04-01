package be.vinci.ipl.cae.api.models.dtos;

import java.time.LocalDate;

/**
 * Member profile DTO.
 */
public record MemberProfileResponseDto(
    Long id,
    String email,
    String tag,
    String speciality,
    String teamName,
    String profileImage,
    LocalDate creationDate,
    boolean isAdmin,
    boolean isAvailable,
    boolean isBan,
    String banReason,
    LocalDate banDate
) {}
