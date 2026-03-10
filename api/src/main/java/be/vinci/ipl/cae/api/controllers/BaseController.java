package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * The type Base controller.
 */
public abstract class BaseController {

  protected final MemberRepository memberRepository;

  /**
   * Instantiates a new Base controller.
   *
   * @param memberRepository the member repository
   */
  protected BaseController(MemberRepository memberRepository) {
    this.memberRepository = memberRepository;
  }

  /**
   * Get connected member.
   *
   * @return the member
   */
  protected Member getConnectedMember() {

    Object principal = SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();

    if (principal == null || principal.equals("anonymousUser")) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.UNAUTHORIZED, "Not authenticated");
    }

    return (Member) principal;
  }
}