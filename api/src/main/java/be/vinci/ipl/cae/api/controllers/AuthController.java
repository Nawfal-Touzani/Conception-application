package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.api.models.dtos.LoginCredentials;
import be.vinci.ipl.cae.api.models.dtos.RegisterCredentials;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller for managing authentication. Handles user registration, login and automatic
 * re-authentication.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final AuthService authService;

  /**
   * Constructs an AuthController with the given AuthService.
   *
   * @param authService the service used to handle authentication logic
   */
  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  /**
   * Registers a new user.
   *
   * @param registerCredentials the credentials of the user to register
   * @throws ResponseStatusException 409 if a user with the same email already exists
   */
  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public void register(@Valid @RequestBody RegisterCredentials registerCredentials) {
    try {
      authService.register(registerCredentials);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }

  /**
   * Logs in a user and returns an authenticated member with a JWT token.
   *
   * @param loginCredentials the credentials of the user to log in
   * @return the authenticated member with a JWT token
   * @throws ResponseStatusException 401 if the credentials are invalid
   * @throws ResponseStatusException 403 if the member is banned
   */
  @PostMapping("/login")
  public AuthenticatedMember login(@Valid @RequestBody LoginCredentials loginCredentials) {
    try {
      AuthenticatedMember authMember = authService.login(loginCredentials);

      // Unknown user or bad password
      if (authMember == null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
            "Email ou mot de passe incorrect.");
      }

      return authMember;

    } catch (IllegalStateException e) {
      // Member is banned
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
    }
  }

  /**
   * Automatic authentification if in a session case scenario. New 24h token + infos sent.
   *
   * @throws ResponseStatusException 403 if the member is banned
   */
  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public AuthenticatedMember autoLogin(Authentication authentication) {
    Member currentMember = (Member) authentication.getPrincipal();

    // If the member is banned, we block the re-authentication
    // That's a double layer security
    // JWT filter already does this
    if (currentMember.isBan()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Votre compte a été banni.");
    }

    return authService.createJwtToken(currentMember);
  }
}
