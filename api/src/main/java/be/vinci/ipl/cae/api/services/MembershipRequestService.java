package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

/**
 * MembershipRequest service.
 */
@Service
public class MembershipRequestService {

  private final MembershipRequestRepository membershipRequestRepository;
  private final MemberRepository memberRepository;
  private final TeamRepository teamRepository;
  private final NotificationService notificationService;

  /**
   * Creates a new MembershipRequestService.
   */
  public MembershipRequestService(
      MembershipRequestRepository membershipRequestRepository,
      MemberRepository memberRepository,
      TeamRepository teamRepository,
      NotificationService notificationService) {
    this.membershipRequestRepository = membershipRequestRepository;
    this.memberRepository = memberRepository;
    this.teamRepository = teamRepository;
    this.notificationService = notificationService;
  }

  /**
   * Creates a membership request for a member to join a team. Notifies the team responsible.
   *
   * @param memberId the ID of the member
   * @param teamId   the ID of the team
   * @return the created membership request, or null if member or team not found
   */
  public MembershipRequest createRequest(long memberId, long teamId) {
    Member member = memberRepository.findById(memberId).orElse(null);
    if (member == null) {
      return null;
    }

    Team team = teamRepository.findById(teamId).orElse(null);
    if (team == null) {
      return null;
    }

    MembershipRequest request = new MembershipRequest(State.PENDING, null, null);
    request.setMember(member);
    request.setTeam(team);

    MembershipRequest saved = membershipRequestRepository.save(request);

    // Notify the team responsible
    Notification notif = new Notification(
        Notification.Type.MEMBERSHIP_REQUEST,
        "Nouvelle demande d'adhésion de " + member.getTag() + " pour rejoindre " + team.getName(),
        LocalDateTime.now()
    );
    notificationService.send(team.getResponsible().getId(), notif);

    return saved;
  }
}

