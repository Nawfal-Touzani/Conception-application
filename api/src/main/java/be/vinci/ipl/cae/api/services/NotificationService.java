package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.NotificationRepository;
import org.springframework.stereotype.Service;

/**
 * Notification service.
 */
@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final MemberRepository memberRepository;

  /**
   * Creates a new NotificationService.
   */
  public NotificationService(NotificationRepository notificationRepository,
      MemberRepository memberRepository) {
    this.notificationRepository = notificationRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Gets all notifications by a member id.
   */
  public Iterable<Notification> getAllNotificationByMember(long id) {

    Member member = getMemberIfExist(id);
    if (member == null) {
      return null;
    }
    return notificationRepository.findByMemberId(id);
  }

  /**
   * Send a notification to a member.
   */
  public Notification send(long id, Notification notification) {
    Member member = getMemberIfExist(id);
    if (member == null) {
      return null;
    }
    notification.setMember(member);

    return notificationRepository.save(notification);
  }

  /**
   * Gets a member if it exists.
   */
  public Member getMemberIfExist(long id) {
    return memberRepository.findById(id).orElse(null);
  }

}
