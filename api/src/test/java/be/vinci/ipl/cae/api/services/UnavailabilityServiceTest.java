package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.UnavailabilityDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Unavailability;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

/**
 * Unit tests for UnavailabilityService.
 */
@ExtendWith(MockitoExtension.class)
public class UnavailabilityServiceTest {

  @Mock
  private UnavailabilityRepository unavailabilityRepository;

  @Mock
  private MemberRepository memberRepository;

  @InjectMocks
  UnavailabilityService unavailabilityService;

  private Member member;
  private final String email = "member@vinci.be";

  @BeforeEach
  void setUp() {
    member = new Member();
    member.setEmail(email);
  }

  @Test
  @DisplayName("Should add unavailability when dates are valid")
  void addUnavailability1() {
    UnavailabilityDto dto = new UnavailabilityDto(LocalDate.of(2026, 8, 1),
        LocalDate.of(2026, 8, 16));

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));

    unavailabilityService.addUnavailability(email, dto);

    verify(unavailabilityRepository).save(any(Unavailability.class));
  }

  @Test
  @DisplayName("Should throw exception when end date is before start date")
  void addUnavailability2() {
    UnavailabilityDto dto = new UnavailabilityDto(LocalDate.of(2026, 9, 19),
        LocalDate.of(2026, 9, 11));

    assertThrows(ResponseStatusException.class, () -> {
      unavailabilityService.addUnavailability(email, dto);
    });

    verify(unavailabilityRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should throw exception when start date is in the past")
  void addUnavailability3() {
    UnavailabilityDto dto = new UnavailabilityDto(LocalDate.now().minusDays(1),
        LocalDate.now().plusDays(5));

    assertThrows(ResponseStatusException.class, () -> {
      unavailabilityService.addUnavailability(email, dto);
    });

    verify(unavailabilityRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should return list of unavailabilities of member")
  void addUnavailability4() {
    Unavailability u = new Unavailability();
    u.setStartDate(LocalDate.of(2026, 8, 1));
    u.setEndDate(LocalDate.of(2026, 8, 16));

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(unavailabilityRepository.findAllByMemberOrderByStartDateAsc(member))
        .thenReturn(List.of(u));

    List<UnavailabilityDto> result = unavailabilityService.getMyUnavailabilities(email);

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals(LocalDate.of(2026, 8, 1), result.get(0).startDate());

  }

}
