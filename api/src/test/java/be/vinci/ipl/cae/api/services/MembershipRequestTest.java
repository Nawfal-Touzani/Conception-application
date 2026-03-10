package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MembershipRequestServiceTest {

  Member responsible;
  Member member;
  Team team;
  MembershipRequest request;

  @Mock
  private MembershipRequestRepository membershipRequestRepository;
  @Mock
  private MemberRepository memberRepository;
  @Mock
  private TeamRepository teamRepository;
  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private MembershipRequestService membershipRequestService;

  @BeforeEach
  void setUp() {
    responsible = new Member("responsible@test.com", "password", "responsible", false, null, null);
    responsible.setId(1L);

    member = new Member("member@test.com", "password", "member", false, null, null);
    member.setId(2L);

    team = new Team("TeamTest", true, LocalDateTime.now(), responsible, null);
    team.setId(1L);

    request = new MembershipRequest(State.PENDING, null, null);
    request.setMember(member);
    request.setTeam(team);
  }

  @Test
  void createRequest() {
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));
    when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
    when(membershipRequestRepository.save(any(MembershipRequest.class))).thenReturn(request);

    MembershipRequest result = membershipRequestService.createRequest(
        member.getId(), team.getId());

    assertEquals(request, result);
    verify(notificationService).send(eq(responsible.getId()), any(Notification.class));
  }

  @Test
  void createRequestWhenMemberNotFound() {
    long unknownId = 99L;
    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    MembershipRequest result = membershipRequestService.createRequest(unknownId, team.getId());

    assertNull(result);
    verify(membershipRequestRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  @Test
  void createRequestWhenTeamNotFound() {
    long unknownId = 99L;
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));
    when(teamRepository.findById(unknownId)).thenReturn(Optional.empty());

    MembershipRequest result = membershipRequestService.createRequest(
        member.getId(), unknownId);

    assertNull(result);
    verify(membershipRequestRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }
}