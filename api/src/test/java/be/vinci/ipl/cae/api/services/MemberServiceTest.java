package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.ChangePasswordDto;
import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Unit tests for MemberService logic.
 */
@ExtendWith(MockitoExtension.class)
public class MemberServiceTest {

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private SpecialityRepository specialityRepository;

  @Mock
  private ImageRepository imageRepository;

  @Mock
  private BCryptPasswordEncoder passwordEncoder;

  @Mock
  private TeamCompositionRepository teamCompositionRepository;

  @InjectMocks
  MemberService memberService;

  private Member member;
  private Speciality speciality;
  private Image image;
  private final String email = "test@gmail.com";

  @BeforeEach
  void setUp() {
    speciality = new Speciality();
    speciality.setName("Architect");

    image = new Image();
    image.setUrl("img1.png");

    member = new Member();
    member.setEmail(email);
    member.setTag("PlayerOne");
    member.setSpeciality(speciality);
    member.setImage(image);
    member.setProfileCreationDate(LocalDate.now());
  }

  @Test
  @DisplayName("Should return profile DTO when member exists")
  void getProfile1() {
    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findByMemberId(any())).thenReturn(Optional.empty());

    MemberProfileResponseDto result = memberService.getProfile(email);

    assertNotNull(result);
    assertEquals(email, result.getEmail());
    assertEquals("Architect", result.getSpeciality());
    verify(memberRepository).findByEmail(email);
  }

  @Test
  @DisplayName("Should return null when member doesn't exists")
  void getProfile2() {
    when(memberRepository.findByEmail(email)).thenReturn(Optional.empty());

    MemberProfileResponseDto result = memberService.getProfile(email);

    assertNull(result);
  }

  @Test
  @DisplayName("Should include team name when member has a team")
  void getProfile3() {

    Team team = new Team();
    team.setName("Vinci");

    TeamComposition composition = new TeamComposition();
    composition.setTeam(team);

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findByMemberId(any()))
        .thenReturn(Optional.of(composition));

    MemberProfileResponseDto result = memberService.getProfile(email);

    assertNotNull(result);
    assertEquals("Vinci", result.getTeamName());
  }

  @Test
  @DisplayName("Should update profile and return new DTO")
  void updateProfile1() {
    UpdateMemberProfileDto payload = new UpdateMemberProfileDto();
    payload.setSpeciality("Gardien");
    payload.setProfileImage("img2.png");

    Speciality newSpec = new Speciality();
    newSpec.setName("Gardien");
    Image newImg = new Image();
    newImg.setUrl("img2.png");

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(specialityRepository.findByName("Gardien")).thenReturn(Optional.of(newSpec));
    when(imageRepository.findByUrl("img2.png")).thenReturn(Optional.of(newImg));
    when(teamCompositionRepository.findByMemberId(any())).thenReturn(Optional.empty());

    MemberProfileResponseDto result = memberService.updateProfile(email, payload);

    assertNotNull(result);
    verify(memberRepository).save(any(Member.class));
    assertEquals("Gardien", result.getSpeciality());
    assertEquals("img2.png", result.getProfileImage());
  }

  @Test
  @DisplayName("Should not update speciality or image if they don't exist in DB")
  void updateProfile2() {
    UpdateMemberProfileDto payload = new UpdateMemberProfileDto();
    payload.setSpeciality("Strange");
    payload.setProfileImage("nonExisting.png");

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(specialityRepository.findByName("Strange")).thenReturn(Optional.empty());
    when(imageRepository.findByUrl("nonExisting.png")).thenReturn(Optional.empty());
    when(teamCompositionRepository.findByMemberId(any())).thenReturn(Optional.empty());

    MemberProfileResponseDto result = memberService.updateProfile(email, payload);

    assertNotNull(result);
    assertEquals("Architect", result.getSpeciality());
    assertEquals("img1.png", result.getProfileImage());
    verify(memberRepository).save(member);
  }

  @Test
  @DisplayName("Should return null when updating a non-existent member")
  void updateProfile3() {
    when(memberRepository.findByEmail(email)).thenReturn(Optional.empty());

    MemberProfileResponseDto result = memberService.updateProfile(email,
        new UpdateMemberProfileDto());

    assertNull(result);
    verify(memberRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should skip updates when payload fields are null")
  void updateProfile4() {
    UpdateMemberProfileDto payload = new UpdateMemberProfileDto();
    payload.setSpeciality(null);
    payload.setProfileImage(null);

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(teamCompositionRepository.findByMemberId(any())).thenReturn(Optional.empty());

    memberService.updateProfile(email, payload);

    verify(specialityRepository, never()).findByName(any());
    verify(imageRepository, never()).findByUrl(any());
    verify(memberRepository).save(member);
  }

  @Test
  @DisplayName("Should change password when old password matches")
  void changePassword1() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("oldPswd");
    dto.setNewPassword("newPswd");
    dto.setConfirmPassword("newPswd");

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(passwordEncoder.matches("oldPswd", member.getPassword())).thenReturn(true);
    when(passwordEncoder.encode("newPswd")).thenReturn("hashedNewPswd");

    boolean result = memberService.changePassword(email, dto);

    assertTrue(result);
    assertEquals("hashedNewPswd", member.getPassword());
    verify(memberRepository).save(member);
  }

  @Test
  @DisplayName("Should return false when old password doesn't matches")
  void changePassword2() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("wrongPswd");
    dto.setNewPassword("newPswd");
    dto.setConfirmPassword("newPswd");

    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));
    when(passwordEncoder.matches("wrongPswd", member.getPassword())).thenReturn(false);

    boolean result = memberService.changePassword(email, dto);

    assertFalse(result);
    verify(memberRepository, never()).save(member);
  }

  @Test
  @DisplayName("Should return false when member not found")
  void changePassword3() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("oldPswd");
    dto.setNewPassword("newPswd");
    dto.setConfirmPassword("newPswd");

    when(memberRepository.findByEmail(email)).thenReturn(Optional.empty());

    boolean result = memberService.changePassword(email, dto);

    assertFalse(result);
  }

  @Test
  @DisplayName("Should return false when new password and confirmation do not match")
  void changePassword4() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("oldPswd");
    dto.setNewPassword("newPswd");
    dto.setConfirmPassword("Pswd");

    boolean result = memberService.changePassword(email, dto);

    assertFalse(result);
    verify(memberRepository, never()).findByEmail(any());
  }

  @Test
  @DisplayName("Should return false when new password is the same as old password")
  void changePassword5() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("PswdVinci");
    dto.setNewPassword("PswdVinci");
    dto.setConfirmPassword("PswdVinci");

    boolean result = memberService.changePassword(email, dto);

    assertFalse(result);
    verify(memberRepository, never()).findByEmail(any());
  }

  @Test
  @DisplayName("Should return false when new password is null")
  void changePassword6() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("old");
    dto.setNewPassword(null);
    assertFalse(memberService.changePassword(email, dto));
  }

  @Test
  @DisplayName("Should return false when ChangePasswordDto is null")
  void changePassword7() {
    boolean result = memberService.changePassword(email, null);
    assertFalse(result);
  }

  @Test
  @DisplayName("Should return false when old password is null in DTO")
  void changePassword8() {
    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword(null);
    dto.setNewPassword("newPswd");
    dto.setConfirmPassword("newPswd");

    boolean result = memberService.changePassword(email, dto);
    assertFalse(result);
  }

  @Test
  @DisplayName("Should return false when confirm password is null")
  void changePassword9() {

    ChangePasswordDto dto = new ChangePasswordDto();
    dto.setOldPassword("old");
    dto.setNewPassword("new");
    dto.setConfirmPassword(null);

    boolean result = memberService.changePassword(email, dto);

    assertFalse(result);
  }

  @Test
  @DisplayName("Should promote a member to admin successfully")
  void promoteToAdmin_success() {
    member.setIsAdmin(false);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

    memberService.promoteToAdmin(1L);

    assertTrue(member.getIsAdmin());
    verify(memberRepository).save(member);
  }

  @Test
  @DisplayName("Should throw exception if member is already admin")
  void promoteToAdmin_alreadyAdmin() {
    member.setIsAdmin(true);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      memberService.promoteToAdmin(1L);
    });

    assertEquals("Member is already an administrator", exception.getMessage());
    verify(memberRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should throw exception if member not found")
  void promoteToAdmin_memberNotFound() {
    when(memberRepository.findById(1L)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      memberService.promoteToAdmin(1L);
    });

    assertEquals("Member not found", exception.getMessage());
    verify(memberRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should demote admin successfully when not last admin")
  void demoteFromAdmin_success() {
    member.setIsAdmin(true);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
    when(memberRepository.countByIsAdminTrue()).thenReturn(2L);

    memberService.demoteFromAdmin(1L);

    assertFalse(member.getIsAdmin());
    verify(memberRepository).save(member);
  }

  @Test
  @DisplayName("Should throw exception if member is not admin")
  void demoteFromAdmin_notAdmin() {
    member.setIsAdmin(false);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      memberService.demoteFromAdmin(1L);
    });

    assertEquals("Member is not an administrator", exception.getMessage());
    verify(memberRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should throw exception if trying to remove last admin")
  void demoteFromAdmin_lastAdmin() {
    member.setIsAdmin(true);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
    when(memberRepository.countByIsAdminTrue()).thenReturn(1L);

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      memberService.demoteFromAdmin(1L);
    });

    assertEquals("Cannot remove the last administrator", exception.getMessage());
    verify(memberRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should throw exception if member not found when demoting")
  void demoteFromAdmin_memberNotFound() {
    when(memberRepository.findById(1L)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      memberService.demoteFromAdmin(1L);
    });

    assertEquals("Member not found", exception.getMessage());
    verify(memberRepository, never()).save(any());
  }


}
