package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Banishment;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.repositories.BanishmentRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class BanishmentService {

  private final BanishmentRepository banishmentRepository;
  private final MemberRepository memberRepository;

  public BanishmentService(BanishmentRepository banishmentRepository,
      MemberRepository memberRepository) {
    this.banishmentRepository = banishmentRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Bans a member and updates their status.
   *
   * @param memberId the id of the member to ban
   * @param adminId  the id of the admin who perform the ban
   * @param reason   reason for the banishment
   */
  @Transactional
  public void banMember(Long memberId, Long adminId, String reason) {
    Member memberToBan = findMember(memberId);
    Member admin = findMember(adminId);

    validateBanishmen(memberToBan);
    applyBanishment(memberToBan);

    Banishment banishment = new Banishment(memberToBan, admin, LocalDate.now(), reason);
    banishmentRepository.save(banishment);
  }

  private Member findMember(Long id) {
    return memberRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Membre introuvable"));
  }

  private void validateBanishmen(Member member) {
    if (member.isBan() || banishmentRepository.existsByBannedMemberId(member.getId())) {
      throw new IllegalArgumentException("Ce membre est déja banni");
    }
  }

  private void applyBanishment(Member member) {
    member.setBan(true);
    memberRepository.save(member);
  }
}

