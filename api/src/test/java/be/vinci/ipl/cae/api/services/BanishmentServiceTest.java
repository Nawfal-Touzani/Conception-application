package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.BanishmentRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
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

  @InjectMocks
  private BanishmentService banishmentService;

  private Member admin;
  private Member member;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    admin = new Member();
    admin.setId(123L);

    member = new Member();
    member.setId(456L);
    member.setBan(false);
  }

  /**
   * Ban member 1.
   */
  @Test
  @DisplayName("Should ban member and save banishment")
  void banMember1() {
    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(banishmentRepository.existsByBannedMemberId(456L)).thenReturn(false);

    banishmentService.banMember(456L, 123L, "Cheating");

    assertTrue(member.isBan());
    verify(memberRepository, times(1)).save(member);
    verify(banishmentRepository, times(1)).save(any());
  }

  /**
   * Ban member 2.
   */
  @Test
  @DisplayName("Should throw exception when member is already ban")
  void banMember2() {
    when(memberRepository.findById(456L)).thenReturn(Optional.of(member));
    when(memberRepository.findById(123L)).thenReturn(Optional.of(admin));
    when(banishmentRepository.existsByBannedMemberId(456L)).thenReturn(true);

    assertThrows(IllegalArgumentException.class,
        () -> banishmentService.banMember(456L, 123L, "Raison"));
  }
}
