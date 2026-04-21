package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.BanishmentRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for BanishmentService logic.
 */
@ExtendWith(MockitoExtension.class)
public class BanishmentServiceTest {

  @Mock
  private BanishmentRepository banishmentRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private TeamCompositionRepository teamCompositionRepository;

  @InjectMocks
  private BanishmentService banishmentService;

  private Member admin;
  private Member member;

  @BeforeEach
  void setUp() {
    admin = new Member();
    admin.setId(123L);

    member = new Member();
    member.setId(456L);
    member.setBan(false);
  }

  @Test
  @DisplayName("Should ban member and save banishment")
  void banMember1() {
    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(banishmentRepository.existsByBannedMemberId(456L)).thenReturn(false);
    when(teamRepository.findByResponsible(member)).thenReturn(Optional.empty());
    when(teamCompositionRepository.findByMemberId(456L)).thenReturn(Optional.empty());

    banishmentService.banMember(456L, 123L, "Triche");

    assertTrue(member.isBan());
    verify(banishmentRepository, times(1)).save(any());
  }

  @Test
  @DisplayName("Should throw exception when member is already ban")
  void banMember2() {
    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(banishmentRepository.existsByBannedMemberId(456L)).thenReturn(true);

    assertThrows(IllegalArgumentException.class,
        () -> banishmentService.banMember(456L, 123L, "Triche"));
  }

  @Test
  @DisplayName("Should transfer responsibility to second responsible when first is banned")
  void banResponsibleWithSecond() {
    Member second = new Member();
    second.setId(789L);
    Team team = new Team("Alpha", true, LocalDateTime.now(), member, second);

    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(teamRepository.findByResponsible(member)).thenReturn(Optional.of(team));
    when(teamCompositionRepository.findByMemberId(456L)).thenReturn(Optional.empty());

    banishmentService.banMember(456L, 123L, "Triche");

    assertEquals(second, team.getResponsible());
    assertNull(team.getSecondResponsible());
    verify(teamRepository).save(team);
  }

  @Test
  @DisplayName("Should transfer responsibility to oldest member when no second responsible")
  void banResponsibleOldestMember() {
    Team team = new Team("Alpha", true, LocalDateTime.now(), member, null);
    team.setId(1L);

    Member oldest = new Member();
    oldest.setId(10L);
    Member newest = new Member();
    newest.setId(11L);

    TeamComposition comp1 = new TeamComposition(member, team, LocalDateTime.now().minusDays(10));
    TeamComposition compOldest = new TeamComposition(oldest, team,
        LocalDateTime.now().minusDays(5));
    TeamComposition compNewest = new TeamComposition(newest, team,
        LocalDateTime.now().minusDays(1));

    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(teamRepository.findByResponsible(member)).thenReturn(Optional.of(team));
    when(teamCompositionRepository.findAllByTeamId(1L)).thenReturn(
        List.of(comp1, compOldest, compNewest));
    when(teamCompositionRepository.findByMemberId(456L)).thenReturn(Optional.of(comp1));

    banishmentService.banMember(456L, 123L, "Triche");

    assertEquals(oldest, team.getResponsible());
    verify(teamCompositionRepository).delete(comp1);
  }

  @Test
  @DisplayName("Should revoke admin privileges when an admin is banned")
  void banAdminMember() {
    member.setIsAdmin(true);

    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(teamRepository.findByResponsible(member)).thenReturn(Optional.empty());
    when(teamCompositionRepository.findByMemberId(456L)).thenReturn(Optional.empty());

    banishmentService.banMember(456L, 123L, "Abus de pouvoir");

    assertFalse(member.getIsAdmin());
    assertTrue(member.isBan());
    verify(banishmentRepository).save(any());
  }
}