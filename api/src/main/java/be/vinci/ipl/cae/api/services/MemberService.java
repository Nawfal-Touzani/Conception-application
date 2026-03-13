package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ChangePasswordDto;
import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
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
  private BCryptPasswordEncoder passwordEncoder;
  private final TeamCompositionRepository teamCompositionRepository;
  private final UnavailabilityRepository unavailabilityRepository;

  /**
   * Constructor for MemberService.
   */
  public MemberService(ImageRepository imageRepository, MemberRepository memberRepository,
      BCryptPasswordEncoder passwordEncoder, SpecialityRepository specialityRepository,
      TeamCompositionRepository teamCompositionRepository,
      UnavailabilityRepository unavailabilityRepository) {
    this.imageRepository = imageRepository;
    this.memberRepository = memberRepository;
    this.passwordEncoder = passwordEncoder;
    this.specialityRepository = specialityRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.unavailabilityRepository = unavailabilityRepository;
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

    LocalDate today = LocalDate.now();
    boolean isUnavailable = unavailabilityRepository
        .existsByMemberAndStartDateBeforeAndEndDateAfter(
            member,
            today.plusDays(1),
            today.minusDays(1)
        );

    MemberProfileResponseDto dto = new MemberProfileResponseDto();
    dto.setEmail(member.getEmail());
    dto.setTag(member.getTag());
    dto.setSpeciality(member.getSpeciality().getName());
    dto.setProfileImage(member.getImage().getUrl());
    dto.setCreationDate(member.getProfileCreationDate());
    dto.setAdmin(member.getIsAdmin());
    dto.setAvailable(!isUnavailable);
    dto.setId(member.getId());
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

  /**
   * Promote a member to administrator.
   *
   * @param memberId the ID of the member to promote
   * @throws RuntimeException if the member does not exist or is already admin
   */
  public void promoteToAdmin(Long memberId) {
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new RuntimeException("Member not found"));

    if (member.getIsAdmin()) {
      throw new RuntimeException("Member is already an administrator");
    }

    member.setIsAdmin(true);
    memberRepository.save(member);
  }

  /**
   * Demote an administrator to regular member.
   *
   * @param memberId the ID of the member to demote
   * @throws RuntimeException if the member does not exist, is not admin, or is the last admin
   */
  public void demoteFromAdmin(Long memberId) {
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new RuntimeException("Member not found"));

    if (!member.getIsAdmin()) {
      throw new RuntimeException("Member is not an administrator");
    }

    long adminCount = memberRepository.countByIsAdminTrue();
    if (adminCount <= 1) {
      throw new RuntimeException("Cannot remove the last administrator");
    }

    member.setIsAdmin(false);
    memberRepository.save(member);
  }

  /**
   * All the admins.
   *
   * @return A list of admin
   */
  @Transactional
  public List<Member> getAllAdmins() {
    return memberRepository.findByIsAdminTrue();
  }

  @Transactional
  public List<MemberProfileResponseDto> getAllMembers() {
    return memberRepository.findAll().stream()
        .map(m -> getProfile(m.getEmail()))
        .toList();
  }
}