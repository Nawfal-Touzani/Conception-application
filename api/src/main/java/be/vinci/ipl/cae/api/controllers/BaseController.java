package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

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

    if (principal == null || "anonymousUser".equals(principal)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }
    return (Member) principal;
  }
  /**
   * Execute or throw.
   *
   * @param action the action
   */
  protected void executeOrThrow(Runnable action) {
    try {
      action.run();
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (SecurityException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }
}