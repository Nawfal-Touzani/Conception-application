package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Banishment;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.BanishmentRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Random;
import org.springframework.stereotype.Service;

/**
 * The type Banishment service.
 */
@Service
public class BanishmentService {

  private final BanishmentRepository banishmentRepository;
  private final MemberRepository memberRepository;
  private final TeamRepository teamRepository;
  private final TeamCompositionRepository teamCompositionRepository;

  /**
   * Instantiates a new Banishment service.
   *
   * @param banishmentRepository the banishment repository
   * @param memberRepository     the member repository
   */
  public BanishmentService(BanishmentRepository banishmentRepository,
      MemberRepository memberRepository, TeamRepository teamRepository,
      TeamCompositionRepository teamCompositionRepository) {
    this.banishmentRepository = banishmentRepository;
    this.memberRepository = memberRepository;
    this.teamRepository = teamRepository;
    this.teamCompositionRepository = teamCompositionRepository;
  }

  /**
   * Bans a member and updates their status.
   *
   * @param memberId the id of the member to ban
   * @param adminId  the id of the admin who perform the ban
   * @param reason   reason for the banishment
   */
  @Transactional
  public void banMember(Long memberId, Long adminId, String reason) {
    Member memberToBan = findMember(memberId);
    Member admin = findMember(adminId);

    validateBanishment(memberToBan);

    handleTeamResponsibility(memberToBan);

    banAdmin(memberToBan);

    applyBanishment(memberToBan);

    Banishment banishment = new Banishment(memberToBan, admin, LocalDate.now(), reason);
    banishmentRepository.save(banishment);
  }

  private Member findMember(Long id) {
    return memberRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Membre introuvable"));
  }

  private void validateBanishment(Member member) {
    if (member.isBan() || banishmentRepository.existsByBannedMemberId(member.getId())) {
      throw new IllegalArgumentException("Ce membre est déja banni");
    }
  }

  private void applyBanishment(Member member) {
    member.setBan(true);
  }

  private void handleTeamResponsibility(Member memberToBan) {
    Optional<Team> teamAsResponsible = teamRepository.findByResponsible(memberToBan);
    if (teamAsResponsible.isPresent()) {
      Team team = teamAsResponsible.get();
      transferPrimaryResponsibility(team, memberToBan);
    }

    teamCompositionRepository.findByMemberId(memberToBan.getId())
        .ifPresent(teamCompositionRepository::delete);

  }

  private void transferPrimaryResponsibility(Team team, Member oldResponsible) {
    if (team.getSecondResponsible() != null) {
      team.setResponsible(team.getSecondResponsible());
      team.setSecondResponsible(null);
    } else {
      List<TeamComposition> compositions = teamCompositionRepository.findAllByTeamId(team.getId());

      List<Member> candidates = compositions
          .stream()
          .map(TeamComposition::getMember)
          .filter(m -> !m.getId().equals(oldResponsible.getId()))
          .toList();

      if (candidates.isEmpty()) {
        team.setResponsible(null);
        team.setActive(false);
      } else {
        Member successor = findSuccessor(compositions, oldResponsible.getId());
        team.setResponsible(successor);
      }
    }
    teamRepository.save(team);
  }

  private Member findSuccessor(List<TeamComposition> compositions, Long bannedId) {
    List<TeamComposition> candidates = compositions.stream()
        .filter(c -> !c.getMember().getId().equals(bannedId))
        .toList();

    LocalDateTime minDate = candidates.stream()
        .map(TeamComposition::getDateEntry)
        .min(LocalDateTime::compareTo)
        .orElse(null);

    List<Member> oldestMembers = candidates.stream()
        .filter(c -> c.getDateEntry().equals(minDate))
        .map(TeamComposition::getMember)
        .toList();

    if (oldestMembers.size() == 1) {
      return oldestMembers.getFirst();
    } else {
      return oldestMembers.get(new Random().nextInt(oldestMembers.size()));
    }
  }

  private void banAdmin(Member member) {
    member.setIsAdmin(false);
  }
}

