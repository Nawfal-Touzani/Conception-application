package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.MemberProfileResponseDto;
import be.vinci.ipl.cae.api.models.dtos.UpdateMemberProfileDto;
import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class MemberServiceTest {

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private SpecialityRepository specialityRepository;

  @Mock
  private ImageRepository imageRepository;

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
    member.setProfileCreationDateTime(LocalDateTime.now());
  }

  @Test
  @DisplayName("Should return profile DTO when member exists")
  void getProfile_ShouldReturnDTO_WhenMemberExists() {
    when(memberRepository.findByEmail(email)).thenReturn(Optional.of(member));

    MemberProfileResponseDto result = memberService.getProfile(email);

    assertNotNull(result);
    assertEquals(email, result.getEmail());
    assertEquals("Architect", result.getSpeciality());
    verify(memberRepository).findByEmail(email);
  }

  @Test
  @DisplayName("Should return null when member doesn't exists")
  void getProfile_ShouldReturnNull_WhenMemberNotExists() {
    when(memberRepository.findByEmail(email)).thenReturn(Optional.empty());

    MemberProfileResponseDto result = memberService.getProfile(email);

    assertNull(result);
  }

  @Test
  @DisplayName("Should update profile and return new DTO")
  void updateProfile_ShouldUpdateAndReturnDTO() {
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

    MemberProfileResponseDto result = memberService.updateProfile(email, payload);

    assertNotNull(result);
    verify(memberRepository).save(any(Member.class));
    assertEquals("Gardien", result.getSpeciality());
    assertEquals("img2.png", result.getProfileImage());
  }

}
