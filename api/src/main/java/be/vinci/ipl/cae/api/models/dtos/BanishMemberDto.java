package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Data transfer object used to banish a member.
 *
 * @param reason the reason of banishment
 */
public record BanishMemberDto(
    @NotBlank String reason
) {

}
