package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * The type Team member dto.
 */
public record TeamMemberDto(

    @NotBlank String gameTag,
    Long avatarId

) {}