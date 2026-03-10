package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.UnavailabilityDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Unavailability;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Services handling operations related to member unavailabilities.
 */
@Service
public class UnavailabilityService {

  private final UnavailabilityRepository unavailabilityRepository;
  private final MemberRepository memberRepository;

  /**
   * Creates the service with required repositories.
   *
   * @param memberRepository         repository used to access members
   * @param unavailabilityRepository repository used to manage unavailabilites
   */
  public UnavailabilityService(MemberRepository memberRepository,
      UnavailabilityRepository unavailabilityRepository) {
    this.memberRepository = memberRepository;
    this.unavailabilityRepository = unavailabilityRepository;
  }

  /**
   * Add a new unavailability for the member identified by the email in parameter.
   *
   * @param email the email of the member
   * @param dto   the unavailability data to add
   */
  public void addUnavailability(String email, UnavailabilityDto dto) {
    if (dto.getEndDate().isBefore(dto.getStartDate())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "End date must be after start date");
    }
    if (dto.getStartDate().isBefore(LocalDate.now())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Start date cannot be in the past");
    }
    Member member = memberRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    Unavailability unavailability = new Unavailability();
    unavailability.setStartDate(dto.getStartDate());
    unavailability.setEndDate(dto.getEndDate());
    unavailability.setMember(member);

    unavailabilityRepository.save(unavailability);
  }

  /**
   * Returns all unavailabilities of the member identified by the email in parameter.
   *
   * @param email the email of the member
   * @return the list of unavailabilities for the member
   */
  public List<UnavailabilityDto> getMyUnavailabilities(String email) {
    Member member = memberRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    List<Unavailability> unavailabilities =
        unavailabilityRepository.findAllByMemberOrderByStartDateAsc(member);

    List<UnavailabilityDto> result = new ArrayList<>();

    for (Unavailability a : unavailabilities) {
      UnavailabilityDto dto = new UnavailabilityDto();
      dto.setStartDate(a.getStartDate());
      dto.setEndDate(a.getEndDate());
      result.add(dto);
    }

    return result;
  }
}
