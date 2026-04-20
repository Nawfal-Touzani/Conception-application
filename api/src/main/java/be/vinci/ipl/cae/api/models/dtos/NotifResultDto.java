package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Notification;

public record NotifResultDto(
    Long id,
    String type,
    String message,
    String sendDate,
    boolean read,
    Long matchId,
    Long membershipRequestId,
    String requestState
) {
  public static NotifResultDto from(Notification n) {
    return new NotifResultDto(
        n.getId(),
        n.getType().name(),
        n.getMessage(),
        n.getSendDate() != null ? n.getSendDate().toString() : null,
        n.isRead(),
        n.getMatch() != null ? n.getMatch().getId() : null,
        n.getMembershipRequest() != null ? n.getMembershipRequest().getId() : null,
        n.getMembershipRequest() != null && n.getMembershipRequest().getState() != null
            ? n.getMembershipRequest().getState().name()
            : null
    );
  }
}