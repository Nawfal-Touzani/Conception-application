package be.vinci.ipl.cae.api.models.dtos;

/**
 * The type Team member dto.
 */
public record TeamMemberDto(

    Long memberId,
    String gameTag,
    String avatarUrl,
    boolean isAvailable

) {}