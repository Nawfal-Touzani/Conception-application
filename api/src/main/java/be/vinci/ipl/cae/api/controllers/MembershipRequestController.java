package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for managing membership requests.
 */
@RestController
@RequestMapping("/teams")
public class MembershipRequestController extends BaseController {

  private final MembershipRequestService membershipRequestService;

  /**
   * Creates a new MembershipRequestController.
   */
  public MembershipRequestController(
      MembershipRequestService membershipRequestService,
      MemberRepository memberRepository) {
    super(memberRepository);
    this.membershipRequestService = membershipRequestService;
  }

  /**
   * Creates a membership request for the connected member to join a team.
   */
  @PostMapping("/{teamId}/membership-requests")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.CREATED)

  public MembershipRequest createRequest(@PathVariable long teamId) {
    MembershipRequest result = membershipRequestService.createRequest(
        getConnectedMember().getId(), teamId);

    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return result;
  }
}
