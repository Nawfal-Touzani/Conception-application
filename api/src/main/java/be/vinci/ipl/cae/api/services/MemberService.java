package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ChangePasswordDto;
import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling member-related business logic.
 */
@Service
public class MemberService {

  private final MemberRepository memberRepository;
  private final SpecialityRepository specialityRepository;
  private final ImageRepository imageRepository;
  private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final TeamCompositionRepository teamCompositionRepository;

  /**
   * Constructor for MemberService.
   */
  public MemberService(ImageRepository imageRepository, MemberRepository memberRepository,
      SpecialityRepository specialityRepository, BCryptPasswordEncoder passwordEncoder,
      TeamCompositionRepository teamCompositionRepository) {
    this.imageRepository = imageRepository;
    this.memberRepository = memberRepository;
    this.specialityRepository = specialityRepository;
    this.passwordEncoder = passwordEncoder;
    this.teamCompositionRepository = teamCompositionRepository;
  }

  /**
   * Retrieves the profile of a member by email.
   *
   * @param email the member's email
   * @return the profile DTO or null if not found
   */
  public MemberProfileResponseDto getProfile(String email) {
    Member member = memberRepository.findByEmail(email).orElse(null);

    if (member == null) {
      return null;
    }

    MemberProfileResponseDto dto = new MemberProfileResponseDto();
    dto.setEmail(member.getEmail());
    dto.setTag(member.getTag());
    dto.setSpeciality(member.getSpeciality().getName());
    dto.setProfileImage(member.getImage().getUrl());
    dto.setCreationDate(member.getProfileCreationDate());
    dto.setTeamName("No team");
    teamCompositionRepository.findByMemberId(member.getId())
        .ifPresent(composition -> dto.setTeamName(composition.getTeam()
            .getName()));

    return dto;
  }

  /**
   * Updates a member's profile information.
   *
   * @param email   the member's email
   * @param payload the data to update
   * @return the updated profile DTO or null if member not found
   */
  public MemberProfileResponseDto updateProfile(String email, UpdateMemberProfileDto payload) {
    Member member = memberRepository.findByEmail(email).orElse(null);

    if (member == null) {
      return null;
    }

    if (payload.getSpeciality() != null) {
      specialityRepository.findByName(payload.getSpeciality())
          .ifPresent(member::setSpeciality);
    }

    if (payload.getProfileImage() != null) {
      imageRepository.findByUrl(payload.getProfileImage())
          .ifPresent(member::setImage);
    }

    memberRepository.save(member);
    return getProfile(email);
  }

  /**
   * Updates a member's password after verifying the old one.
   *
   * @param email the member's email
   * @param dto   the DTO containing the old and new password
   * @return true if the password was changed, false if member not found or old password incorrect
   */
  public boolean changePassword(String email, ChangePasswordDto dto) {
    if (dto == null || dto.getNewPassword() == null
        || dto.getNewPassword().equals(dto.getOldPassword())) {
      return false;
    }

    if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
      return false;
    }

    Member member = memberRepository.findByEmail(email).orElse(null);

    if (member == null) {
      return false;
    }

    if (!passwordEncoder.matches(dto.getOldPassword(), member.getPassword())) {
      return false;
    }

    member.setPassword(passwordEncoder.encode(dto.getNewPassword()));
    memberRepository.save(member);
    return true;

  }
}