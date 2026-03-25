package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import org.springframework.stereotype.Service;

/**
 * The type Team manager service.
 */
@Service
public class TeamManagerService {

  private final TeamRepository teamRepository;
  private final TeamCompositionRepository teamCompositionRepository;
  private final MemberRepository memberRepository;

  /**
   * Instantiates a new Team manager service.
   *
   * @param teamRepository            the team repository
   * @param teamCompositionRepository the team composition repository
   * @param memberRepository          the member repository
   */
  public TeamManagerService(TeamRepository teamRepository,
      TeamCompositionRepository teamCompositionRepository, MemberRepository memberRepository) {
    this.teamRepository = teamRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Assign secondary manager.
   *
   * @param teamId        the team id
   * @param memberId      the member id
   * @param responsibleId the responsible id
   */
  public void assignSecondaryManager(Long teamId, Long memberId, Long responsibleId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new IllegalArgumentException("Team not found"));

    if (!team.getResponsible().getId().equals(responsibleId)) {
      throw new SecurityException("Only the team responsible can assign a secondary manager");
    }

    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("Member not found"));

    teamCompositionRepository.findByMemberId(memberId)
        .orElseThrow(() -> new IllegalStateException("Member is not in this team"));

    if (team.getResponsible().getId().equals(memberId)) {
      throw new IllegalStateException("Member is already the team responsible");
    }
    team.setSecondResponsible(member);
    teamRepository.save(team);
  }
}