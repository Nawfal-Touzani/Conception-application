package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.ChangePasswordDto;
import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.UnavailabilityDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.services.MemberService;
import be.vinci.ipl.cae.api.services.UnavailabilityService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller handling member profile requests.
 */
@RestController
@RequestMapping("/members")
@PreAuthorize("isAuthenticated()")
public class MemberController {

  private final MemberService memberService;
  private final UnavailabilityService unavailabilityService;

  /**
   * Constructor for MemberController.
   */
  public MemberController(MemberService memberService,
      UnavailabilityService unavailabilityService) {
    this.memberService = memberService;
    this.unavailabilityService = unavailabilityService;
  }

  /**
   * Return the profile of the currently authenticated member.
   *
   * @param authentication the Spring Security authentication object
   * @return the member profile DTO
   */
  @GetMapping("/me")
  public MemberProfileResponseDto getMyProfile(Authentication authentication) {
    Member principalMember = (Member) authentication.getPrincipal();
    String email = principalMember.getEmail();
    MemberProfileResponseDto profile = memberService.getProfile(email);

    if (profile == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found");
    }

    return profile;
  }

  /**
   * Updates the profile of the currently authenticated member.
   *
   * @param authentication the Spring Security authentication object
   * @param payload        the updated profile data
   * @return the updated member profile DTO
   */
  @PatchMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public MemberProfileResponseDto updateMyProfile(Authentication authentication,
      @Valid @RequestBody UpdateMemberProfileDto payload) {

    Member principalMember = (Member) authentication.getPrincipal();
    String email = principalMember.getEmail();
    MemberProfileResponseDto updatedProfile = memberService.updateProfile(email, payload);

    if (updatedProfile == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found");
    }

    return updatedProfile;
  }

  /**
   * Updates the password of the currently authenticated member.
   *
   * @param authentication the Spring Security authentication object
   * @param dto            the DTO containing the old and new password
   * @throws ResponseStatusException 400 if the old password is incorrect or 404 if member not
   *                                 found
   */
  @PatchMapping("/password")
  @PreAuthorize("isAuthenticated()")
  public void changePassword(Authentication authentication,
      @Valid @RequestBody ChangePasswordDto dto) {

    Member principalMember = (Member) authentication.getPrincipal();
    boolean success = memberService.changePassword(principalMember.getEmail(), dto);

    if (!success) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid old password");
    }
  }

  /**
   * Adds a new unavailability period for the authenticated member.
   *
   * @param authentication the Spring Security authentication object
   * @param dto            the unavailability data containing start and end date
   */
  @PostMapping("/me/unavailabilities")
  @PreAuthorize("isAuthenticated()")
  public void addAvailability(Authentication authentication,
      @Valid @RequestBody UnavailabilityDto dto) {
    Member principal = (Member) authentication.getPrincipal();
    unavailabilityService.addUnavailability(principal.getEmail(), dto);
  }


  /**
   * Return all unavailabilities of the authenticated member.
   *
   * @param authentication the Spring Security authentication object
   * @return a list of the member's unavailabilities
   */
  @GetMapping("/me/unavailabilities")
  public Iterable<UnavailabilityDto> getMyUnavailabilities(Authentication authentication) {
    Member principal = (Member) authentication.getPrincipal();
    return unavailabilityService.getMyUnavailabilities(principal.getEmail());
  }

  /**
   * Promote a member to administrator. Only admins can perform this action.
   *
   * @param memberId the ID of the member to promote
   */
  @PutMapping("/admins/{memberId}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public void promoteToAdmin(@PathVariable Long memberId) {
    try {
      memberService.promoteToAdmin(memberId);
    } catch (RuntimeException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Demote an administrator. Only admins can perform this action.
   *
   * @param memberId the ID of the member to demote
   */
  @DeleteMapping("/admins/{memberId}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public void demoteFromAdmin(@PathVariable Long memberId) {
    try {
      memberService.demoteFromAdmin(memberId);
    } catch (RuntimeException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Get All admins.
   *
   * @return all admins
   */
  @GetMapping("/admins")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public List<MemberProfileResponseDto> getAllAdmins() {
    return memberService.getAllAdmins().stream()
        .map(m -> memberService.getProfile(m.getEmail()))
        .toList();
  }

  /**
   * Get all members (admin only).
   */
  @GetMapping
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public List<MemberProfileResponseDto> getAllMembers() {
    return memberService.getAllMembers();
  }
}
