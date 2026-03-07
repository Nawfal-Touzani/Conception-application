package be.vinci.ipl.cae.API.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Membership request service test.
 */
@ExtendWith(MockitoExtension.class)
class MembershipRequestServiceTest {

  @Mock
  private MembershipRequestRepository membershipRequestRepository;

  @Mock
  private TeamCompositionRepository teamCompositionRepository;

  @InjectMocks
  private MembershipRequestService membershipRequestService;

  private Member responsible;
  private Member applicant;
  private Team team;
  private MembershipRequest pendingRequest;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    responsible = new Member();
    responsible.setId(1L);

    applicant = new Member();
    applicant.setId(2L);

    team = new Team();
    team.setId(10L);
    team.setResponsible(responsible);

    pendingRequest = new MembershipRequest();
    pendingRequest.setIdRequest(100L);
    pendingRequest.setState(State.PENDING);
    pendingRequest.setMember(applicant);
    pendingRequest.setTeam(team);
  }

  /**
   * Approve request should work when responsible and request is pending.
   */
  @Test
  void approveRequest_shouldWork_whenResponsibleAndRequestIsPending() {
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

    membershipRequestService.approveRequest(100L, 1L);

    verify(membershipRequestRepository, times(1)).save(any(MembershipRequest.class));
    verify(teamCompositionRepository, times(1)).save(any(TeamComposition.class));
  }

  /**
   * Approve request should fail when request not found.
   */
  @Test
  void approveRequest_shouldFail_whenRequestNotFound() {
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.empty());

    assertThrows(ResponseStatusException.class,
        () -> membershipRequestService.approveRequest(100L, 1L));

    verify(membershipRequestRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Approve request should fail when member is not responsible.
   */
  @Test
  void approveRequest_shouldFail_whenMemberIsNotResponsible() {
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

    assertThrows(ResponseStatusException.class,
        () -> membershipRequestService.approveRequest(100L, 99L));

    verify(membershipRequestRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Approve request should fail when request is not pending.
   */
  @Test
  void approveRequest_shouldFail_whenRequestIsNotPending() {
    pendingRequest.setState(State.ACCEPTED);
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

    assertThrows(ResponseStatusException.class,
        () -> membershipRequestService.approveRequest(100L, 1L));

    verify(membershipRequestRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Refuse request should work when responsible and request is pending.
   */
  @Test
  void refuseRequest_shouldWork_whenResponsibleAndRequestIsPending() {
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

    membershipRequestService.refuseRequest(100L, 1L, "Not a good fit");

    verify(membershipRequestRepository, times(1)).save(any(MembershipRequest.class));
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Refuse request should fail when request not found.
   */
  @Test
  void refuseRequest_shouldFail_whenRequestNotFound() {
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.empty());

    assertThrows(ResponseStatusException.class,
        () -> membershipRequestService.refuseRequest(100L, 1L, "reason"));

    verify(membershipRequestRepository, never()).save(any());
  }

  /**
   * Refuse request should fail when member is not responsible.
   */
  @Test
  void refuseRequest_shouldFail_whenMemberIsNotResponsible() {
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

    assertThrows(ResponseStatusException.class,
        () -> membershipRequestService.refuseRequest(100L, 99L, "reason"));

    verify(membershipRequestRepository, never()).save(any());
  }

  /**
   * Refuse request should fail when request is not pending.
   */
  @Test
  void refuseRequest_shouldFail_whenRequestIsNotPending() {
    pendingRequest.setState(State.REFUSED);
    when(membershipRequestRepository.findById(100L)).thenReturn(Optional.of(pendingRequest));

    assertThrows(ResponseStatusException.class,
        () -> membershipRequestService.refuseRequest(100L, 1L, "reason"));

    verify(membershipRequestRepository, never()).save(any());
  }
}