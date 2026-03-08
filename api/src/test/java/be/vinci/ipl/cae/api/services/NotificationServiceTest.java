package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  Notification notification1;
  Notification notification2;
  Member member1;


  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private MemberRepository memberRepository;
  @InjectMocks
  private NotificationService notificationService;

  @BeforeEach
  void setUp() {
    notification1 = new Notification(Type.RESULT, "resultat du match 1-0", LocalDateTime.now());
    notification2 = new Notification(Type.TOURNAMENT, "TOURNOI commence le 4 mars",
        LocalDateTime.now());
    member1 = new Member("test@test.com", "password", "tag1", false, null,
        null);
    member1.setId(1L);

  }

  @Test
  void getAllNotificationByMember() {
    notification1.setMember(member1);
    notification2.setMember(member1);

    when(memberRepository.findById(member1.getId())).thenReturn(Optional.of(member1));
    when(notificationRepository.findByMemberId(member1.getId()))
        .thenReturn(Arrays.asList(notification1, notification2));

    Iterable<Notification> result = notificationService.getAllNotificationByMember(member1.getId());

    assertEquals(List.of(notification1, notification2), result);
  }

  @Test
  void getAllNotificationByMemberNull() {
    long unknowId = 23;

    when(memberRepository.findById(unknowId)).thenReturn(Optional.empty());

    Iterable<Notification> result = notificationService.getAllNotificationByMember(unknowId);

    assertNull(result);
    verify(notificationRepository, never()).findByMemberId(unknowId);
  }

  @Test
  void send() {
    when(memberRepository.findById(member1.getId())).thenReturn(Optional.of(member1));

    when(notificationRepository.save(notification1)).thenReturn(notification1);

    Notification result = notificationService.send(member1.getId(), notification1);

    assertEquals(notification1, result);
  }

  @Test
  void sendWhenMemberNull() {
    long unknowId = 76;

    when(memberRepository.findById(unknowId)).thenReturn(Optional.empty());

    Notification result = notificationService.send(unknowId, notification2);

    assertNull(result);
    verify(notificationRepository, never()).save(notification2);
  }

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

  @Test
  void markNotificationReadNull() {
    long unknowId = 9L;
    when(notificationRepository.findById(unknowId)).thenReturn(Optional.empty());

    Notification result = notificationService.markNotificationRead(unknowId);

    assertNull(result);
    verify(notificationRepository, never()).save(any());
  }

  @Test
  void getNotificationReadStatus() {
    Notification notification3 = new Notification(Type.RESULT, "ex", LocalDateTime.now());
    notification1.setRead(true);
    notification3.setRead(true);

    when(memberRepository.findById(member1.getId())).thenReturn(Optional.of(member1));

    when(notificationRepository.findByMemberIdAndRead(member1.getId(),true)).thenReturn(
            Arrays.asList(notification1, notification3));

    Iterable<Notification> result = notificationService.getNotificationsByReadStatus(
        member1.getId(), true);

    assertEquals(List.of(notification1, notification3), result);
  }

  @Test
  void getNotificationReadStatusNull(){
    long unknownId = 9L;

    when(memberRepository.findById(unknownId)).thenReturn(Optional.empty());

    Iterable<Notification> result =
        notificationService.getNotificationsByReadStatus(unknownId, true);

    assertNull(result);
    verify(notificationRepository, never()).findByMemberIdAndRead(anyLong(), anyBoolean());
  }
}