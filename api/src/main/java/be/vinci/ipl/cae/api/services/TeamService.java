package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Team service.
 */
@Service
public class TeamService {

  private final TeamRepository teamRepository;
  private final TeamCompositionRepository teamCompositionRepository;
  private final MemberRepository memberRepository;

  /**
   * Instantiates a new Team service.
   *
   * @param teamRepository            the team repository
   * @param teamCompositionRepository the team composition repository
   * @param memberRepository          the member repository
   */
  public TeamService(TeamRepository teamRepository,
      TeamCompositionRepository teamCompositionRepository, MemberRepository memberRepository) {
    this.teamRepository = teamRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Create team team.
   *
   * @param memberId the member id
   * @param request  the request
   * @return the team
   */
  public Team createTeam(Long memberId, CreateTeamRequest request) {

    if (request.isInvalid()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team name is required");
    }

    if (teamCompositionRepository.existsByMemberId(memberId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Member already belongs to a team");
    }

    if (teamRepository.existsByName(request.getName())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Team name already exists");
    }
    Member member = memberRepository.findById(memberId).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

    Team team = new Team();
    team.setName(request.getName());
    team.setIsActive(true);
    team.setCreationDate(LocalDateTime.now());
    team.setResponsible(member);
    Team savedTeam = teamRepository.save(team);
    TeamComposition composition = new TeamComposition(member, savedTeam, LocalDateTime.now());
    teamCompositionRepository.save(composition);

    return savedTeam;
  }
}