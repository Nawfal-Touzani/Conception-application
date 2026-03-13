package be.vinci.ipl.cae.api.configuration;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


/**
 * Configuration class for the BCryptPasswordEncoder.
 */
@Configuration
public class BcryptConfiguration {

  /**
   * Bean for the BCryptPasswordEncoder.
   *
   * @return the BCryptPasswordEncoder
   */
  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * Bean for initializing default users in the database.
   * Creates a default admin and a default user if they do not already exist,
   * along with a default image and a default speciality if none are present.
   *
   * @param memberRepository     the repository for managing members
   * @param imageRepository      the repository for managing images
   * @param specialityRepository the repository for managing specialities
   * @param passwordEncoder      the BCryptPasswordEncoder for encoding passwords
   * @return a CommandLineRunner that initializes the default users
   */
  @Bean
  public CommandLineRunner initUsers(MemberRepository memberRepository,
                                     ImageRepository imageRepository,
                                     SpecialityRepository specialityRepository,
                                     TeamRepository teamRepository,
                                     TeamCompositionRepository teamCompositionRepository,
                                     BCryptPasswordEncoder passwordEncoder) {
    return args -> {


      // 20 Images in DB
      List<String> imageUrls = List.of(
          "/images/avatar01.png",
          "/images/avatar02.png",
          "/images/avatar03.png",
          "/images/avatar04.png",
          "/images/avatar05.png",
          "/images/avatar06.png",
          "/images/avatar07.png",
          "/images/avatar08.png",
          "/images/avatar09.png",
          "/images/avatar10.png",
          "/images/avatar11.png",
          "/images/avatar12.png",
          "/images/avatar13.png",
          "/images/avatar14.png",
          "/images/avatar15.png",
          "/images/avatar16.png",
          "/images/avatar17.png",
          "/images/avatar18.png",
          "/images/avatar19.png",
          "/images/avatar20.png"
      );

      for (String url : imageUrls) {
        if (imageRepository.findByUrl(url).isEmpty()) {
          Image i = new Image(url);
          imageRepository.save(i);
        }
      }

      // All Speciality in DB
      List<String> specialityNames = List.of(
          "architecte",
          "catalyseur",
          "exécuteur",
          "gardien",
          "guérisseur",
          "perturbateur",
          "tacticien"
      );

      for (String name : specialityNames) {
        if (specialityRepository.findByName(name).isEmpty()) {
          Speciality s = new Speciality(name);
          specialityRepository.save(s);
        }
      }

      // Members & Admins in DB
      Speciality tacticien = specialityRepository.findByName("tacticien").orElseThrow();

      if (!memberRepository.existsByEmail("lea@mail.com")) {
        Member lea = new Member();
        lea.setEmail("lea@mail.com");
        lea.setPassword(passwordEncoder.encode("lea"));
        lea.setTag("Lynx");
        lea.setIsAdmin(false);
        lea.setImage(imageRepository.findAll().getFirst());
        lea.setSpeciality(tacticien);
        lea.setProfileCreationDate(LocalDate.of(2025, 11, 12));

        memberRepository.save(lea);
      }

      Speciality executeur = specialityRepository.findByName("exécuteur").orElseThrow();

      if (!memberRepository.existsByEmail("tom@mail.com")) {
        Member tom = new Member();
        tom.setEmail("tom@mail.com");
        tom.setPassword(passwordEncoder.encode("tom"));
        tom.setTag("Rogue");
        tom.setIsAdmin(false);
        tom.setImage(imageRepository.findAll().get(3));
        tom.setSpeciality(executeur);
        tom.setProfileCreationDate(LocalDate.of(2025, 12, 3));

        memberRepository.save(tom);
      }

      Speciality guerisseur = specialityRepository.findByName("guérisseur").orElseThrow();

      if (!memberRepository.existsByEmail("ines@mail.com")) {
        Member ines = new Member();
        ines.setEmail("ines@mail.com");
        ines.setPassword(passwordEncoder.encode("ines"));
        ines.setTag("Pulse");
        ines.setIsAdmin(true);
        ines.setImage(imageRepository.findAll().get(15));
        ines.setSpeciality(guerisseur);
        ines.setProfileCreationDate(LocalDate.of(2026, 1, 18));

        memberRepository.save(ines);
      }

      Speciality gardien = specialityRepository.findByName("gardien").orElseThrow();

      if (!memberRepository.existsByEmail("tibo@mail.com")) {
        Member tibo = new Member();
        tibo.setEmail("tibo@mail.com");
        tibo.setPassword(passwordEncoder.encode("tibo"));
        tibo.setTag("Iron");
        tibo.setIsAdmin(true);
        tibo.setImage(imageRepository.findAll().get(19));
        tibo.setSpeciality(gardien);
        tibo.setProfileCreationDate(LocalDate.of(2025, 10, 27));

        memberRepository.save(tibo);
      }

      // Defaults in DB
      Speciality defaultSpeciality = specialityRepository.findAll().getFirst();
      Image defaultImage = imageRepository.findAll().get(11);

      if (!memberRepository.existsByEmail("admin@vinci.be")) {
        Member admin = new Member();
        admin.setEmail("admin@vinci.be");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setTag("Admin");
        admin.setIsAdmin(true);
        admin.setImage(defaultImage);
        admin.setSpeciality(defaultSpeciality);
        admin.setProfileCreationDate(LocalDate.now());

        memberRepository.save(admin);
      }

      if (!memberRepository.existsByEmail("member@vinci.be")) {
        Member member = new Member();
        member.setEmail("member@vinci.be");
        member.setPassword(passwordEncoder.encode("member"));
        member.setTag("Member");
        member.setIsAdmin(false);
        member.setImage(defaultImage);
        member.setSpeciality(defaultSpeciality);
        member.setProfileCreationDate(LocalDate.now());

        memberRepository.save(member);
      }

      // Teams
      Member lea = memberRepository.findByEmail("lea@mail.com").orElseThrow();
      Member tibo = memberRepository.findByEmail("tibo@mail.com").orElseThrow();

      if (!teamRepository.existsByName("TEAM_ALPHA")) {
        Team teamAlpha = new Team("TEAM_ALPHA", true, LocalDateTime.now(), lea, null);
        teamRepository.save(teamAlpha);
      }

      if (!teamRepository.existsByName("TEAM_OMEGA")) {
        Team teamOmega = new Team("TEAM_OMEGA", true, LocalDateTime.now(), tibo, null);
        teamRepository.save(teamOmega);
      }

      // Affectations
      Member tom = memberRepository.findByEmail("tom@mail.com").orElseThrow();
      Member ines = memberRepository.findByEmail("ines@mail.com").orElseThrow();

      Team teamAlpha = teamRepository.findByName("TEAM_ALPHA").orElseThrow();

      if (!teamCompositionRepository.existsByMemberId(lea.getId())) {
        teamCompositionRepository.save(new TeamComposition(lea, teamAlpha, LocalDateTime.now()));
      }
      if (!teamCompositionRepository.existsByMemberId(tom.getId())) {
        teamCompositionRepository.save(new TeamComposition(tom, teamAlpha, LocalDateTime.now()));
      }
      if (!teamCompositionRepository.existsByMemberId(ines.getId())) {
        teamCompositionRepository.save(new TeamComposition(ines, teamAlpha, LocalDateTime.now()));
      }

      Team teamOmega = teamRepository.findByName("TEAM_OMEGA").orElseThrow();

      if (!teamCompositionRepository.existsByMemberId(tibo.getId())) {
        teamCompositionRepository.save(new TeamComposition(tibo, teamOmega, LocalDateTime.now()));
      }
    };
  }
}
