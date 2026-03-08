package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDTO;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDTO;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import org.springframework.stereotype.Service;

/**
 * Service handling member-related business logic.
 */
@Service
public class MemberService {

  private final MemberRepository memberRepository;
  private final SpecialityRepository specialityRepository;
  private final ImageRepository imageRepository;

  /**
   * Constructor for MemberService.
   */
  public MemberService(ImageRepository imageRepository, MemberRepository memberRepository,
      SpecialityRepository specialityRepository) {
    this.imageRepository = imageRepository;
    this.memberRepository = memberRepository;
    this.specialityRepository = specialityRepository;
  }

  /**
   * Retrieves the profile of a member by email.
   *
   * @param email the member's email
   * @return the profile DTO or null if not found
   */
  public MemberProfileResponseDTO getProfile(String email) {
    Member member = memberRepository.findByEmail(email).orElse(null);

    if (member == null) {
      return null;
    }

    MemberProfileResponseDTO dto = new MemberProfileResponseDTO();
    dto.setEmail(member.getEmail());
    dto.setTag(member.getTag());
    dto.setSpeciality(member.getSpeciality().getName());
    dto.setProfileImage(member.getImage().getUrl());
    dto.setCreationDate(member.getProfileCreationDateTime().toLocalDate());
    // TODO: Add member's team
    // dto.setTeamName(member.getTeam() != null ? member.getTeam().getName() : "No team");

    return dto;
  }

  /**
   * Updates a member's profile information.
   *
   * @param email   the member's email
   * @param payload the data to update
   * @return the updated profile DTO or null if member not found
   */
  public MemberProfileResponseDTO updateProfile(String email, UpdateMemberProfileDTO payload) {
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
}