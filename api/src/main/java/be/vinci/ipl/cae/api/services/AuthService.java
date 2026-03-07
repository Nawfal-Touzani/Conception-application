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
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling authentication operations including member registration,
 * login, and JWT token management.
 * JWT tokens are signed using HMAC256 with a secret injected via environment
 * variable and have a lifetime of 24 hours.
 */
@Service
public class AuthService {

  // 24h lifetime
  private static final long JWT_LIFETIME = 24 * 60 * 60 * 1000;
  private final BCryptPasswordEncoder passwordEncoder;
  private final MemberRepository memberRepository;
  private final ImageRepository imageRepository;
  private final SpecialityRepository specialityRepository;
  // Secret injection by .env
  @Value("${JWT_SECRET}")
  private String jwtSecret;

  /**
   * Constructor of the required dependencies.
   *
   * @param passwordEncoder        encoder used to hash and verify passwords
   * @param memberRepository       repository for member persistence and lookup
   * @param imageRepository        repository used to validate the profile image on registration
   * @param specialityRepository   repository used to validate the speciality on registration
   */
  public AuthService(BCryptPasswordEncoder passwordEncoder, MemberRepository memberRepository,
      ImageRepository imageRepository, SpecialityRepository specialityRepository) {
    this.passwordEncoder = passwordEncoder;
    this.memberRepository = memberRepository;
    this.imageRepository = imageRepository;
    this.specialityRepository = specialityRepository;
  }

  /**
   * Register a new member. No automatic authentification. No token, we only save the member.
   */
  public void register(RegisterCredentials registerCredentials) {
    // Verifications
    if (memberRepository.existsByEmail(registerCredentials.email())) {
      throw new IllegalArgumentException("Email is already in use.");
    }

    Image image = imageRepository.findById(registerCredentials.imageId())
        .orElseThrow(() -> new IllegalArgumentException("Image not found."));

    Speciality speciality = specialityRepository.findById(registerCredentials.specialityId())
        .orElseThrow(() -> new IllegalArgumentException("Speciality not found."));

    // Add to database
    Member newMember = new Member();
    newMember.setEmail(registerCredentials.email());
    newMember.setPassword(passwordEncoder.encode(registerCredentials.password()));
    newMember.setTag(registerCredentials.tag());
    newMember.setAdmin(false); // By default
    newMember.setImage(image);
    newMember.setSpeciality(speciality);

    memberRepository.save(newMember);
  }

  /**
   * Login a member.
   */
  public AuthenticatedMember login(LoginCredentials loginCredentials) {
    Member member = memberRepository.findByEmail(loginCredentials.email()).orElse(null);
    if (member == null || !passwordEncoder.matches(loginCredentials.password(),
        member.getPassword())) {
      return null; // unknown user or bad password
    }

    return createJwtToken(member);
  }

  /**
   * Create a JWT token and populate the AuthenticatedMember DTO.
   */
  public AuthenticatedMember createJwtToken(Member member) {
    Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

    String token = JWT.create().withIssuer("auth0").withClaim("email", member.getEmail())
        .withIssuedAt(new Date()).withExpiresAt(new Date(System.currentTimeMillis() + JWT_LIFETIME))
        .sign(algorithm);

    // For the front (JSON)
    String role;
    if (member.isAdmin()) {
      role = "ADMIN";
    } else {
      role = "MEMBER";
    }

    return new AuthenticatedMember(member.getId(), member.getEmail(), member.getTag(), role, token);
  }

  /**
   * Verify a JWT token and return the email.
   */
  public String verifyJwtToken(String token) {
    try {
      Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
      return JWT.require(algorithm).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Read a member from its email.
   */
  public Member readOneFromEmail(String email) {
    return memberRepository.findByEmail(email).orElse(null);
  }
}
