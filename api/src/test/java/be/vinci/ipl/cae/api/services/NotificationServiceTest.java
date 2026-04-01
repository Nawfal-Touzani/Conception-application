package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.NotificationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The type Notification service test.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  /**
   * The Notification 1.
   */
  Notification notification1;
  /**
   * The Notification 2.
   */
  Notification notification2;
  /**
   * The Member 1.
   */
  Member member1;

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private MemberRepository memberRepository;

  @InjectMocks
  private NotificationService notificationService;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    notification1 = new Notification(Type.RESULT, "resultat du match 1-0", LocalDateTime.now());
    notification2 = new Notification(Type.TOURNAMENT, "TOURNOI commence le 4 mars",
        LocalDateTime.now());
    member1 = new Member("test@test.com", "password", "tag1", false, LocalDate.now(), null, null);
    member1.setId(1L);
  }

  /**
   * Gets all notification by member.
   */
  @Test
  void getAllNotificationByMember() {
    notification1.setMember(member1);
    notification2.setMember(member1);

    when(memberRepository.findById(member1.getId())).thenReturn(Optional.of(member1));
    when(notificationRepository.findByMemberId(member1.getId())).thenReturn(
        Arrays.asList(notification1, notification2));

    Iterable<Notification> result = notificationService.getAllNotificationByMember(member1.getId());

    assertEquals(List.of(notification1, notification2), result);
  }

  /**
   * Gets all notification by member not found.
   */
  @Test
  void getAllNotificationByMemberNotFound() {
    long unknownId = 23L;

    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> notificationService.getAllNotificationByMember(unknownId));

    verify(notificationRepository, never()).findByMemberId(unknownId);
  }

  /**
   * Send.
   */
  @Test
  void send() {
    when(memberRepository.findById(member1.getId())).thenReturn(Optional.of(member1));
    when(notificationRepository.save(notification1)).thenReturn(notification1);

    Notification result = notificationService.send(member1.getId(), notification1);

    assertEquals(notification1, result);
  }

  /**
   * Send member not found.
   */
  @Test
  void sendMemberNotFound() {
    long unknownId = 76L;

    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> notificationService.send(unknownId, notification2));

    verify(notificationRepository, never()).save(notification2);
  }

  /**
   * Mark notification read.
   */
  @Test
  void markNotificationRead() {
    notification1.setId(1L);
    when(notificationRepository.findById(notification1.getId())).thenReturn(
        Optional.of(notification1));
    when(notificationRepository.save(notification1)).thenReturn(notification1);

    Notification result = notificationService.markNotificationRead(notification1.getId());

    assertTrue(result.isRead());
    verify(notificationRepository).save(notification1);
  }

  /**
   * Mark notification read not found.
   */
  @Test
  void markNotificationReadNotFound() {
    long unknownId = 9L;

    when(notificationRepository.findById(unknownId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> notificationService.markNotificationRead(unknownId));

    verify(notificationRepository, never()).save(any());
  }

  /**
   * Gets notifications by read status.
   */
  @Test
  void getNotificationsByReadStatus() {
    Notification notification3 = new Notification(Type.RESULT, "ex", LocalDateTime.now());
    notification1.setRead(true);
    notification3.setRead(true);

    when(memberRepository.findById(member1.getId())).thenReturn(Optional.of(member1));
    when(notificationRepository.findByMemberIdAndRead(member1.getId(), true)).thenReturn(
        Arrays.asList(notification1, notification3));

    Iterable<Notification> result = notificationService.getNotificationsByReadStatus(
        member1.getId(), true);

    assertEquals(List.of(notification1, notification3), result);
  }

  /**
   * Gets notifications by read status member not found.
   */
  @Test
  void getNotificationsByReadStatusMemberNotFound() {
    long unknownId = 9L;

    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> notificationService.getNotificationsByReadStatus(unknownId, true));

    verify(notificationRepository, never()).findByMemberIdAndRead(anyLong(), anyBoolean());
  }
}