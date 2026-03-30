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

  /**
   * Bean for initializing default users in the database.
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

      if (!memberRepository.existsByEmail("banni@vinci.be")) {
        Member member = new Member();
        member.setEmail("banni@vinci.be");
        member.setPassword(passwordEncoder.encode("banni"));
        member.setTag("Banni");
        member.setIsAdmin(false);
        member.setBan(true);
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

      // Tournois futurs (PREPARATION + isPublic = true → inscriptions ouvertes)
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

      // ── Membres et teams supplémentaires ──

      Speciality architecte = specialityRepository.findByName("architecte").orElseThrow();
      Speciality catalyseur = specialityRepository.findByName("catalyseur").orElseThrow();
      Speciality perturbateur = specialityRepository.findByName("perturbateur").orElseThrow();

      if (!memberRepository.existsByEmail("zara@mail.com")) {
        Member zara = new Member();
        zara.setEmail("zara@mail.com");
        zara.setPassword(passwordEncoder.encode("zara"));
        zara.setTag("Viper");
        zara.setIsAdmin(false);
        zara.setImage(imageRepository.findAll().get(1));
        zara.setSpeciality(architecte);
        zara.setProfileCreationDate(LocalDate.of(2025, 9, 5));
        memberRepository.save(zara);
      }

      if (!teamRepository.existsByName("TEAM_NOVA")) {
        Member zara = memberRepository.findByEmail("zara@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_NOVA", true, LocalDateTime.now(), zara, null));
      }

      if (!memberRepository.existsByEmail("kael@mail.com")) {
        Member kael = new Member();
        kael.setEmail("kael@mail.com");
        kael.setPassword(passwordEncoder.encode("kael"));
        kael.setTag("Kael");
        kael.setIsAdmin(false);
        kael.setImage(imageRepository.findAll().get(2));
        kael.setSpeciality(catalyseur);
        kael.setProfileCreationDate(LocalDate.of(2025, 8, 14));
        memberRepository.save(kael);
      }

      if (!teamRepository.existsByName("TEAM_VOID")) {
        Member kael = memberRepository.findByEmail("kael@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_VOID", true, LocalDateTime.now(), kael, null));
      }

      if (!memberRepository.existsByEmail("sora@mail.com")) {
        Member sora = new Member();
        sora.setEmail("sora@mail.com");
        sora.setPassword(passwordEncoder.encode("sora"));
        sora.setTag("Sora");
        sora.setIsAdmin(false);
        sora.setImage(imageRepository.findAll().get(4));
        sora.setSpeciality(guerisseur);
        sora.setProfileCreationDate(LocalDate.of(2025, 7, 22));
        memberRepository.save(sora);
      }

      if (!teamRepository.existsByName("TEAM_STORM")) {
        Member sora = memberRepository.findByEmail("sora@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_STORM", true, LocalDateTime.now(), sora, null));
      }

      if (!memberRepository.existsByEmail("rex@mail.com")) {
        Member rex = new Member();
        rex.setEmail("rex@mail.com");
        rex.setPassword(passwordEncoder.encode("rex"));
        rex.setTag("Rex");
        rex.setIsAdmin(false);
        rex.setImage(imageRepository.findAll().get(5));
        rex.setSpeciality(gardien);
        rex.setProfileCreationDate(LocalDate.of(2025, 6, 30));
        memberRepository.save(rex);
      }

      if (!teamRepository.existsByName("TEAM_BLAZE")) {
        Member rex = memberRepository.findByEmail("rex@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_BLAZE", true, LocalDateTime.now(), rex, null));
      }

      if (!memberRepository.existsByEmail("nyx@mail.com")) {
        Member nyx = new Member();
        nyx.setEmail("nyx@mail.com");
        nyx.setPassword(passwordEncoder.encode("nyx"));
        nyx.setTag("Nyx");
        nyx.setIsAdmin(false);
        nyx.setImage(imageRepository.findAll().get(6));
        nyx.setSpeciality(perturbateur);
        nyx.setProfileCreationDate(LocalDate.of(2025, 5, 18));
        memberRepository.save(nyx);
      }

      if (!teamRepository.existsByName("TEAM_FROST")) {
        Member nyx = memberRepository.findByEmail("nyx@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_FROST", true, LocalDateTime.now(), nyx, null));
      }

      if (!memberRepository.existsByEmail("drak@mail.com")) {
        Member drak = new Member();
        drak.setEmail("drak@mail.com");
        drak.setPassword(passwordEncoder.encode("drak"));
        drak.setTag("Drak");
        drak.setIsAdmin(false);
        drak.setImage(imageRepository.findAll().get(7));
        drak.setSpeciality(tacticien);
        drak.setProfileCreationDate(LocalDate.of(2025, 4, 10));
        memberRepository.save(drak);
      }

      if (!teamRepository.existsByName("TEAM_EMBER")) {
        Member drak = memberRepository.findByEmail("drak@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_EMBER", true, LocalDateTime.now(), drak, null));
      }

      if (!memberRepository.existsByEmail("lumi@mail.com")) {
        Member lumi = new Member();
        lumi.setEmail("lumi@mail.com");
        lumi.setPassword(passwordEncoder.encode("lumi"));
        lumi.setTag("Lumi");
        lumi.setIsAdmin(false);
        lumi.setImage(imageRepository.findAll().get(8));
        lumi.setSpeciality(executeur);
        lumi.setProfileCreationDate(LocalDate.of(2025, 3, 25));
        memberRepository.save(lumi);
      }

      if (!teamRepository.existsByName("TEAM_SURGE")) {
        Member lumi = memberRepository.findByEmail("lumi@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_SURGE", true, LocalDateTime.now(), lumi, null));
      }

      if (!memberRepository.existsByEmail("fenn@mail.com")) {
        Member fenn = new Member();
        fenn.setEmail("fenn@mail.com");
        fenn.setPassword(passwordEncoder.encode("fenn"));
        fenn.setTag("Fenn");
        fenn.setIsAdmin(false);
        fenn.setImage(imageRepository.findAll().get(9));
        fenn.setSpeciality(architecte);
        fenn.setProfileCreationDate(LocalDate.of(2025, 2, 14));
        memberRepository.save(fenn);
      }

      if (!teamRepository.existsByName("TEAM_CRYPT")) {
        Member fenn = memberRepository.findByEmail("fenn@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_CRYPT", true, LocalDateTime.now(), fenn, null));
      }

      if (!memberRepository.existsByEmail("vale@mail.com")) {
        Member vale = new Member();
        vale.setEmail("vale@mail.com");
        vale.setPassword(passwordEncoder.encode("vale"));
        vale.setTag("Vale");
        vale.setIsAdmin(false);
        vale.setImage(imageRepository.findAll().get(10));
        vale.setSpeciality(catalyseur);
        vale.setProfileCreationDate(LocalDate.of(2025, 1, 8));
        memberRepository.save(vale);
      }

      if (!teamRepository.existsByName("TEAM_APEX")) {
        Member vale = memberRepository.findByEmail("vale@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_APEX", true, LocalDateTime.now(), vale, null));
      }

      if (!memberRepository.existsByEmail("oryn@mail.com")) {
        Member oryn = new Member();
        oryn.setEmail("oryn@mail.com");
        oryn.setPassword(passwordEncoder.encode("oryn"));
        oryn.setTag("Oryn");
        oryn.setIsAdmin(false);
        oryn.setImage(imageRepository.findAll().get(12));
        oryn.setSpeciality(perturbateur);
        oryn.setProfileCreationDate(LocalDate.of(2024, 12, 3));
        memberRepository.save(oryn);
      }

      if (!teamRepository.existsByName("TEAM_WRAITH")) {
        Member oryn = memberRepository.findByEmail("oryn@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_WRAITH", true, LocalDateTime.now(), oryn, null));
      }

      if (!memberRepository.existsByEmail("cael@mail.com")) {
        Member cael = new Member();
        cael.setEmail("cael@mail.com");
        cael.setPassword(passwordEncoder.encode("cael"));
        cael.setTag("Cael");
        cael.setIsAdmin(false);
        cael.setImage(imageRepository.findAll().get(13));
        cael.setSpeciality(gardien);
        cael.setProfileCreationDate(LocalDate.of(2024, 11, 17));
        memberRepository.save(cael);
      }

      if (!teamRepository.existsByName("TEAM_TITAN")) {
        Member cael = memberRepository.findByEmail("cael@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_TITAN", true, LocalDateTime.now(), cael, null));
      }

      if (!memberRepository.existsByEmail("pyra@mail.com")) {
        Member pyra = new Member();
        pyra.setEmail("pyra@mail.com");
        pyra.setPassword(passwordEncoder.encode("pyra"));
        pyra.setTag("Pyra");
        pyra.setIsAdmin(false);
        pyra.setImage(imageRepository.findAll().get(14));
        pyra.setSpeciality(tacticien);
        pyra.setProfileCreationDate(LocalDate.of(2024, 10, 29));
        memberRepository.save(pyra);
      }

      if (!teamRepository.existsByName("TEAM_VENOM")) {
        Member pyra = memberRepository.findByEmail("pyra@mail.com").orElseThrow();
        teamRepository.save(new Team("TEAM_VENOM", true, LocalDateTime.now(), pyra, null));
      }

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

      // Spring Arena Cup 2025 — 7 inscrits, gagnant TEAM_OMEGA
      if (tournamentRepository.existsByName("Spring Arena Cup 2025")) {
        Tournament t = tournamentRepository.findByName("Spring Arena Cup 2025").orElseThrow();
        if (t.getWinnerTeam() == null) {
          t.setWinnerTeam(teamOmega);
          tournamentRepository.save(t);
        }
        for (Team team : List.of(teamAlpha, teamOmega, teamNova, teamVoid,
            teamStorm, teamBlaze, teamFrost)) {
          registerTeam(registrationRepository, t, team);
        }
      }

      // Elite Championship 2025 — 6 inscrits, gagnant TEAM_NOVA
      if (tournamentRepository.existsByName("Elite Championship 2025")) {
        Tournament t = tournamentRepository.findByName("Elite Championship 2025").orElseThrow();
        if (t.getWinnerTeam() == null) {
          t.setWinnerTeam(teamNova);
          tournamentRepository.save(t);
        }
        for (Team team : List.of(teamAlpha, teamOmega, teamNova,
            teamVoid, teamStorm, teamBlaze)) {
          registerTeam(registrationRepository, t, team);
        }
      }

      // Summer Pro League 2025 — 14 inscrits, gagnant TEAM_NOVA
      if (tournamentRepository.existsByName("Summer Pro League 2025")) {
        Tournament t = tournamentRepository.findByName("Summer Pro League 2025").orElseThrow();
        if (t.getWinnerTeam() == null) {
          t.setWinnerTeam(teamNova);
          tournamentRepository.save(t);
        }
        for (Team team : List.of(teamAlpha, teamOmega, teamNova, teamVoid,
            teamStorm, teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt,
            teamApex, teamWraith, teamTitan, teamVenom)) {
          registerTeam(registrationRepository, t, team);
        }
      }

      // Vinci Winter Clash 2026 — 12 inscrits, gagnant TEAM_ALPHA
      if (tournamentRepository.existsByName("Vinci Winter Clash 2026")) {
        Tournament t = tournamentRepository.findByName("Vinci Winter Clash 2026").orElseThrow();
        if (t.getWinnerTeam() == null) {
          t.setWinnerTeam(teamAlpha);
          tournamentRepository.save(t);
        }
        for (Team team : List.of(teamAlpha, teamOmega, teamNova, teamVoid,
            teamStorm, teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt,
            teamApex, teamWraith)) {
          registerTeam(registrationRepository, t, team);
        }
      }

      // Spring Battle Series 2026 — 8 inscrits, pas de gagnant
      if (tournamentRepository.existsByName("Spring Battle Series 2026")) {
        Tournament t = tournamentRepository.findByName("Spring Battle Series 2026").orElseThrow();
        for (Team team : List.of(teamAlpha, teamOmega, teamNova, teamVoid,
            teamStorm, teamBlaze, teamFrost, teamEmber)) {
          registerTeam(registrationRepository, t, team);
        }
      }

      // Vinci Easter Cup 2026 — 7 inscrits
      if (tournamentRepository.existsByName("Vinci Easter Cup 2026")) {
        Tournament t = tournamentRepository.findByName("Vinci Easter Cup 2026").orElseThrow();
        for (Team team : List.of(teamAlpha, teamOmega, teamNova, teamVoid,
            teamStorm, teamBlaze, teamFrost)) {
          registerTeam(registrationRepository, t, team);
        }
      }

      // Elite Championship 2026 — 14 inscrits
      if (tournamentRepository.existsByName("Elite Championship 2026")) {
        Tournament t = tournamentRepository.findByName("Elite Championship 2026").orElseThrow();
        for (Team team : List.of(teamAlpha, teamOmega, teamNova, teamVoid,
            teamStorm, teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt,
            teamApex, teamWraith, teamTitan, teamVenom)) {
          registerTeam(registrationRepository, t, team);
        }
      }

    };
  }
}