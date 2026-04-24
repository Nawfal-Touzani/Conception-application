package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.RefuseRequestDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
public class MembershipRequestController {

  private final MembershipRequestService membershipRequestService;

  /**
   * Instantiates a new Membership request controller.
   *
   * @param membershipRequestService the membership request service
   */
  public MembershipRequestController(MembershipRequestService membershipRequestService) {
    this.membershipRequestService = membershipRequestService;
  }

  /**
   * Approve request response entity.
   *
   * @param requestId     the request id
   * @param currentMember the current member
   * @return the response entity
   */
  @PatchMapping("/{requestId}/approve")
  public ResponseEntity<Void> approveRequest(@PathVariable Long requestId,
      @AuthenticationPrincipal Member currentMember) {
    membershipRequestService.approveRequest(requestId, currentMember.getId());
    return ResponseEntity.noContent().build();
  }

  /**
   * Refuse request response entity.
   *
   * @param requestId     the request id
   * @param body          the body
   * @param currentMember the current member
   * @return the response entity
   */
  @PatchMapping("/{requestId}/refuse")
  public ResponseEntity<Void> refuseRequest(@PathVariable Long requestId,
      @RequestBody RefuseRequestDto body,
      @AuthenticationPrincipal Member currentMember) {
    membershipRequestService.refuseRequest(requestId, currentMember.getId(), body.getReason());
    return ResponseEntity.noContent().build();
  }
}
