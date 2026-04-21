package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.HomepageTournamentsDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

  Member organizer;
  TournamentDto validDto;
  Tournament savedTournament;
  @Mock
  TournamentResponseDto savedTournamentResponse;
  @Mock
  private MemberRepository memberRepository;
  @Mock
  private TournamentRepository tournamentRepository;
  @Mock
  private TournamentRegistrationRepository registrationRepository;
  @Mock
  private NotificationService notificationService;
  @InjectMocks
  private TournamentService tournamentService;

  @BeforeEach
  void setUp() {
    organizer = new Member();
    organizer.setId(1L);
    organizer.setEmail("admin@vinci.be");
    organizer.setTag("Admin");
    organizer.setIsAdmin(true);

    LocalDate now = LocalDate.now();

    validDto = new TournamentDto("Tournoi Test", "Description test", now.plusDays(5),
        now.plusDays(10), now.plusDays(3), 8);

    savedTournament = new Tournament();
    savedTournament.setId(1L);
    savedTournament.setName("Tournoi Test");
    savedTournament.setDescription("Description test");
    savedTournament.setStartDate(now.plusDays(5));
    savedTournament.setEndDate(now.plusDays(10));
    savedTournament.setRegistrationDeadline(now.plusDays(3));
    savedTournament.setMaxParticipants(8);
    savedTournament.setStatus(Status.PREPARATION);
    savedTournament.setOrganizer(organizer);
  }

  // ── createTournament ──

  @Test
  void createTournamentSuccess() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));
    when(tournamentRepository.save(Mockito.any(Tournament.class))).thenAnswer(invocation -> {
      Tournament t = invocation.getArgument(0);
      t.setId(1L);
      return t;
    });
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    TournamentResponseDto result = tournamentService.createTournament(organizer.getId(), validDto);

    assertEquals("Tournoi Test", result.name());
    assertEquals(Status.PREPARATION, result.status());
  }

  @Test
  void createTournamentOrganizerNotFound() {
    long unknownId = 99L;
    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> tournamentService.createTournament(unknownId, validDto));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentStartDateAfterEndDate() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.plusDays(10), now.plusDays(5),
        now.plusDays(3), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentStartDateInPast() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.minusDays(3), now.plusDays(5),
        now.minusDays(5), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentRegistrationDeadlineAfterStartDate() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.plusDays(3), now.plusDays(10),
        now.plusDays(5), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentRegistrationDeadlineInPast() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.plusDays(5), now.plusDays(10),
        now.minusDays(1), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentMaxParticipantsPowerOfTwo() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    Tournament savedMock = new Tournament();
    savedMock.setId(1L);
    savedMock.setName("Test");
    savedMock.setDescription("desc");
    savedMock.setMaxParticipants(16);
    savedMock.setStatus(Status.PREPARATION);
    savedMock.setOrganizer(organizer);

    when(tournamentRepository.save(Mockito.any(Tournament.class))).thenReturn(savedMock);
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    LocalDate now = LocalDate.now();
    TournamentDto valid = new TournamentDto("Test", "desc", now.plusDays(5), now.plusDays(10),
        now.plusDays(3), 16);

    TournamentResponseDto result = tournamentService.createTournament(organizer.getId(), valid);

    assertEquals(16, result.maxParticipants());
  }

  @Test
  void createTournamentMaxParticipantsNotPowerOfTwo() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    Tournament savedMock = new Tournament();
    savedMock.setId(1L);
    savedMock.setName("Test");
    savedMock.setDescription("desc");
    savedMock.setMaxParticipants(7);
    savedMock.setStatus(Status.PREPARATION);
    savedMock.setOrganizer(organizer);

    when(tournamentRepository.save(Mockito.any(Tournament.class))).thenReturn(savedMock);
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    LocalDate now = LocalDate.now();
    TournamentDto valid = new TournamentDto("Test", "desc", now.plusDays(5), now.plusDays(10),
        now.plusDays(3), 7);

    TournamentResponseDto result = tournamentService.createTournament(organizer.getId(), valid);

    assertEquals(7, result.maxParticipants());
  }

  @Test
  void createTournamentNameAlreadyExists() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));
    when(tournamentRepository.existsByName(validDto.name())).thenReturn(true);

    assertThrows(IllegalStateException.class,
        () -> tournamentService.createTournament(organizer.getId(), validDto));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  // ── updateTournament ──

  @Test
  void updateTournamentSuccess() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());
    when(tournamentRepository.save(Mockito.any(Tournament.class))).thenAnswer(invocation -> {
      Tournament t = invocation.getArgument(0);
      t.setId(1L);
      return t;
    });

    LocalDate now = LocalDate.now();
    TournamentDto updateDto = new TournamentDto("Nouveau nom", "Nouvelle description",
        now.plusDays(6), now.plusDays(12), now.plusDays(4), 16);

    TournamentResponseDto result = tournamentService.updateTournament(1L, updateDto);

    assertEquals("Nouveau nom", result.name());
  }

  @Test
  void updateTournamentNotFound() {
    when(tournamentRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> tournamentService.updateTournament(99L, validDto));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void updateTournamentStartDateAfterEndDate() {
    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.plusDays(10), now.plusDays(5),
        now.plusDays(3), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.updateTournament(1L, invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void updateTournamentStartDateInPast() {
    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.minusDays(3), now.plusDays(5),
        now.minusDays(5), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.updateTournament(1L, invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void updateTournamentRegistrationDeadlineAfterStartDate() {
    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.plusDays(3), now.plusDays(10),
        now.plusDays(5), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.updateTournament(1L, invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void updateTournamentRegistrationDeadlineInPast() {
    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto("Test", "desc", now.plusDays(5), now.plusDays(10),
        now.minusDays(1), 8);

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.updateTournament(1L, invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void updateTournamentMaxParticipantsNotPowerOfTwo() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());
    when(tournamentRepository.save(Mockito.any(Tournament.class))).thenAnswer(invocation -> {
      Tournament t = invocation.getArgument(0);
      t.setId(1L);
      return t;
    });

    LocalDate now = LocalDate.now();
    TournamentDto valid = new TournamentDto("Test", "desc", now.plusDays(5), now.plusDays(10),
        now.plusDays(3), 7);

    TournamentResponseDto result = tournamentService.updateTournament(1L, valid);

    assertEquals(7, result.maxParticipants());
  }

  // ── getAllTournaments ──

  @Test
  void getAllTournamentsNonAdminOnlySeesPublic() {
    Tournament publicTournament = new Tournament();
    publicTournament.setId(1L);
    publicTournament.setName("Public");
    publicTournament.setDescription("desc");
    publicTournament.setStartDate(LocalDate.now().plusDays(5));
    publicTournament.setEndDate(LocalDate.now().plusDays(10));
    publicTournament.setRegistrationDeadline(LocalDate.now().plusDays(3));
    publicTournament.setMaxParticipants(8);
    publicTournament.setStatus(Status.PREPARATION);
    publicTournament.setPublic(true);
    publicTournament.setOrganizer(organizer);

    Tournament privateTournament = new Tournament();
    privateTournament.setId(2L);
    privateTournament.setName("Privé");
    privateTournament.setDescription("desc");
    privateTournament.setStartDate(LocalDate.now().plusDays(5));
    privateTournament.setEndDate(LocalDate.now().plusDays(10));
    privateTournament.setRegistrationDeadline(LocalDate.now().plusDays(3));
    privateTournament.setMaxParticipants(8);
    privateTournament.setStatus(Status.PREPARATION);
    privateTournament.setPublic(false);
    privateTournament.setOrganizer(organizer);

    when(tournamentRepository.findAll()).thenReturn(List.of(publicTournament, privateTournament));
    when(registrationRepository.findByTournamentId(Mockito.anyLong())).thenReturn(List.of());

    List<TournamentResponseDto> result = tournamentService.getAllTournaments(null, null, false);

    assertEquals(1, result.size());
    assertEquals("Public", result.getFirst().name());
  }

  @Test
  void getAllTournamentsAdminSeesAll() {
    Tournament publicTournament = new Tournament();
    publicTournament.setId(1L);
    publicTournament.setName("Public");
    publicTournament.setDescription("desc");
    publicTournament.setStartDate(LocalDate.now().plusDays(5));
    publicTournament.setEndDate(LocalDate.now().plusDays(10));
    publicTournament.setRegistrationDeadline(LocalDate.now().plusDays(3));
    publicTournament.setMaxParticipants(8);
    publicTournament.setStatus(Status.PREPARATION);
    publicTournament.setPublic(true);
    publicTournament.setOrganizer(organizer);

    Tournament privateTournament = new Tournament();
    privateTournament.setId(2L);
    privateTournament.setName("Privé");
    privateTournament.setDescription("desc");
    privateTournament.setStartDate(LocalDate.now().plusDays(5));
    privateTournament.setEndDate(LocalDate.now().plusDays(10));
    privateTournament.setRegistrationDeadline(LocalDate.now().plusDays(3));
    privateTournament.setMaxParticipants(8);
    privateTournament.setStatus(Status.PREPARATION);
    privateTournament.setPublic(false);
    privateTournament.setOrganizer(organizer);

    when(tournamentRepository.findAll()).thenReturn(List.of(publicTournament, privateTournament));
    when(registrationRepository.findByTournamentId(Mockito.anyLong())).thenReturn(List.of());

    List<TournamentResponseDto> result = tournamentService.getAllTournaments(null, null, true);

    assertEquals(2, result.size());
  }

  // ── publishTournament ──

  @Test
  void publishTournamentSuccess() {
    Member member1 = new Member();
    member1.setId(10L);
    Member member2 = new Member();
    member2.setId(11L);

    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));
    when(tournamentRepository.save(Mockito.any(Tournament.class))).thenAnswer(invocation -> {
      Tournament t = invocation.getArgument(0);
      t.setId(1L);
      t.setPublic(true);
      return t;
    });
    when(memberRepository.findAll()).thenReturn(List.of(member1, member2));
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    TournamentResponseDto result = tournamentService.publishTournament(1L);

    assertTrue(result.isPublic());
    verify(notificationService, Mockito.times(2)).send(Mockito.anyLong(),
        Mockito.any(Notification.class));
  }

  @Test
  void publishTournamentNotInPreparation() {
    savedTournament.setStatus(Status.IN_PROGRESS);
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));

    assertThrows(IllegalStateException.class, () -> tournamentService.publishTournament(1L));

    verify(notificationService, never()).send(Mockito.anyLong(), Mockito.any());
  }

  // ── getHomepageTournaments ──

  @Test
  void getHomepageTournamentsAllFound() {
    LocalDate now = LocalDate.now();

    Tournament finished = new Tournament();
    finished.setId(2L);
    finished.setName("Finished");
    finished.setDescription("Description");
    finished.setStartDate(now.minusDays(10));
    finished.setEndDate(now.minusDays(1));
    finished.setRegistrationDeadline(now.minusDays(12));
    finished.setMaxParticipants(8);
    finished.setStatus(Status.FINISHED);
    finished.setOrganizer(organizer);

    Tournament inProgress = new Tournament();
    inProgress.setId(3L);
    inProgress.setName("In Progress");
    inProgress.setDescription("Description");
    inProgress.setStartDate(now.minusDays(2));
    inProgress.setEndDate(now.plusDays(5));
    inProgress.setRegistrationDeadline(now.minusDays(4));
    inProgress.setMaxParticipants(8);
    inProgress.setStatus(Status.IN_PROGRESS);
    inProgress.setOrganizer(organizer);

    when(tournamentRepository.findTopByStatusOrderByEndDateDesc(Status.FINISHED)).thenReturn(
        Optional.of(finished));
    when(tournamentRepository.findFirstByStatus(Status.IN_PROGRESS)).thenReturn(
        Optional.of(inProgress));
    when(tournamentRepository.findFirstByStatusAndIsPublicTrueOrderByStartDateAsc(
        Status.PREPARATION)).thenReturn(Optional.of(savedTournament));
    when(registrationRepository.findByTournamentId(Mockito.anyLong())).thenReturn(List.of());

    HomepageTournamentsDto result = tournamentService.getHomepageTournaments();

    assertEquals("Finished", result.lastFinished().name());
    assertEquals("In Progress", result.inProgress().name());
    assertEquals("Tournoi Test", result.nextUpcoming().name());
  }

  @Test
  void getHomepageTournamentsAllNull() {
    when(tournamentRepository.findTopByStatusOrderByEndDateDesc(Status.FINISHED)).thenReturn(
        Optional.empty());
    when(tournamentRepository.findFirstByStatus(Status.IN_PROGRESS)).thenReturn(Optional.empty());
    when(tournamentRepository.findFirstByStatusAndIsPublicTrueOrderByStartDateAsc(
        Status.PREPARATION)).thenReturn(Optional.empty());

    HomepageTournamentsDto result = tournamentService.getHomepageTournaments();

    assertNull(result.lastFinished());
    assertNull(result.inProgress());
    assertNull(result.nextUpcoming());
  }

  @Test
  void getAllTournamentsByTeamName() {
    savedTournament.setPublic(true);
    when(registrationRepository.findByTeamNameContainingIgnoreCase("Alpha")).thenReturn(List.of());
    when(tournamentRepository.findByIdIn(List.of())).thenReturn(List.of());

    List<TournamentResponseDto> result = tournamentService.getAllTournaments("Alpha", null, false);

    assertEquals(0, result.size());
  }

  @Test
  void getAllTournamentsByMemberTag() {
    savedTournament.setPublic(true);
    when(tournamentRepository.findAll()).thenReturn(List.of(savedTournament));
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    List<TournamentResponseDto> result = tournamentService.getAllTournaments(null, "tag1", false);

    assertEquals(0, result.size());
  }

  @Test
  void getAllTournamentsBlankTeamNameFallsBackToAll() {
    savedTournament.setPublic(true);
    when(tournamentRepository.findAll()).thenReturn(List.of(savedTournament));
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    List<TournamentResponseDto> result = tournamentService.getAllTournaments("   ", null, false);

    assertEquals(1, result.size());
  }

  @Test
  void getTournamentByIdSuccess() {
    savedTournament.setPublic(true);
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));
    when(registrationRepository.findByTournamentId(1L)).thenReturn(List.of());

    TournamentResponseDto result = tournamentService.getTournamentById(1L);

    assertEquals("Tournoi Test", result.name());
    assertEquals(Status.PREPARATION, result.status());
  }

  @Test
  void getTournamentByIdNotFound() {
    when(tournamentRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class, () -> tournamentService.getTournamentById(99L));
  }
}