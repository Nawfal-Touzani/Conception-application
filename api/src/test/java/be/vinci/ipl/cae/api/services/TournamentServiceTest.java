package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
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
  private MemberRepository memberRepository;

  @Mock
  private TournamentRepository tournamentRepository;

  @Mock
  private TournamentRegistrationRepository registrationRepository;

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

    validDto = new TournamentDto(
        "Tournoi Test",
        "Description test",
        now.plusDays(5),
        now.plusDays(10),
        now.plusDays(3),
        8
    );

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
    when(tournamentRepository.save(Mockito.any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament result = tournamentService.createTournament(organizer.getId(), validDto);

    assertEquals(validDto.name(), result.getName());
    assertEquals(validDto.description(), result.getDescription());
    assertEquals(Status.PREPARATION, result.getStatus());
    assertEquals(organizer, result.getOrganizer());
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
    TournamentDto invalid = new TournamentDto(
        "Test", "desc",
        now.plusDays(10), now.plusDays(5), now.plusDays(3), 8
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentStartDateInPast() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto(
        "Test", "desc",
        now.minusDays(3), now.plusDays(5), now.minusDays(5), 8
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentRegistrationDeadlineAfterStartDate() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto(
        "Test", "desc",
        now.plusDays(3), now.plusDays(10), now.plusDays(5), 8
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentRegistrationDeadlineInPast() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto(
        "Test", "desc",
        now.plusDays(5), now.plusDays(10), now.minusDays(1), 8
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentMaxParticipantsPowerOfTwo() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));
    when(tournamentRepository.save(Mockito.any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    LocalDate now = LocalDate.now();
    TournamentDto valid = new TournamentDto(
        "Test", "desc",
        now.plusDays(5), now.plusDays(10), now.plusDays(3), 16
    );

    Tournament result = tournamentService.createTournament(organizer.getId(), valid);

    assertEquals(16, result.getMaxParticipants());
  }

  @Test
  void createTournamentMaxParticipantsNotPowerOfTwo() {
    when(memberRepository.findById(organizer.getId())).thenReturn(Optional.of(organizer));

    LocalDate now = LocalDate.now();
    TournamentDto invalid = new TournamentDto(
        "Test", "desc",
        now.plusDays(5), now.plusDays(10), now.plusDays(3), 7
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(organizer.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
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
    when(registrationRepository.countByTournamentId(Mockito.anyLong())).thenReturn(0);

    List<TournamentResponseDto> result = tournamentService.getAllTournaments(null, null, false);

    assertEquals(1, result.size());
    assertEquals("Public", result.get(0).name());
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
    when(registrationRepository.countByTournamentId(Mockito.anyLong())).thenReturn(0);

    List<TournamentResponseDto> result = tournamentService.getAllTournaments(null, null, true);

    assertEquals(2, result.size());
  }

  // ── getTournamentById ──

  @Test
  void getTournamentByIdSuccess() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));
    when(registrationRepository.countByTournamentId(1L)).thenReturn(0);

    TournamentResponseDto result = tournamentService.getTournamentById(1L);

    assertEquals("Tournoi Test", result.name());
    assertEquals(Status.PREPARATION, result.status());
  }

  @Test
  void getTournamentByIdNotFound() {
    when(tournamentRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> tournamentService.getTournamentById(99L));
  }

  // ── publishTournament ──

  @Test
  void publishTournamentSuccess() {
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));
    when(tournamentRepository.save(Mockito.any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament result = tournamentService.publishTournament(1L);

    assertEquals(true, result.isPublic());
  }

  @Test
  void publishTournamentNotInPreparation() {
    savedTournament.setStatus(Status.IN_PROGRESS);
    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(savedTournament));

    assertThrows(IllegalStateException.class,
        () -> tournamentService.publishTournament(1L));
  }

}