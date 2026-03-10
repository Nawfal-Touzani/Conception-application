package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.RefuseRequestDto;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The type Membership request controller.
 */
@RestController
@RequestMapping("/membership-requests")
@PreAuthorize("isAuthenticated()")
public class MembershipRequestController extends BaseController {

  private final MembershipRequestService membershipRequestService;

  /**
   * Instantiates a new Membership request controller.
   *
   * @param membershipRequestService the membership request service
   * @param memberRepository         the member repository
   */
  public MembershipRequestController(MembershipRequestService membershipRequestService,
      MemberRepository memberRepository) {
    super(memberRepository);
    this.membershipRequestService = membershipRequestService;
  }

  /**
   * Approve request response entity.
   *
   * @param requestId the request id
   * @return the response entity
   */
  @PatchMapping("/{requestId}/approve")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> approveRequest(@PathVariable Long requestId) {
    membershipRequestService.approveRequest(requestId, getConnectedMember().getId());
    return ResponseEntity.noContent().build();
  }

  /**
   * Refuse request response entity.
   *
   * @param requestId the request id
   * @param body      the body
   * @return the response entity
   */
  @PatchMapping("/{requestId}/refuse")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> refuseRequest(@PathVariable Long requestId,
      @RequestBody RefuseRequestDto body) {
    membershipRequestService.refuseRequest(requestId, getConnectedMember().getId(),
        body.getReason());
    return ResponseEntity.noContent().build();
  }

}

