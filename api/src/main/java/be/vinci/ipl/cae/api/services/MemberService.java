package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ChangePasswordDto;
import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.PublicMemberDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.models.entities.Banishment;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.BanishmentRepository;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
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
  private final TeamCompositionRepository teamCompositionRepository;
  private final UnavailabilityRepository unavailabilityRepository;
  private final BanishmentRepository banishmentRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  /**
   * Constructor for MemberService.
   *
   * @param imageRepository           the image repository
   * @param memberRepository          the member repository
   * @param passwordEncoder           the password encoder
   * @param specialityRepository      the speciality repository
   * @param teamCompositionRepository the team composition repository
   * @param unavailabilityRepository  the unavailability repository
   */
  public MemberService(ImageRepository imageRepository, MemberRepository memberRepository,
      BCryptPasswordEncoder passwordEncoder, SpecialityRepository specialityRepository,
      TeamCompositionRepository teamCompositionRepository,
      UnavailabilityRepository unavailabilityRepository,
      BanishmentRepository banishmentRepository) {
    this.imageRepository = imageRepository;
    this.memberRepository = memberRepository;
    this.passwordEncoder = passwordEncoder;
    this.specialityRepository = specialityRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.banishmentRepository = banishmentRepository;
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

    return mapToProfileDto(member);
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

    performProfileUpdates(member, payload);
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
    if (isInvalidPasswordRequest(dto)) {
      return false;
    }

    Member member = memberRepository.findByEmail(email).orElse(null);

    if (member == null || !passwordEncoder.matches(dto.oldPassword(), member.getPassword())) {
      return false;
    }

    member.setPassword(passwordEncoder.encode(dto.newPassword()));
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

  /**
   * Gets all members.
   *
   * @return the all members
   */
  @Transactional
  public List<MemberProfileResponseDto> getAllMembers() {
    return memberRepository.findAll().stream().map(m -> getProfile(m.getEmail())).toList();
  }

  /**
   * Gets all member profiles in a single query (admin only).
   *
   * @return list of all member profiles
   */
  public List<MemberProfileResponseDto> getAllMemberProfiles() {
    return memberRepository.findAll().stream().map(this::mapToProfileDto).toList();
  }

  /**
   * Gets all admin profiles in a single query (admin only).
   *
   * @return list of admin profiles
   */
  public List<MemberProfileResponseDto> getAllAdminProfiles() {
    return memberRepository.findByIsAdminTrue().stream().map(this::mapToProfileDto).toList();
  }

  /**
   * Retrieves the public profile of a member by their ID.
   *
   * @param id the ID of the member
   * @return the public profile of the member
   * @throws NoSuchElementException if the member is not found
   */
  public PublicMemberDto getPublicProfile(Long id) {
    Member member = memberRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Membre introuvable"));

    return mapToPublicProfileDto(member);
  }

  private MemberProfileResponseDto mapToProfileDto(Member member) {
    Banishment ban = banishmentRepository.findByBannedMemberId(member.getId()).orElse(null);

    return new MemberProfileResponseDto(member.getId(), member.getEmail(), member.getTag(),
        member.getSpeciality().getName(), getMemberTeamName(member.getId()),
        member.getImage().getUrl(), member.getProfileCreationDate(), member.getIsAdmin(),
        isMemberAvailable(member), member.isBan(), ban != null ? ban.getReason() : null,
        ban != null ? ban.getBanishmentDate() : null);
  }

  private String getMemberTeamName(Long memberId) {
    return teamCompositionRepository.findByMemberId(memberId)
        .map(compo -> compo.getTeam().getName()).orElse(null);
  }

  private boolean isMemberAvailable(Member member) {
    LocalDate today = LocalDate.now();
    boolean isUnavailable = unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(
        member, today.plusDays(1), today.minusDays(1));
    return !isUnavailable;
  }

  private void performProfileUpdates(Member member, UpdateMemberProfileDto payload) {
    if (payload.speciality() != null) {
      specialityRepository.findByName(payload.speciality()).ifPresent(member::setSpeciality);
    }

    if (payload.profileImage() != null) {
      imageRepository.findByUrl(payload.profileImage()).ifPresent(member::setImage);
    }
  }

  private boolean isInvalidPasswordRequest(ChangePasswordDto dto) {
    return dto == null || dto.newPassword() == null || dto.newPassword().equals(dto.oldPassword())
        || !dto.newPassword().equals(dto.confirmPassword());
  }

  private PublicMemberDto mapToPublicProfileDto(Member member) {
    String image = member.getImage().getUrl();
    String speciality = member.getSpeciality().getName();
    String teamName = getMemberTeamName(member.getId());

    return new PublicMemberDto(member.getId(), member.getTag(), image, speciality, teamName,
        member.getProfileCreationDate());
  }

  /**
   * Retrieves a member by their email address.
   *
   * @param email the member's email
   * @return the member
   * @throws NoSuchElementException if not found
   */
  public Member getByEmail(String email) {
    return memberRepository.findByEmail(email)
        .orElseThrow(() -> new NoSuchElementException("Member not found with email " + email));
  }
}
