package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Membership request service.
 */
@Service
public class MembershipRequestService {

  private final MembershipRequestRepository membershipRequestRepository;
  private final TeamCompositionRepository teamCompositionRepository;

  /**
   * Instantiates a new Membership request service.
   *
   * @param membershipRequestRepository the membership request repository
   * @param teamCompositionRepository   the team composition repository
   */
  public MembershipRequestService(MembershipRequestRepository membershipRequestRepository,
      TeamCompositionRepository teamCompositionRepository) {
    this.membershipRequestRepository = membershipRequestRepository;
    this.teamCompositionRepository = teamCompositionRepository;
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
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Request not found"));

    if (!request.getTeam().getResponsible().getId().equals(responsibleId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Only the team responsible can manage requests");
    }

    if (request.getState() != State.PENDING) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is already processed");
    }

    return request;
  }
}