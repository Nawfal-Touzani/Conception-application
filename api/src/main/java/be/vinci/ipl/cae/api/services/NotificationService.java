package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.NotificationRepository;
import java.util.NoSuchElementException;
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

    getMemberOrThrow(id);

    return notificationRepository.findByMemberId(id);
  }

  /**
   * Send a notification to a member.
   */
  public Notification send(long id, Notification notification) {
    Member member = getMemberOrThrow(id);

    notification.setMember(member);
    return notificationRepository.save(notification);
  }

  /**
   * Mark the notification to read.
   */
  public Notification markNotificationRead(long id) {
    Notification notification = notificationRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Notification not found"));

    notification.setRead(true);
    return notificationRepository.save(notification);
  }

  /**
   * Get the notification of a member by read status.
   */
  public Iterable<Notification> getNotificationsByReadStatus(long id, boolean read) {
    getMemberOrThrow(id);
    return notificationRepository.findByMemberIdAndRead(id, read);
  }

  /**
   * Gets a member by id or throws if not found.
   */
  private Member getMemberOrThrow(long id) {
    return memberRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Member not found"));
  }

}
