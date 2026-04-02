package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

/**
 * The type Membership request service.
 */
@Service
public class MembershipRequestService {

  private final MembershipRequestRepository membershipRequestRepository;
  private final TeamCompositionRepository teamCompositionRepository;
  private final NotificationService notificationService;

  /**
   * Instantiates a new Membership request service.
   *
   * @param membershipRequestRepository the membership request repository
   * @param teamCompositionRepository   the team composition repository
   * @param notificationService         the notification service
   */
  public MembershipRequestService(MembershipRequestRepository membershipRequestRepository,
      TeamCompositionRepository teamCompositionRepository,
      NotificationService notificationService) {
    this.membershipRequestRepository = membershipRequestRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.notificationService = notificationService;
  }

  /**
   * Approve request.
   *
   * @param requestId     the request id
   * @param responsibleId the responsible id
   */
  public void approveRequest(Long requestId, Long responsibleId) {
    MembershipRequest request = getValidatedRequest(requestId, responsibleId);

    request.setState(State.ACCEPTED);
    request.setProcessingDate(LocalDateTime.now());
    membershipRequestRepository.save(request);
    Notification notif = new Notification(
        Type.MEMBERSHIP_REQUEST,
        "Votre demande d'adhésion à " + request.getTeam().getName() + " a été acceptée !",
        LocalDateTime.now()
    );
    notif.setMembershipRequest(request);
    notificationService.send(request.getMember().getId(), notif);

    TeamComposition composition = new TeamComposition(
        request.getMember(), request.getTeam(), LocalDateTime.now());
    teamCompositionRepository.save(composition);
  }

  /**
   * Refuse request.
   *
   * @param requestId     the request id
   * @param responsibleId the responsible id
   * @param refusalReason the refusal reason
   */
  public void refuseRequest(Long requestId, Long responsibleId, String refusalReason) {
    MembershipRequest request = getValidatedRequest(requestId, responsibleId);

    request.setState(State.REFUSED);
    request.setRefusalReason(refusalReason);
    request.setProcessingDate(LocalDateTime.now());
    membershipRequestRepository.save(request);

    Notification notif = new Notification(
        Notification.Type.MEMBERSHIP_REQUEST,
        "Votre demande d'adhésion à " + request.getTeam().getName() + " a été refusée : "
            + refusalReason,
        LocalDateTime.now()
    );
    notif.setMembershipRequest(request);
    notificationService.send(request.getMember().getId(), notif);
  }

  /**
   * Get validated request.
   *
   * @param requestId     the request id
   * @param responsibleId the responsible id
   * @return the membership request
   */
  private MembershipRequest getValidatedRequest(Long requestId, Long responsibleId) {
    MembershipRequest request = membershipRequestRepository.findById(requestId)
        .orElseThrow(() -> new IllegalArgumentException("Request not found"));

    if (!request.getTeam().getResponsible().getId().equals(responsibleId)) {
      throw new IllegalStateException("Only the team responsible can manage requests");
    }
    if (request.getState() != State.PENDING) {
      throw new IllegalStateException("Request is already processed");
    }
    return request;
  }
}
