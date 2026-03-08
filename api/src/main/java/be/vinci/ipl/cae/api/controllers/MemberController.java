package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.services.MemberService;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller handling member profile requests.
 */
@RestController
@RequestMapping("/members")
public class MemberController {

  private final MemberService memberService;

  /**
   * Constructor for MemberController.
   */
  public MemberController(MemberService memberService) {
    this.memberService = memberService;
  }

  /**
   * Return the profile of the currently authenticated member.
   *
   * @param authentication the Spring Security authentication object
   * @return the member profile DTO
   */
  @GetMapping("/me")
  public MemberProfileResponseDto getMyProfile(Authentication authentication) {
    String email = authentication.getUsername();
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
  public MemberProfileResponseDto updateMyProfile(Authentication authentication,
      @Valid @RequestBody UpdateMemberProfileDto payload) {

    String email = authentication.getUsername();
    MemberProfileResponseDto updatedProfile = memberService.getProfile(email);

    if (updatedProfile == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found");
    }

    return updatedProfile;
  }

}
