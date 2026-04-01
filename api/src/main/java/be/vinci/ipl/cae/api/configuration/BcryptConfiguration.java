package be.vinci.ipl.cae.api.configuration;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.models.entities.TournamentRegistration;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
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

  private Tournament buildTournament(String name, String description,
                                     LocalDate startDate, LocalDate endDate, LocalDate deadline,
                                     int maxParticipants, Status status, boolean isPublic, Member organizer) {
    Tournament t = new Tournament();
    t.setName(name);
    t.setDescription(description);
    t.setStartDate(startDate);
    t.setEndDate(endDate);
    t.setRegistrationDeadline(deadline);
    t.setMaxParticipants(maxParticipants);
    t.setStatus(status);
    t.setPublic(isPublic);
    t.setOrganizer(organizer);
    return t;
  }

  private Member buildMember(String email, String password, String tag, boolean isAdmin,
                             Image image, Speciality speciality, LocalDate creationDate,
                             BCryptPasswordEncoder passwordEncoder) {
    Member member = new Member();
    member.setEmail(email);
    member.setPassword(passwordEncoder.encode(password));
    member.setTag(tag);
    member.setIsAdmin(isAdmin);
    member.setImage(image);
    member.setSpeciality(speciality);
    member.setProfileCreationDate(creationDate);
    return member;
  }

  private void createMemberAndTeam(String email, String password, String tag,
                                   Speciality speciality, Image image, LocalDate creationDate,
                                   String teamName, MemberRepository memberRepository,
                                   TeamRepository teamRepository,
                                   TeamCompositionRepository teamCompositionRepository,
                                   BCryptPasswordEncoder passwordEncoder) {
    if (!memberRepository.existsByEmail(email)) {
      memberRepository.save(buildMember(email, password, tag, false,
          image, speciality, creationDate, passwordEncoder));
    }
    if (!teamRepository.existsByName(teamName)) {
      Member responsible = memberRepository.findByEmail(email).orElseThrow();
      teamRepository.save(new Team(teamName, true, LocalDateTime.now(), responsible, null));
    }
    Member responsible = memberRepository.findByEmail(email).orElseThrow();
    if (!teamCompositionRepository.existsByMemberId(responsible.getId())) {
      Team team = teamRepository.findByName(teamName).orElseThrow();
      teamCompositionRepository.save(new TeamComposition(responsible, team, LocalDateTime.now()));
    }
  }

  private void registerTeam(TournamentRegistrationRepository registrationRepository,
                            Tournament tournament, Team team) {
    boolean alreadyRegistered = registrationRepository
        .findByTournamentId(tournament.getId())
        .stream()
        .anyMatch(r -> r.getTeam().getId().equals(team.getId()));
    if (!alreadyRegistered) {
      TournamentRegistration registration = new TournamentRegistration();
      registration.setTournament(tournament);
      registration.setTeam(team);
      registration.setRegistrationDate(LocalDate.now());
      registrationRepository.save(registration);
    }
  }

  private void setupTournament(String tournamentName, Team winner,
                               List<Team> teams, TournamentRepository tournamentRepository,
                               TournamentRegistrationRepository registrationRepository) {
    if (!tournamentRepository.existsByName(tournamentName)) {
      return;
    }
    Tournament t = tournamentRepository.findByName(tournamentName).orElseThrow();
    if (winner != null && t.getWinnerTeam() == null) {
      t.setWinnerTeam(winner);
      tournamentRepository.save(t);
    }
    for (Team team : teams) {
      registerTeam(registrationRepository, t, team);
    }
  }

  /**
   * Bean for initializing default users in the database.
   *
   * @param memberRepository          the member repository
   * @param imageRepository           the image repository
   * @param specialityRepository      the speciality repository
   * @param teamRepository            the team repository
   * @param teamCompositionRepository the team composition repository
   * @param tournamentRepository      the tournament repository
   * @param registrationRepository    the registration repository
   * @param passwordEncoder           the password encoder
   * @return the command line runner
   */
  @Bean
  public CommandLineRunner initUsers(MemberRepository memberRepository,
                                     ImageRepository imageRepository,
                                     SpecialityRepository specialityRepository,
                                     TeamRepository teamRepository,
                                     TeamCompositionRepository teamCompositionRepository,
                                     TournamentRepository tournamentRepository,
                                     TournamentRegistrationRepository registrationRepository,
                                     BCryptPasswordEncoder passwordEncoder) {
    return args -> {

      // 20 Images in DB
      List<String> imageUrls = List.of(
          "/images/avatar01.png", "/images/avatar02.png", "/images/avatar03.png",
          "/images/avatar04.png", "/images/avatar05.png", "/images/avatar06.png",
          "/images/avatar07.png", "/images/avatar08.png", "/images/avatar09.png",
          "/images/avatar10.png", "/images/avatar11.png", "/images/avatar12.png",
          "/images/avatar13.png", "/images/avatar14.png", "/images/avatar15.png",
          "/images/avatar16.png", "/images/avatar17.png", "/images/avatar18.png",
          "/images/avatar19.png", "/images/avatar20.png"
      );

      for (String url : imageUrls) {
        if (imageRepository.findByUrl(url).isEmpty()) {
          imageRepository.save(new Image(url));
        }
      }

      // All Speciality in DB
      List<String> specialityNames = List.of(
          "architecte", "catalyseur", "exécuteur", "gardien",
          "guérisseur", "perturbateur", "tacticien"
      );

      for (String name : specialityNames) {
        if (specialityRepository.findByName(name).isEmpty()) {
          specialityRepository.save(new Speciality(name));
        }
      }

      // Specialities
      final Speciality tacticien = specialityRepository.findByName("tacticien").orElseThrow();
      final Speciality executeur = specialityRepository.findByName("exécuteur").orElseThrow();
      final Speciality guerisseur = specialityRepository.findByName("guérisseur").orElseThrow();
      final Speciality gardien = specialityRepository.findByName("gardien").orElseThrow();
      final Speciality architecte = specialityRepository.findByName("architecte").orElseThrow();
      final Speciality catalyseur = specialityRepository.findByName("catalyseur").orElseThrow();
      final Speciality perturbateur =
          specialityRepository.findByName("perturbateur").orElseThrow();
      final Speciality defaultSpeciality = specialityRepository.findAll().getFirst();
      final Image defaultImage = imageRepository.findAll().get(11);

      // Members & Admins in DB
      if (!memberRepository.existsByEmail("lea@mail.com")) {
        memberRepository.save(buildMember("lea@mail.com", "lea", "Lynx", false,
            imageRepository.findAll().getFirst(), tacticien,
            LocalDate.of(2025, 11, 12), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("tom@mail.com")) {
        memberRepository.save(buildMember("tom@mail.com", "tom", "Rogue", false,
            imageRepository.findAll().get(3), executeur,
            LocalDate.of(2025, 12, 3), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("ines@mail.com")) {
        memberRepository.save(buildMember("ines@mail.com", "ines", "Pulse", true,
            imageRepository.findAll().get(15), guerisseur,
            LocalDate.of(2026, 1, 18), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("tibo@mail.com")) {
        memberRepository.save(buildMember("tibo@mail.com", "tibo", "Iron", true,
            imageRepository.findAll().get(19), gardien,
            LocalDate.of(2025, 10, 27), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("admin@vinci.be")) {
        memberRepository.save(buildMember("admin@vinci.be", "admin", "Admin", true,
            defaultImage, defaultSpeciality, LocalDate.now(), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("member@vinci.be")) {
        memberRepository.save(buildMember("member@vinci.be", "member", "Member", false,
            defaultImage, defaultSpeciality, LocalDate.now(), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("banni@vinci.be")) {
        Member banni = buildMember("banni@vinci.be", "banni", "Banni", false,
            defaultImage, defaultSpeciality, LocalDate.now(), passwordEncoder);
        banni.setBan(true);
        memberRepository.save(banni);
      }

      // ── TEAM_IOTA members (lisa=responsible, noa=second responsible, tim, zoe) ──
      if (!memberRepository.existsByEmail("lisa@mail.com")) {
        memberRepository.save(buildMember("lisa@mail.com", "lisa", "Storm", false,
            imageRepository.findAll().get(2), executeur,
            LocalDate.of(2026, 1, 10), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("noa@mail.com")) {
        memberRepository.save(buildMember("noa@mail.com", "noa", "Flash", false,
            imageRepository.findAll().get(4), architecte,
            LocalDate.of(2026, 2, 2), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("tim@mail.com")) {
        memberRepository.save(buildMember("tim@mail.com", "tim", "Titi", false,
            imageRepository.findAll().get(5), gardien,
            LocalDate.of(2026, 2, 3), passwordEncoder));
      }

      if (!memberRepository.existsByEmail("zoe@mail.com")) {
        memberRepository.save(buildMember("zoe@mail.com", "zoe", "Vector", false,
            imageRepository.findAll().get(6), catalyseur,
            LocalDate.of(2026, 2, 4), passwordEncoder));
      }

      // Teams
      Member lea = memberRepository.findByEmail("lea@mail.com").orElseThrow();
      Member tibo = memberRepository.findByEmail("tibo@mail.com").orElseThrow();
      Member lisa = memberRepository.findByEmail("lisa@mail.com").orElseThrow();
      Member noa = memberRepository.findByEmail("noa@mail.com").orElseThrow();

      if (!teamRepository.existsByName("TEAM_ALPHA")) {
        teamRepository.save(new Team("TEAM_ALPHA", true, LocalDateTime.now(), lea, null));
      }

      if (!teamRepository.existsByName("TEAM_OMEGA")) {
        teamRepository.save(new Team("TEAM_OMEGA", true, LocalDateTime.now(), tibo, null));
      }

      if (!teamRepository.existsByName("TEAM_IOTA")) {
        teamRepository.save(new Team("TEAM_IOTA", true, LocalDateTime.now(), lisa, noa));
      }

      // Affectations TEAM_ALPHA
      Member tom = memberRepository.findByEmail("tom@mail.com").orElseThrow();
      Member ines = memberRepository.findByEmail("ines@mail.com").orElseThrow();
      Member tim = memberRepository.findByEmail("tim@mail.com").orElseThrow();
      Member zoe = memberRepository.findByEmail("zoe@mail.com").orElseThrow();

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

      // Affectations TEAM_IOTA
      Team teamIota = teamRepository.findByName("TEAM_IOTA").orElseThrow();

      if (!teamCompositionRepository.existsByMemberId(lisa.getId())) {
        teamCompositionRepository.save(new TeamComposition(lisa, teamIota, LocalDateTime.now()));
      }
      if (!teamCompositionRepository.existsByMemberId(noa.getId())) {
        teamCompositionRepository.save(new TeamComposition(noa, teamIota, LocalDateTime.now()));
      }
      if (!teamCompositionRepository.existsByMemberId(tim.getId())) {
        teamCompositionRepository.save(new TeamComposition(tim, teamIota, LocalDateTime.now()));
      }
      if (!teamCompositionRepository.existsByMemberId(zoe.getId())) {
        teamCompositionRepository.save(new TeamComposition(zoe, teamIota, LocalDateTime.now()));
      }

      // Organizer for tournaments
      Member admin = memberRepository.findByEmail("admin@vinci.be").orElseThrow();

      // Tournois passés (FINISHED + isPublic = true)
      if (!tournamentRepository.existsByName("Spring Arena Cup 2025")) {
        tournamentRepository.save(buildTournament(
            "Spring Arena Cup 2025",
            "Compétition printanière ouverte aux nouvelles teams émergentes",
            LocalDate.of(2025, 4, 15), LocalDate.of(2025, 4, 25),
            LocalDate.of(2025, 4, 10), 8, Status.FINISHED, true, admin));
      }

      if (!tournamentRepository.existsByName("Elite Championship 2025")) {
        tournamentRepository.save(buildTournament(
            "Elite Championship 2025",
            "Compétition élite réservée aux meilleures teams",
            LocalDate.of(2025, 5, 15), LocalDate.of(2025, 5, 30),
            LocalDate.of(2025, 5, 11), 8, Status.FINISHED, true, admin));
      }

      if (!tournamentRepository.existsByName("Summer Pro League 2025")) {
        tournamentRepository.save(buildTournament(
            "Summer Pro League 2025",
            "Tournoi estival de haut niveau avec les meilleures teams",
            LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 15),
            LocalDate.of(2025, 6, 25), 16, Status.FINISHED, true, admin));
      }

      if (!tournamentRepository.existsByName("Vinci Winter Clash 2026")) {
        tournamentRepository.save(buildTournament(
            "Vinci Winter Clash 2026",
            "Tournoi hivernal réunissant des équipes semi-professionnelles",
            LocalDate.of(2026, 1, 10), LocalDate.of(2026, 1, 20),
            LocalDate.of(2026, 1, 5), 12, Status.FINISHED, true, admin));
      }

      // Tournoi en cours (IN_PROGRESS + isPublic = true)
      if (!tournamentRepository.existsByName("Spring Battle Series 2026")) {
        tournamentRepository.save(buildTournament(
            "Spring Battle Series 2026",
            "Série printanière avec élimination directe et forte participation",
            LocalDate.of(2026, 4, 4), LocalDate.of(2026, 4, 11),
            LocalDate.of(2026, 4, 1), 8, Status.IN_PROGRESS, true, admin));
      }

      // Tournois futurs (PREPARATION + isPublic = true)
      if (!tournamentRepository.existsByName("Vinci Easter Cup 2026")) {
        tournamentRepository.save(buildTournament(
            "Vinci Easter Cup 2026",
            "Tournoi de Pâques ouvert à toutes les teams actives",
            LocalDate.of(2026, 4, 15), LocalDate.of(2026, 4, 25),
            LocalDate.of(2026, 4, 8), 8, Status.PREPARATION, true, admin));
      }

      if (!tournamentRepository.existsByName("Elite Championship 2026")) {
        tournamentRepository.save(buildTournament(
            "Elite Championship 2026",
            "Compétition élite réservée aux meilleures teams",
            LocalDate.of(2026, 5, 15), LocalDate.of(2026, 5, 30),
            LocalDate.of(2026, 5, 11), 16, Status.PREPARATION, true, admin));
      }

      // ── Membres et teams supplémentaires (avec TeamComposition) ──
      createMemberAndTeam("zara@mail.com", "zara", "Viper", architecte,
          imageRepository.findAll().get(1), LocalDate.of(2025, 9, 5),
          "TEAM_NOVA", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("kael@mail.com", "kael", "Kael", catalyseur,
          imageRepository.findAll().get(2), LocalDate.of(2025, 8, 14),
          "TEAM_VOID", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("sora@mail.com", "sora", "Sora", guerisseur,
          imageRepository.findAll().get(4), LocalDate.of(2025, 7, 22),
          "TEAM_STORM", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("rex@mail.com", "rex", "Rex", gardien,
          imageRepository.findAll().get(5), LocalDate.of(2025, 6, 30),
          "TEAM_BLAZE", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("nyx@mail.com", "nyx", "Nyx", perturbateur,
          imageRepository.findAll().get(6), LocalDate.of(2025, 5, 18),
          "TEAM_FROST", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("drak@mail.com", "drak", "Drak", tacticien,
          imageRepository.findAll().get(7), LocalDate.of(2025, 4, 10),
          "TEAM_EMBER", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("lumi@mail.com", "lumi", "Lumi", executeur,
          imageRepository.findAll().get(8), LocalDate.of(2025, 3, 25),
          "TEAM_SURGE", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("fenn@mail.com", "fenn", "Fenn", architecte,
          imageRepository.findAll().get(9), LocalDate.of(2025, 2, 14),
          "TEAM_CRYPT", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("vale@mail.com", "vale", "Vale", catalyseur,
          imageRepository.findAll().get(10), LocalDate.of(2025, 1, 8),
          "TEAM_APEX", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("oryn@mail.com", "oryn", "Oryn", perturbateur,
          imageRepository.findAll().get(12), LocalDate.of(2024, 12, 3),
          "TEAM_WRAITH", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("cael@mail.com", "cael", "Cael", gardien,
          imageRepository.findAll().get(13), LocalDate.of(2024, 11, 17),
          "TEAM_TITAN", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      createMemberAndTeam("pyra@mail.com", "pyra", "Pyra", tacticien,
          imageRepository.findAll().get(14), LocalDate.of(2024, 10, 29),
          "TEAM_VENOM", memberRepository, teamRepository,
          teamCompositionRepository, passwordEncoder);

      // ── Inscriptions et gagnants ──
      Team teamNova   = teamRepository.findByName("TEAM_NOVA").orElseThrow();
      Team teamVoid   = teamRepository.findByName("TEAM_VOID").orElseThrow();
      Team teamStorm  = teamRepository.findByName("TEAM_STORM").orElseThrow();
      Team teamBlaze  = teamRepository.findByName("TEAM_BLAZE").orElseThrow();
      Team teamFrost  = teamRepository.findByName("TEAM_FROST").orElseThrow();
      Team teamEmber  = teamRepository.findByName("TEAM_EMBER").orElseThrow();
      Team teamSurge  = teamRepository.findByName("TEAM_SURGE").orElseThrow();
      Team teamCrypt  = teamRepository.findByName("TEAM_CRYPT").orElseThrow();
      Team teamApex   = teamRepository.findByName("TEAM_APEX").orElseThrow();
      Team teamWraith = teamRepository.findByName("TEAM_WRAITH").orElseThrow();
      Team teamTitan  = teamRepository.findByName("TEAM_TITAN").orElseThrow();
      Team teamVenom  = teamRepository.findByName("TEAM_VENOM").orElseThrow();

      setupTournament("Spring Arena Cup 2025", teamOmega,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze),
          tournamentRepository, registrationRepository);

      setupTournament("Elite Championship 2025", teamIota,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm),
          tournamentRepository, registrationRepository);

      setupTournament("Summer Pro League 2025", teamIota,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm,
              teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt, teamApex,
              teamWraith, teamTitan),
          tournamentRepository, registrationRepository);

      setupTournament("Vinci Winter Clash 2026", teamAlpha,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm,
              teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt, teamApex),
          tournamentRepository, registrationRepository);

      setupTournament("Spring Battle Series 2026", null,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm,
              teamBlaze, teamFrost),
          tournamentRepository, registrationRepository);

      setupTournament("Vinci Easter Cup 2026", null,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze),
          tournamentRepository, registrationRepository);

      setupTournament("Elite Championship 2026", null,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm,
              teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt, teamApex,
              teamWraith, teamTitan, teamVenom),
          tournamentRepository, registrationRepository);

    };
  }
}