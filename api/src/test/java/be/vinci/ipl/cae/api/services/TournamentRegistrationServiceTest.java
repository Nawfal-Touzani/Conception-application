package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.models.entities.TournamentRegistration;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The type Tournament registration service test.
 */
@ExtendWith(MockitoExtension.class)
class TournamentRegistrationServiceTest {

  @Mock
  private TournamentRegistrationRepository tournamentRegistrationRepository;
  @Mock
  private TournamentRepository tournamentRepository;
  @Mock
  private TeamRepository teamRepository;
  @Mock
  private TeamCompositionRepository teamCompositionRepository;

  @InjectMocks
  private TournamentRegistrationService tournamentRegistrationService;

  /**
   * The Responsible.
   */
  Member responsible;
  /**
   * The Second responsible.
   */
  Member secondResponsible;
  /**
   * The Other member.
   */
  Member otherMember;
  /**
   * The Team.
   */
  Team team;
  /**
   * The Tournament.
   */
  Tournament tournament;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    responsible = new Member();
    responsible.setId(1L);

    secondResponsible = new Member();
    secondResponsible.setId(2L);

    otherMember = new Member();
    otherMember.setId(3L);

    team = new Team();
    team.setId(1L);
    team.setResponsible(responsible);
    team.setSecondResponsible(secondResponsible);

    tournament = new Tournament();
    tournament.setId(1L);
    tournament.setStatus(Status.PREPARATION);
    tournament.setRegistrationDeadline(LocalDate.now().plusDays(5));
    tournament.setMaxParticipants(8);

    tournament.setPublic(true);
  }

  /**
   * Create registration success.
   */
  @Test
  void createRegistrationSuccess() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRegistrationRepository.existsByTeamIdAndTournamentId(1L, 1L)).thenReturn(false);
    when(tournamentRegistrationRepository.countByTournamentId(1L)).thenReturn(3);
    when(teamCompositionRepository.countByTeamId(1L)).thenReturn(4);
    when(tournamentRegistrationRepository.save(any(TournamentRegistration.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    TournamentRegistration result = tournamentRegistrationService.createRegistration(1L, 1L, 1L);

    assertEquals(team, result.getTeam());
    assertEquals(tournament, result.getTournament());
  }

  /**
   * Create registration tournament not found.
   */
  @Test
  void createRegistrationTournamentNotFound() {
    when(tournamentRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> tournamentRegistrationService.createRegistration(99L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration team not found.
   */
  @Test
  void createRegistrationTeamNotFound() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 99L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration tournament not in preparation.
   */
  @Test
  void createRegistrationTournamentNotInPreparation() {
    tournament.setStatus(Status.IN_PROGRESS);
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));

    assertThrows(IllegalArgumentException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration deadline passed.
   */
  @Test
  void createRegistrationDeadlinePassed() {
    tournament.setRegistrationDeadline(LocalDate.now().minusDays(1));
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));

    assertThrows(IllegalStateException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration team already registered.
   */
  @Test
  void createRegistrationTeamAlreadyRegistered() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRegistrationRepository.existsByTeamIdAndTournamentId(1L, 1L)).thenReturn(true);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration tournament full.
   */
  @Test
  void createRegistrationTournamentFull() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRegistrationRepository.existsByTeamIdAndTournamentId(1L, 1L)).thenReturn(false);
    when(tournamentRegistrationRepository.countByTournamentId(1L)).thenReturn(8);

    assertThrows(IllegalStateException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration tournament not public.
   */
  @Test
  void createRegistrationTournamentNotPublic() {
    tournament.setPublic(false);
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));

    assertThrows(IllegalArgumentException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration team not enough members.
   */
  @Test
  void createRegistrationTeamNotEnoughMembers() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRegistrationRepository.existsByTeamIdAndTournamentId(1L, 1L)).thenReturn(false);
    when(tournamentRegistrationRepository.countByTournamentId(1L)).thenReturn(3);
    when(teamCompositionRepository.countByTeamId(1L)).thenReturn(3);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 1L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration not responsible.
   */
  @Test
  void createRegistrationNotResponsible() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRegistrationRepository.existsByTeamIdAndTournamentId(1L, 1L)).thenReturn(false);
    when(tournamentRegistrationRepository.countByTournamentId(1L)).thenReturn(3);
    when(teamCompositionRepository.countByTeamId(1L)).thenReturn(4);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentRegistrationService.createRegistration(1L, 1L, 3L));

    verify(tournamentRegistrationRepository, never()).save(any());
  }

  /**
   * Create registration success with second responsible.
   */
  @Test
  void createRegistrationSuccessWithSecondResponsible() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRegistrationRepository.existsByTeamIdAndTournamentId(1L, 1L)).thenReturn(false);
    when(tournamentRegistrationRepository.countByTournamentId(1L)).thenReturn(3);
    when(teamCompositionRepository.countByTeamId(1L)).thenReturn(4);
    when(tournamentRegistrationRepository.save(any(TournamentRegistration.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    TournamentRegistration result = tournamentRegistrationService.createRegistration(1L, 1L, 2L);

    assertEquals(team, result.getTeam());
    assertEquals(tournament, result.getTournament());
  }


}