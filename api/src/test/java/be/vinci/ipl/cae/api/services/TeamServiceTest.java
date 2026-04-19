package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.stream.StreamSupport;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.dtos.TeamMemberDto;
import be.vinci.ipl.cae.api.models.dtos.TeamResponseDto;
import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.models.entities.Unavailability;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The type Team service test.
 */
@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

  @Mock private TeamRepository teamRepository;
  @Mock private TeamCompositionRepository teamCompositionRepository;
  @Mock private NotificationService notificationService;
  @Mock private MemberRepository memberRepository;
  @Mock private MembershipRequestRepository membershipRequestRepository;

  @InjectMocks
  private TeamService teamService;

  private Member member;
  private Image image;
  private Team team;
  private TeamComposition composition;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    image = new Image("/images/avatar1.png");
    image.setId(1L);

    member = new Member();
    member.setId(1L);
    member.setEmail("test@vinci.be");
    member.setTag("TestTag");
    member.setImage(image);
    member.setUnavailabilities(List.of());

    team = new Team();
    team.setId(10L);
    team.setName("TestTeam");
    team.setActive(true);
    team.setCreationDate(LocalDateTime.now());
    team.setResponsible(member);

    composition = new TeamComposition();
    composition.setTeam(team);
    composition.setMember(member);
  }

  // ─── createTeam ───────────────────────────────────────────────

  /**
   * Create team should work when member has no team and name is unique.
   */
  @Test
  void createTeam_shouldWork_whenMemberHasNoTeamAndNameIsUnique() {
    CreateTeamRequest request = new CreateTeamRequest("TestTeam");
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(false);
    when(teamRepository.existsByName("TestTeam")).thenReturn(false);
    when(teamRepository.save(any(Team.class))).thenReturn(team);

    TeamResponseDto result = teamService.createTeam(1L, request);

    assertNotNull(result);
    assertEquals("TestTeam", result.getName());
    verify(teamRepository, times(1)).save(any(Team.class));
    verify(teamCompositionRepository, times(1)).save(any(TeamComposition.class));
  }

  /**
   * Create team should fail when request is invalid.
   */
  @Test
  void createTeam_shouldFail_whenRequestIsInvalid() {
    CreateTeamRequest invalidRequest = new CreateTeamRequest("");
    assertThrows(IllegalArgumentException.class, () -> teamService.createTeam(1L, invalidRequest));
    verify(teamRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Create team should fail when member already in team.
   */
  @Test
  void createTeam_shouldFail_whenMemberAlreadyInTeam() {
    CreateTeamRequest request = new CreateTeamRequest("TestTeam");
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(true);
    assertThrows(IllegalStateException.class, () -> teamService.createTeam(1L, request));
    verify(teamRepository, never()).save(any());
  }

  /**
   * Create team should fail when team name already exists.
   */
  @Test
  void createTeam_shouldFail_whenTeamNameAlreadyExists() {
    CreateTeamRequest request = new CreateTeamRequest("TestTeam");
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(false);
    when(teamRepository.existsByName("TestTeam")).thenReturn(true);
    assertThrows(IllegalStateException.class, () -> teamService.createTeam(1L, request));
    verify(teamRepository, never()).save(any());
  }

  /**
   * Create team should fail when member not found.
   */
  @Test
  void createTeam_shouldFail_whenMemberNotFound() {
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(false);
    when(teamRepository.existsByName("TestTeam")).thenReturn(false);
    when(memberRepository.findById(1L)).thenReturn(Optional.empty());
    CreateTeamRequest request = new CreateTeamRequest("TestTeam");
    assertThrows(IllegalArgumentException.class, () -> teamService.createTeam(1L, request));
    verify(teamRepository, never()).save(any());
  }

  // ─── createRequest ────────────────────────────────────────────

  /**
   * Create request should work when member and team exist.
   */
  @Test
  void createRequest_shouldWork_whenMemberAndTeamExist() {
    MembershipRequest membershipRequest = new MembershipRequest(
        MembershipRequest.State.PENDING, null, null);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
    when(membershipRequestRepository.save(any(MembershipRequest.class)))
        .thenReturn(membershipRequest);

    MembershipRequest result = teamService.createRequest(1L, 10L);

    assertNotNull(result);
    verify(notificationService).send(anyLong(), any(Notification.class));
  }

  /**
   * Create request should fail when member not found.
   */
  @Test
  void createRequest_shouldFail_whenMemberNotFound() {
    when(memberRepository.findById(999L)).thenReturn(Optional.empty());
    assertThrows(IllegalArgumentException.class, () -> teamService.createRequest(999L, 10L));
    verify(membershipRequestRepository, never()).save(any());
  }

  /**
   * Create request should fail when team not found.
   */
  @Test
  void createRequest_shouldFail_whenTeamNotFound() {
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
    when(teamRepository.findById(999L)).thenReturn(Optional.empty());
    assertThrows(IllegalArgumentException.class, () -> teamService.createRequest(1L, 999L));
    verify(membershipRequestRepository, never()).save(any());
  }

  // ─── getMembersOfMyTeam ───────────────────────────────────────

  /**
   * Gets members of my team should return members when member has team.
   */
  @Test
  void getMembersOfMyTeam_shouldReturnMembers_whenMemberHasTeam() {
    when(teamCompositionRepository.findByMemberId(1L)).thenReturn(Optional.of(composition));
    when(teamCompositionRepository.findAllByTeamId(10L)).thenReturn(List.of(composition));

    Iterable<TeamMemberDto> result = teamService.getMembersOfMyTeam(1L);
    List<TeamMemberDto> list = StreamSupport.stream(result.spliterator(), false).toList();

    assertNotNull(result);
    assertEquals(1, list.size());
    assertEquals("TestTag", list.get(0).gameTag());

  }

  /**
   * Gets members of my team should return unavailable member when unavailability covers today.
   */
  @Test
  void getMembersOfMyTeam_shouldReturnUnavailableMember_whenUnavailabilityCoversToday() {
    Unavailability unavailability = new Unavailability();
    unavailability.setStartDate(LocalDate.now().minusDays(1));
    unavailability.setEndDate(LocalDate.now().plusDays(1));
    member.setUnavailabilities(List.of(unavailability));

    when(teamCompositionRepository.findByMemberId(1L)).thenReturn(Optional.of(composition));
    when(teamCompositionRepository.findAllByTeamId(10L)).thenReturn(List.of(composition));

    Iterable<TeamMemberDto> result = teamService.getMembersOfMyTeam(1L);
    List<TeamMemberDto> list = StreamSupport.stream(result.spliterator(), false).toList();

    assertNotNull(result);
    assertFalse(list.get(0).isAvailable());
  }

  /**
   * Gets members of my team should fail when member has no team.
   */
  @Test
  void getMembersOfMyTeam_shouldFail_whenMemberHasNoTeam() {
    when(teamCompositionRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    assertThrows(IllegalStateException.class, () -> teamService.getMembersOfMyTeam(1L));
  }

  // ─── getTeamOfMemberAsDto ─────────────────────────────────────

  /**
   * Gets team of member as dto should return dto when member has team.
   */
  @Test
  void getTeamOfMemberAsDto_shouldReturnDto_whenMemberHasTeam() {
    when(teamCompositionRepository.findByMemberId(1L)).thenReturn(Optional.of(composition));

    TeamResponseDto result = teamService.getTeamOfMemberAsDto(1L);

    assertNotNull(result);
    assertEquals("TestTeam", result.getName());
  }

  /**
   * Gets team of member as dto should fail when member has no team.
   */
  @Test
  void getTeamOfMemberAsDto_shouldFail_whenMemberHasNoTeam() {
    when(teamCompositionRepository.findByMemberId(1L)).thenReturn(Optional.empty());
    assertThrows(IllegalStateException.class, () -> teamService.getTeamOfMemberAsDto(1L));
  }

  // ─── getAllTeamDtos ───────────────────────────────────────────

  /**
   * Gets all team dtos should return only active teams.
   */
  @Test
  void getAllTeamDtos_shouldReturnOnlyActiveTeams() {
    when(teamRepository.findByActiveTrue()).thenReturn(List.of(team));

    Iterable<TeamResponseDto> result = teamService.getAllTeamDtos();
    List<TeamResponseDto> list = StreamSupport.stream(result.spliterator(), false).toList();

    assertNotNull(result);
    assertEquals(1, list.size());
    assertEquals("TestTeam", list.get(0).getName());
  }

  // ─── leaveTeam ────────────────────────────────────────────────

  /**
   * Leave team should deactivate team when last member.
   */
  @Test
  void leaveTeam_shouldDeactivateTeam_whenLastMember() {
    when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findFirstByMemberId(1L)).thenReturn(Optional.of(composition));
    when(teamCompositionRepository.findAllByTeamId(10L)).thenReturn(List.of(composition));

    teamService.leaveTeam("test@vinci.be");

    assertFalse(team.isActive());
    assertNull(team.getResponsible());
    assertNull(team.getSecondResponsible());
    verify(teamCompositionRepository).delete(composition);
    verify(teamRepository, never()).delete(any(Team.class));
  }

  /**
   * Leave team should remove member when not responsible.
   */
  @Test
  void leaveTeam_shouldRemoveMember_whenNotResponsible() {
    Member other = new Member();
    other.setId(2L);
    other.setEmail("other@vinci.be");
    other.setTag("Other");
    other.setImage(image);
    other.setUnavailabilities(List.of());

    TeamComposition otherCompo = new TeamComposition();
    otherCompo.setTeam(team);
    otherCompo.setMember(other);

    when(memberRepository.findByEmail("other@vinci.be")).thenReturn(Optional.of(other));
    when(teamCompositionRepository.findFirstByMemberId(2L)).thenReturn(Optional.of(otherCompo));
    when(teamCompositionRepository.findAllByTeamId(10L))
        .thenReturn(List.of(composition, otherCompo));

    teamService.leaveTeam("other@vinci.be");

    verify(teamCompositionRepository).delete(otherCompo);
    verify(teamRepository, never()).delete(any(Team.class));
  }

  /**
   * Leave team should promote second responsible when responsible leaves.
   */
  @Test
  void leaveTeam_shouldPromoteSecondResponsible_whenResponsibleLeaves() {
    Member second = new Member();
    second.setId(3L);
    second.setTag("Second");
    second.setImage(image);
    second.setUnavailabilities(List.of());
    team.setSecondResponsible(second);

    TeamComposition secondCompo = new TeamComposition();
    secondCompo.setTeam(team);
    secondCompo.setMember(second);

    when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findFirstByMemberId(1L)).thenReturn(Optional.of(composition));
    when(teamCompositionRepository.findAllByTeamId(10L))
        .thenReturn(List.of(composition, secondCompo));

    teamService.leaveTeam("test@vinci.be");

    verify(teamCompositionRepository).delete(composition);
    assertEquals(second, team.getResponsible());
    assertNull(team.getSecondResponsible());
  }

  /**
   * Leave team should throw conflict when responsible has no second.
   */
  @Test
  void leaveTeam_shouldThrowConflict_whenResponsibleHasNoSecond() {
    Member other = new Member();
    other.setId(2L);
    other.setImage(image);
    other.setUnavailabilities(List.of());
    TeamComposition otherCompo = new TeamComposition();
    otherCompo.setTeam(team);
    otherCompo.setMember(other);

    when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findFirstByMemberId(1L)).thenReturn(Optional.of(composition));
    when(teamCompositionRepository.findAllByTeamId(10L))
        .thenReturn(List.of(composition, otherCompo));

    assertThrows(IllegalStateException.class, () -> teamService.leaveTeam("test@vinci.be"));
  }

  /**
   * Leave team should clear second responsible when second responsible leaves.
   */
  @Test
  void leaveTeam_shouldClearSecondResponsible_whenSecondResponsibleLeaves() {
    Member second = new Member();
    second.setId(3L);
    second.setEmail("second@vinci.be");
    second.setTag("Second");
    second.setImage(image);
    second.setUnavailabilities(List.of());
    team.setSecondResponsible(second);

    TeamComposition secondCompo = new TeamComposition();
    secondCompo.setTeam(team);
    secondCompo.setMember(second);

    when(memberRepository.findByEmail("second@vinci.be")).thenReturn(Optional.of(second));
    when(teamCompositionRepository.findFirstByMemberId(3L)).thenReturn(Optional.of(secondCompo));
    when(teamCompositionRepository.findAllByTeamId(10L))
        .thenReturn(List.of(composition, secondCompo));

    teamService.leaveTeam("second@vinci.be");

    assertNull(team.getSecondResponsible());
  }

  /**
   * Leave team should fail when member not found.
   */
  @Test
  void leaveTeam_shouldFail_whenMemberNotFound() {
    when(memberRepository.findByEmail("unknown@vinci.be")).thenReturn(Optional.empty());
    assertThrows(IllegalArgumentException.class, () -> teamService.leaveTeam("unknown@vinci.be"));
  }

  /**
   * Leave team should fail when member has no team.
   */
  @Test
  void leaveTeam_shouldFail_whenMemberHasNoTeam() {
    when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findFirstByMemberId(1L)).thenReturn(Optional.empty());
    assertThrows(IllegalStateException.class, () -> teamService.leaveTeam("test@vinci.be"));
  }
}