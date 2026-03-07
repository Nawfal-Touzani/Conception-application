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
    String username = (String) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    return memberRepository.findByEmail(username)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Member not found"));
  }
}