package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.api.models.dtos.LoginCredentials;
import be.vinci.ipl.cae.api.models.dtos.RegisterCredentials;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // Variables
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

    private RegisterCredentials registerDTO;
    private LoginCredentials loginDTO;
    private Member mockMember;
    private Member mockAdmin;
    private Image mockImage;
    private Speciality mockSpeciality;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtSecret", "real-secret");

        registerDTO = new RegisterCredentials("test@vinci.be", "test", "Gamer", 1L, 1L);
        loginDTO = new LoginCredentials("test@vinci.be", "test");
        mockImage = new Image("http://image.url");
        mockSpeciality = new Speciality("Architecte");
        mockMember = new Member("test@vinci.be", "hashedPassword", "Gamer", false, mockImage, mockSpeciality);
        mockAdmin = new Member("admin@vinci.be", "hashedPassword", "Admin", true, mockImage, mockSpeciality);
    }

    // REGISTER TESTS
    @Test
    void registerSuccess() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.email())).thenReturn(false);
        when(imageRepository.findById(registerDTO.imageId())).thenReturn(Optional.of(mockImage));
        when(specialityRepository.findById(registerDTO.specialityId())).thenReturn(Optional.of(mockSpeciality));
        when(passwordEncoder.encode(registerDTO.password())).thenReturn("hashedPassword");

        // Act
        assertDoesNotThrow(() -> authService.register(registerDTO));

        // Assert
        verify(memberRepository, times(1)).save(any(Member.class));
    }

    @Test
    void registerEmailAlreadyExists() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.email())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(registerDTO));
        assertEquals("Email is already in use.", exception.getMessage());

        // Verify
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    void registerImageNotFound() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.email())).thenReturn(false);
        when(imageRepository.findById(registerDTO.imageId())).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(registerDTO));
        assertEquals("Image not found.", exception.getMessage());
    }

    @Test
    void registerSpecialityNotFound() {
        // Arrange
        when(memberRepository.existsByEmail(registerDTO.email())).thenReturn(false);
        when(imageRepository.findById(registerDTO.imageId())).thenReturn(Optional.of(mockImage));
        when(specialityRepository.findById(registerDTO.specialityId())).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(registerDTO));
        assertEquals("Speciality not found.", exception.getMessage());
    }

    // LOGIN TESTS
    @Test
    void loginSuccess() {
        // Arrange
        when(memberRepository.findByEmail(loginDTO.email())).thenReturn(Optional.of(mockMember));
        when(passwordEncoder.matches(loginDTO.password(), mockMember.getPassword())).thenReturn(true);

        // Act
        AuthenticatedMember result = authService.login(loginDTO);

        // Assert
        assertNotNull(result);
        assertEquals("test@vinci.be", result.email());
        assertNotNull(result.token());
    }

    @Test
    void loginMemberNotFound() {
        // Arrange
        when(memberRepository.findByEmail(loginDTO.email())).thenReturn(Optional.empty());

        // Act
        AuthenticatedMember result = authService.login(loginDTO);

        // Assert
        assertNull(result);
    }

    @Test
    void loginWrongPassword() {
        // Arrange
        when(memberRepository.findByEmail(loginDTO.email())).thenReturn(Optional.of(mockMember));
        when(passwordEncoder.matches("wrongPassword", mockMember.getPassword())).thenReturn(false);

        // Act
        LoginCredentials badLogin = new LoginCredentials("test@vinci.be", "wrongPassword");
        AuthenticatedMember result = authService.login(badLogin);

        // Assert
        assertNull(result);
    }

    // REPO TESTS

    @Test
    void readOneFromEmailFound() {
        // Arrange
        when(memberRepository.findByEmail("test@vinci.be")).thenReturn(Optional.of(mockMember));

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
    void createJwtTokenForMember() {
        // Arrange = mock

        // Act
        AuthenticatedMember result = authService.createJwtToken(mockMember);

        // Assert
        assertNotNull(result);
        assertEquals("MEMBER", result.role());
    }

    @Test
    void createJwtTokenForAdmin() {
        // Arrange = mock

        // Act
        AuthenticatedMember result = authService.createJwtToken(mockAdmin);

        // Assert
        assertNotNull(result);
        assertEquals("ADMIN", result.role());
    }

    @Test
    void verifyJwtTokenValidToken() {
        // Arrange
        AuthenticatedMember authMember = authService.createJwtToken(mockMember);
        String validToken = authMember.token();

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