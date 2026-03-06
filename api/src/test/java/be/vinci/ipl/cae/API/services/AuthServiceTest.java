package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.api.models.dtos.MemberRegisterRequestDto;
import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // Setup
    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private SpecialityRepository specialityRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private MemberRegisterRequestDto registerDTO;
    private Member dummyMember;
    private Image dummyImage;
    private Speciality dummySpeciality;

    @BeforeEach
    void setUp() {
        registerDTO = new MemberRegisterRequestDto();
        registerDTO.setEmail("test@vinci.be");
        registerDTO.setPassword("password123");
        registerDTO.setTag("Gamer123");
        registerDTO.setImageId(1L);
        registerDTO.setSpecialityId(1L);

        dummyImage = new Image("http://image.url");
        dummyImage.setId(1L);

        dummySpeciality = new Speciality("Architect");
        dummySpeciality.setId(1L);

        dummyMember = new Member("test@vinci.be", "hashedPassword", "Gamer123", false, dummyImage, dummySpeciality);
        dummyMember.setId(1L);
    }

    // REGISTER TESTS
    @Test
    void registerSuccess() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.getEmail())).thenReturn(false);
        when(imageRepository.findById(registerDTO.getImageId())).thenReturn(Optional.of(dummyImage));
        when(specialityRepository.findById(registerDTO.getSpecialityId())).thenReturn(Optional.of(dummySpeciality));
        when(passwordEncoder.encode(registerDTO.getPassword())).thenReturn("hashedPassword");
        when(memberRepository.save(any(Member.class))).thenReturn(dummyMember);

        // Act
        assertDoesNotThrow(() -> authService.register(registerDTO));

        // Assert
        verify(memberRepository, times(1)).save(any(Member.class));
    }

    @Test
    void registerEmailAlreadyExists() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.getEmail())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(registerDTO));
        assertEquals("Email is already in use.", exception.getMessage());

        // Verify
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    void registerImageNotFound() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.getEmail())).thenReturn(false);
        when(imageRepository.findById(registerDTO.getImageId())).thenReturn(Optional.empty()); // Image introuvable

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(registerDTO));
        assertEquals("Image not found.", exception.getMessage());
    }

    @Test
    void registerSpecialityNotFound() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.getEmail())).thenReturn(false);
        when(imageRepository.findById(registerDTO.getImageId())).thenReturn(Optional.of(dummyImage));
        when(specialityRepository.findById(registerDTO.getSpecialityId())).thenReturn(Optional.empty()); // Spécialité introuvable

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(registerDTO));
        assertEquals("Speciality not found.", exception.getMessage());
    }


    // LOGIN TESTS
    @Test
    void loginSuccess() {
        // Arrange
        when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(dummyMember));
        when(passwordEncoder.matches("password123", dummyMember.getPassword())).thenReturn(true);

        // Act
        AuthenticatedMember result = authService.login("test@vinci.be", "password123");

        // Assert
        assertNotNull(result);
        assertEquals("test@vinci.be", result.getEmail());
        assertEquals("Gamer123", result.getTag());
        assertNotNull(result.getToken());
    }

    @Test
    void loginMemberNotFound() {
        // Arrange
        when(memberRepository.findByEmail("wrong@vinci.be")).thenReturn(Optional.empty());

        // Act
        AuthenticatedMember result = authService.login("wrong@vinci.be", "password123");

        // Assert
        assertNull(result);
    }

    @Test
    void loginWrongPassword() {
        // Arrange
        when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(dummyMember));
        when(passwordEncoder.matches("wrongPassword", dummyMember.getPassword())).thenReturn(false);

        // Act
        AuthenticatedMember result = authService.login("test@vinci.be", "wrongPassword");

        // Assert
        assertNull(result);
    }

    // REPO LOGIC TESTS
    @Test
    void readOneFromEmailFound() {
        // Arrange
        when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(dummyMember));

        // Act
        Member result = authService.readOneFromEmail("test@vinci.be");

        // Assert
        assertNotNull(result);
        assertEquals("test@vinci.be", result.getEmail());
    }

    @Test
    void readOneFromEmailNotFound() {
        // Arrange
        when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.empty());

        // Act
        Member result = authService.readOneFromEmail("test@vinci.be");

        // Assert
        assertNull(result);
    }

    // JWT TOKEN TESTS
    @Test
    void createJwtTokenSuccess() {
        // Arrange = dummyMember
        // Act
        AuthenticatedMember result = authService.createJwtToken(dummyMember);

        // Assert
        assertNotNull(result);
        assertEquals("test@vinci.be", result.getEmail());
        assertEquals("Gamer123", result.getTag());
        assertEquals("ROLE_MEMBER", result.getRole());
        assertNotNull(result.getToken());
    }

    @Test
    void verifyJwtTokenValidToken() {
        // Arrange
        AuthenticatedMember authMember = authService.createJwtToken(dummyMember);
        String validToken = authMember.getToken();

        // Act
        String email = authService.verifyJwtToken(validToken);

        // Assert
        assertEquals("test@vinci.be", email);
    }

    @Test
    void verifyJwtTokenInvalidToken() {
        // Arrange
        String invalidToken = "fake.token";

        // Act
        String email = authService.verifyJwtToken(invalidToken);

        // Assert
        assertNull(email);
    }
}