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
import java.time.LocalDateTime;
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



    LocalDateTime now = LocalDateTime.now();

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
        LocalDateTime.now().plusDays(2),
        LocalDateTime.now().plusDays(3),
        LocalDateTime.now().plusDays(1),
        3
    );

    }

  @Test
  void createTournamentSucces() {

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
    long unKnowId=23L;

    when(memberRepository.findById(unKnowId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        ()->tournamentService.createTournament(unKnowId,dto1));

    verify(tournamentRepository,never()).save(Mockito.any());


  }

  @Test
  void createTournamentStartDateAfterEndDate(){
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

    TournamentDto invalid = new TournamentDto(
        "test",
        "desc",
        LocalDateTime.now().plusDays(5), // start after end
        LocalDateTime.now().plusDays(2),
        LocalDateTime.now().plusHours(1),
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
        LocalDateTime.now().minusDays(5),
        LocalDateTime.now().minusDays(2),
        LocalDateTime.now().plusHours(1),
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
        LocalDateTime.now().plusDays(1),
        LocalDateTime.now().plusDays(2),
        LocalDateTime.now().plusHours(1),
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
        LocalDateTime.now().plusDays(2),   // start
        LocalDateTime.now().plusDays(3),   // end
        LocalDateTime.now().plusDays(5),   // registration AFTER start → invalid
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
        LocalDateTime.now().plusDays(2),   // start
        LocalDateTime.now().plusDays(3),   // end
        LocalDateTime.now().minusDays(1),  // deadline in past → invalid
        4
    );

    assertThrows(IllegalArgumentException.class,
        () -> tournamentService.createTournament(member.getId(), invalid));

    verify(tournamentRepository, never()).save(Mockito.any());
  }




}