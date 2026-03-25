
package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;

import java.time.LocalDate;
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

  TournamentDto dto1;
  TournamentDto dto2;
  Member member;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private TournamentRepository tournamentRepository;

  @InjectMocks
  private TournamentService tournamentService;

  @BeforeEach
  void setUp() {
    member = new Member("test@test.com", "password", "tag1", true, LocalDate.now(), null, null);
    member.setId(1L);

    LocalDate now = LocalDate.now();

    dto1 = new TournamentDto(
        "tournoi-test",
        "description test",
        now.plusDays(5),
        now.plusDays(6),
        now.plusDays(1),
        4
    );

    dto2 = new TournamentDto(
        "tournoi-test",
        "description test",
        now.plusDays(2),
        now.plusDays(3),
        now.plusDays(1),
        3
    );
  }

  @Test
  void createTournamentSuccess() {

    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));
    when(tournamentRepository.save(Mockito.any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament result = tournamentService.createTournament(member.getId(), dto1);

    assertEquals(dto1.name(), result.getName());
    assertEquals(Status.PREPARATION, result.getStatus());
    assertEquals(member, result.getOrganizer());
  }

  @Test
  void createTournamentOrganizerNull(){
    long unknownId = 23L;

    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> tournamentService.createTournament(unknownId, dto1));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentStartDateAfterEndDate(){
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

    TournamentDto invalid = new TournamentDto(
        "test",
        "desc",
        LocalDate.now().plusDays(5),
        LocalDate.now().plusDays(2),
        LocalDate.now().plusDays(1),
        4
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(member.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentDateInPast(){
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

    TournamentDto invalid = new TournamentDto(
        "test",
        "desc",
        LocalDate.now().minusDays(5),
        LocalDate.now().minusDays(2),
        LocalDate.now().plusDays(1),
        4
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(member.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentMaxParticipantsPowerOfTwo() {
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));
    when(tournamentRepository.save(Mockito.any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    TournamentDto valid = new TournamentDto(
        "test",
        "desc",
        LocalDate.now().plusDays(1),
        LocalDate.now().plusDays(2),
        LocalDate.now().plusDays(1),
        8
    );

    Tournament result = tournamentService.createTournament(member.getId(), valid);

    assertEquals(8, result.getMaxParticipants());
  }

  @Test
  void createTournamentMaxParticipantsNotPowerOfTwo(){
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(member.getId(), dto2));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentRegistrationDeadlineAfterStartDate() {
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

    TournamentDto invalid = new TournamentDto(
        "test",
        "desc",
        LocalDate.now().plusDays(2),
        LocalDate.now().plusDays(3),
        LocalDate.now().plusDays(5),
        4
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(member.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }

  @Test
  void createTournamentRegistrationDeadlineInPast() {
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

    TournamentDto invalid = new TournamentDto(
        "test",
        "desc",
        LocalDate.now().plusDays(2),
        LocalDate.now().plusDays(3),
        LocalDate.now().minusDays(1),
        4
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(member.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }
}
