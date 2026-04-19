package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.BanishMemberDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.services.BanishmentService;
import jakarta.validation.Valid;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST Controller responsable for managing banishments. Only administrators are allowed to access
 * these endpoints.
 */
@RestController
@RequestMapping("/admin/banishments")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class BanishmentController {

  private final BanishmentService banishmentService;

  /**
   * Creates a new BanishmentController.
   *
   * @param banishmentService service used to handle banishment operations
   */
  public BanishmentController(BanishmentService banishmentService) {
    this.banishmentService = banishmentService;
  }

  /**
   * Bans a member by their ID.
   *
   * @param memberId       the ID of the member to ban
   * @param req            request body containing the reason for the banishment
   * @param authentication the current authenticated admin
   * @throws ResponseStatusException NOT_FOUND if the member does not exist
   * @throws ResponseStatusException CONFLICT if the member is already banished or cannot be banned
   * @throws ResponseStatusException INTERNAL_SERVER_ERROR if an unexpected error occurs
   */
  @PostMapping("/{memberId}")
  public void banMember(
      @PathVariable Long memberId,
      @RequestBody @Valid BanishMemberDto req,
      Authentication authentication) {
    Member admin = (Member) authentication.getPrincipal();
    banishmentService.banMember(memberId, admin.getId(), req.reason());
  }
}
