package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.PublicMemberDto;
import be.vinci.ipl.cae.api.services.MemberService;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller handling public member endpoints.
 */
@RestController
@RequestMapping("/members")
public class PublicController {

  private final MemberService memberService;

  /**
   * Creates a PublicController.
   *
   * @param memberService service used to retrieve member data
   */
  public PublicController(MemberService memberService) {
    this.memberService = memberService;
  }

  /**
   * Retrieves the public profile of a member by their ID.
   *
   * @param id the ID of the member
   * @return the public profile of the member
   * @throws ResponseStatusException NOT_FOUND if the member does not exist
   */
  @GetMapping("/{id}")
  public PublicMemberDto getMemberPublicProfile(@PathVariable Long id) {
    try {
      return memberService.getPublicProfile(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }
}
