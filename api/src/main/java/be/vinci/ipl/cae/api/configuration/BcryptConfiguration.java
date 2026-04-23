package be.vinci.ipl.cae.api.configuration;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.models.entities.TournamentRegistration;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.PlayersSelectionRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import be.vinci.ipl.cae.api.services.BanishmentService;
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

  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  private Tournament buildTournament(String name, String description, LocalDate startDate,
                                     LocalDate endDate, LocalDate deadline, int maxParticipants, Status status, boolean isPublic,
                                     Member organizer) {
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

  private void addToTeam(Member member, Team team,
                         TeamCompositionRepository teamCompositionRepository) {
    if (!teamCompositionRepository.existsByMemberId(member.getId())) {
      teamCompositionRepository.save(new TeamComposition(member, team, LocalDateTime.now()));
    }
  }

  private void createMemberAndTeam(String email, String password, String tag,
                                   Speciality speciality, Image image, LocalDate creationDate, String teamName,
                                   MemberRepository memberRepository, TeamRepository teamRepository,
                                   TeamCompositionRepository teamCompositionRepository,
                                   BCryptPasswordEncoder passwordEncoder) {
    if (!memberRepository.existsByEmail(email)) {
      memberRepository.save(buildMember(email, password, tag, false, image, speciality,
          creationDate, passwordEncoder));
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
    boolean alreadyRegistered = registrationRepository.findByTournamentId(tournament.getId())
        .stream().anyMatch(r -> r.getTeam().getId().equals(team.getId()));
    if (!alreadyRegistered) {
      TournamentRegistration registration = new TournamentRegistration();
      registration.setTournament(tournament);
      registration.setTeam(team);
      registration.setRegistrationDate(LocalDate.now());
      registrationRepository.save(registration);
    }
  }

  private void setupTournament(String tournamentName, Team winner, List<Team> teams,
                               TournamentRepository tournamentRepository,
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

  private Match buildPlayedMatch(Tournament tournament, Team teamA, Team teamB, int roundNumber,
                                 LocalDateTime dateTime, int scoreA, int scoreB, Team winner, Member admin,
                                 Match nextMatch, MatchRepository matchRepository) {
    Match match = new Match();
    match.setTournament(tournament);
    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setRoundNumber(roundNumber);
    match.setDateTime(dateTime);
    match.setState(MatchState.PLAYED);
    match.setResultStatus(ResultStatus.VALIDATED);
    match.setScoreA(scoreA);
    match.setScoreB(scoreB);
    match.setWinner(winner);
    match.setResponsibleAdmin(admin);
    match.setNextMatch(nextMatch);
    return matchRepository.save(match);
  }

  private void addSelection(Member member, Match match, Team team,
                            PlayersSelectionRepository playersSelectionRepository) {
    if (!playersSelectionRepository.existsByMatchAndMember(match, member)) {
      playersSelectionRepository.save(new PlayersSelection(member, match, team));
    }
  }

  @Bean
  public CommandLineRunner initUsers(MemberRepository memberRepository,
                                     BanishmentService banishmentService, ImageRepository imageRepository,
                                     SpecialityRepository specialityRepository, TeamRepository teamRepository,
                                     TeamCompositionRepository teamCompositionRepository,
                                     TournamentRepository tournamentRepository,
                                     TournamentRegistrationRepository registrationRepository,
                                     MatchRepository matchRepository,
                                     PlayersSelectionRepository playersSelectionRepository,
                                     BCryptPasswordEncoder passwordEncoder) {
    return args -> {

      // ── Images ──
      List<String> imageUrls = List.of(
          "/images/avatar01.png", "/images/avatar02.png", "/images/avatar03.png",
          "/images/avatar04.png", "/images/avatar05.png", "/images/avatar06.png",
          "/images/avatar07.png", "/images/avatar08.png", "/images/avatar09.png",
          "/images/avatar10.png", "/images/avatar11.png", "/images/avatar12.png",
          "/images/avatar13.png", "/images/avatar14.png", "/images/avatar15.png",
          "/images/avatar16.png", "/images/avatar17.png", "/images/avatar18.png",
          "/images/avatar19.png", "/images/avatar20.png");
      for (String url : imageUrls) {
        if (imageRepository.findByUrl(url).isEmpty()) {
          imageRepository.save(new Image(url));
        }
      }

      // ── Specialities ──
      List<String> specialityNames = List.of("architecte", "catalyseur", "exécuteur", "gardien",
          "guérisseur", "perturbateur", "tacticien");
      for (String name : specialityNames) {
        if (specialityRepository.findByName(name).isEmpty()) {
          specialityRepository.save(new Speciality(name));
        }
      }

      final Speciality tacticien    = specialityRepository.findByName("tacticien").orElseThrow();
      final Speciality executeur    = specialityRepository.findByName("exécuteur").orElseThrow();
      final Speciality guerisseur   = specialityRepository.findByName("guérisseur").orElseThrow();
      final Speciality gardien      = specialityRepository.findByName("gardien").orElseThrow();
      final Speciality architecte   = specialityRepository.findByName("architecte").orElseThrow();
      final Speciality catalyseur   = specialityRepository.findByName("catalyseur").orElseThrow();
      final Speciality perturbateur = specialityRepository.findByName("perturbateur").orElseThrow();
      final Speciality defaultSpec  = specialityRepository.findAll().getFirst();
      final Image defaultImage      = imageRepository.findAll().get(11);

      // ── Members ──
      if (!memberRepository.existsByEmail("lea@mail.com")) {
        memberRepository.save(buildMember("lea@mail.com", "lea", "Lynx", true,
            imageRepository.findAll().get(0), tacticien, LocalDate.of(2025, 11, 12), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("tom@mail.com")) {
        memberRepository.save(buildMember("tom@mail.com", "tom", "Rogue", false,
            imageRepository.findAll().get(3), executeur, LocalDate.of(2025, 12, 3), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("ines@mail.com")) {
        memberRepository.save(buildMember("ines@mail.com", "ines", "Pulse", false,
            imageRepository.findAll().get(15), guerisseur, LocalDate.of(2026, 1, 18), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("pol@mail.com")) {
        memberRepository.save(buildMember("pol@mail.com", "pol", "Wolf", false,
            imageRepository.findAll().get(7), architecte, LocalDate.of(2026, 2, 2), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("tibo@mail.com")) {
        memberRepository.save(buildMember("tibo@mail.com", "tibo", "Iron", false,
            imageRepository.findAll().get(19), gardien, LocalDate.of(2025, 10, 27), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("neo@mail.com")) {
        memberRepository.save(buildMember("neo@mail.com", "neo", "Shade", false,
            imageRepository.findAll().get(8), catalyseur, LocalDate.of(2025, 10, 30), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("kai@mail.com")) {
        memberRepository.save(buildMember("kai@mail.com", "kai", "Blaze", false,
            imageRepository.findAll().get(9), perturbateur, LocalDate.of(2025, 11, 5), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("mia@mail.com")) {
        memberRepository.save(buildMember("mia@mail.com", "mia", "Nova", false,
            imageRepository.findAll().get(10), guerisseur, LocalDate.of(2025, 11, 10), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("lisa@mail.com")) {
        memberRepository.save(buildMember("lisa@mail.com", "lisa", "Storm", false,
            imageRepository.findAll().get(2), executeur, LocalDate.of(2026, 1, 10), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("noa@mail.com")) {
        memberRepository.save(buildMember("noa@mail.com", "noa", "Flash", false,
            imageRepository.findAll().get(4), architecte, LocalDate.of(2026, 2, 2), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("tim@mail.com")) {
        memberRepository.save(buildMember("tim@mail.com", "tim", "Titi", false,
            imageRepository.findAll().get(5), gardien, LocalDate.of(2026, 2, 3), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("zoe@mail.com")) {
        memberRepository.save(buildMember("zoe@mail.com", "zoe", "Vector", false,
            imageRepository.findAll().get(6), catalyseur, LocalDate.of(2026, 2, 4), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("max@mail.com")) {
        memberRepository.save(buildMember("max@mail.com", "max", "Maximus", false,
            imageRepository.findAll().get(12), gardien, LocalDate.of(2026, 3, 12), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("ali@mail.com")) {
        memberRepository.save(buildMember("ali@mail.com", "ali", "Putsh", false,
            imageRepository.findAll().get(13), perturbateur, LocalDate.of(2026, 1, 22), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("zed@mail.com")) {
        memberRepository.save(buildMember("zed@mail.com", "zed", "Zero", true,
            imageRepository.findAll().get(14), architecte, LocalDate.of(2025, 12, 11), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("seb@mail.com")) {
        memberRepository.save(buildMember("seb@mail.com", "seb", "Ice", true,
            imageRepository.findAll().get(16), guerisseur, LocalDate.of(2026, 3, 1), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("oli@mail.com")) {
        memberRepository.save(buildMember("oli@mail.com", "oli", "Tiger", false,
            imageRepository.findAll().get(17), tacticien, LocalDate.of(2025, 11, 11), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("fin@mail.com")) {
        memberRepository.save(buildMember("fin@mail.com", "fin", "Final", false,
            imageRepository.findAll().get(18), executeur, LocalDate.of(2025, 10, 22), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("admin@vinci.be")) {
        memberRepository.save(buildMember("admin@vinci.be", "admin", "Admin", true,
            defaultImage, defaultSpec, LocalDate.now(), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("member@vinci.be")) {
        memberRepository.save(buildMember("member@vinci.be", "member", "Member", false,
            defaultImage, defaultSpec, LocalDate.now(), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("banni@vinci.be")) {
        Member banni = buildMember("banni@vinci.be", "banni", "Banni", false,
            defaultImage, defaultSpec, LocalDate.now(), passwordEncoder);
        memberRepository.save(banni);
        Member adminRef = memberRepository.findByEmail("admin@vinci.be").orElseThrow();
        banishmentService.banMember(banni.getId(), adminRef.getId(),
            "Test de banissement pour données de test");
      }

      // ── Member references ──
      Member lea   = memberRepository.findByEmail("lea@mail.com").orElseThrow();
      Member tom   = memberRepository.findByEmail("tom@mail.com").orElseThrow();
      Member ines  = memberRepository.findByEmail("ines@mail.com").orElseThrow();
      Member pol   = memberRepository.findByEmail("pol@mail.com").orElseThrow();
      Member tibo  = memberRepository.findByEmail("tibo@mail.com").orElseThrow();
      Member neo   = memberRepository.findByEmail("neo@mail.com").orElseThrow();
      Member kai   = memberRepository.findByEmail("kai@mail.com").orElseThrow();
      Member mia   = memberRepository.findByEmail("mia@mail.com").orElseThrow();
      Member lisa  = memberRepository.findByEmail("lisa@mail.com").orElseThrow();
      Member noa   = memberRepository.findByEmail("noa@mail.com").orElseThrow();
      Member tim   = memberRepository.findByEmail("tim@mail.com").orElseThrow();
      Member zoe   = memberRepository.findByEmail("zoe@mail.com").orElseThrow();
      Member max   = memberRepository.findByEmail("max@mail.com").orElseThrow();
      Member ali   = memberRepository.findByEmail("ali@mail.com").orElseThrow();
      Member zed   = memberRepository.findByEmail("zed@mail.com").orElseThrow();
      Member seb   = memberRepository.findByEmail("seb@mail.com").orElseThrow();
      Member oli   = memberRepository.findByEmail("oli@mail.com").orElseThrow();
      Member fin   = memberRepository.findByEmail("fin@mail.com").orElseThrow();
      Member admin = memberRepository.findByEmail("admin@vinci.be").orElseThrow();

      // ── Teams ──
      if (!teamRepository.existsByName("TEAM_ALPHA")) {
        teamRepository.save(new Team("TEAM_ALPHA", true, LocalDateTime.now(), lea, null));
      }
      if (!teamRepository.existsByName("TEAM_OMEGA")) {
        teamRepository.save(new Team("TEAM_OMEGA", true, LocalDateTime.now(), tibo, null));
      }
      if (!teamRepository.existsByName("TEAM_IOTA")) {
        teamRepository.save(new Team("TEAM_IOTA", true, LocalDateTime.now(), lisa, noa));
      }
      if (!teamRepository.existsByName("TEAM_DELTA")) {
        teamRepository.save(new Team("TEAM_DELTA", true, LocalDateTime.now(), max, seb));
      }

      Team teamAlpha = teamRepository.findByName("TEAM_ALPHA").orElseThrow();
      Team teamOmega = teamRepository.findByName("TEAM_OMEGA").orElseThrow();
      Team teamIota  = teamRepository.findByName("TEAM_IOTA").orElseThrow();
      Team teamDelta = teamRepository.findByName("TEAM_DELTA").orElseThrow();

      addToTeam(lea,  teamAlpha, teamCompositionRepository);
      addToTeam(tom,  teamAlpha, teamCompositionRepository);
      addToTeam(ines, teamAlpha, teamCompositionRepository);
      addToTeam(pol,  teamAlpha, teamCompositionRepository);

      addToTeam(tibo, teamOmega, teamCompositionRepository);
      addToTeam(neo,  teamOmega, teamCompositionRepository);
      addToTeam(kai,  teamOmega, teamCompositionRepository);
      addToTeam(mia,  teamOmega, teamCompositionRepository);

      addToTeam(lisa, teamIota, teamCompositionRepository);
      addToTeam(noa,  teamIota, teamCompositionRepository);
      addToTeam(tim,  teamIota, teamCompositionRepository);
      addToTeam(zoe,  teamIota, teamCompositionRepository);

      addToTeam(max, teamDelta, teamCompositionRepository);
      addToTeam(seb, teamDelta, teamCompositionRepository);
      addToTeam(ali, teamDelta, teamCompositionRepository);
      addToTeam(zed, teamDelta, teamCompositionRepository);
      addToTeam(oli, teamDelta, teamCompositionRepository);
      addToTeam(fin, teamDelta, teamCompositionRepository);

      // ── Extra teams ──
      createMemberAndTeam("zara@mail.com", "zara", "Viper", architecte,
          imageRepository.findAll().get(1), LocalDate.of(2025, 9, 5), "TEAM_NOVA",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("kael@mail.com", "kael", "Kael", catalyseur,
          imageRepository.findAll().get(2), LocalDate.of(2025, 8, 14), "TEAM_VOID",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("sora@mail.com", "sora", "Sora", guerisseur,
          imageRepository.findAll().get(4), LocalDate.of(2025, 7, 22), "TEAM_STORM",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("rex@mail.com", "rex", "Rex", gardien,
          imageRepository.findAll().get(5), LocalDate.of(2025, 6, 30), "TEAM_BLAZE",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("nyx@mail.com", "nyx", "Nyx", perturbateur,
          imageRepository.findAll().get(6), LocalDate.of(2025, 5, 18), "TEAM_FROST",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("drak@mail.com", "drak", "Drak", tacticien,
          imageRepository.findAll().get(7), LocalDate.of(2025, 4, 10), "TEAM_EMBER",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("lumi@mail.com", "lumi", "Lumi", executeur,
          imageRepository.findAll().get(8), LocalDate.of(2025, 3, 25), "TEAM_SURGE",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      createMemberAndTeam("fenn@mail.com", "fenn", "Fenn", architecte,
          imageRepository.findAll().get(9), LocalDate.of(2025, 2, 14), "TEAM_CRYPT",
          memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);

      Team teamNova  = teamRepository.findByName("TEAM_NOVA").orElseThrow();
      Team teamVoid  = teamRepository.findByName("TEAM_VOID").orElseThrow();
      Team teamStorm = teamRepository.findByName("TEAM_STORM").orElseThrow();
      Team teamBlaze = teamRepository.findByName("TEAM_BLAZE").orElseThrow();
      Team teamFrost = teamRepository.findByName("TEAM_FROST").orElseThrow();
      Team teamEmber = teamRepository.findByName("TEAM_EMBER").orElseThrow();
      Team teamSurge = teamRepository.findByName("TEAM_SURGE").orElseThrow();
      Team teamCrypt = teamRepository.findByName("TEAM_CRYPT").orElseThrow();

      // ── Inscriptions & gagnants ──
      setupTournament("Spring Arena Cup 2025", teamOmega,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze),
          tournamentRepository, registrationRepository);
      setupTournament("Elite Championship 2025", teamIota,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm),
          tournamentRepository, registrationRepository);
      setupTournament("Summer Pro League 2025", teamAlpha,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze,
              teamFrost, teamEmber, teamSurge, teamCrypt, teamDelta, teamVoid, teamNova),
          tournamentRepository, registrationRepository);
      setupTournament("Vinci Winter Clash 2026", teamDelta,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze,
              teamFrost, teamEmber, teamSurge, teamCrypt, teamDelta),
          tournamentRepository, registrationRepository);
      setupTournament("Vinci Easter Cup 2026", teamDelta,
          List.of(teamDelta, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze),
          tournamentRepository, registrationRepository);
      setupTournament("Spring Battle Series 2026", null,
          List.of(teamAlpha, teamOmega, teamIota, teamDelta, teamNova, teamVoid, teamStorm, teamBlaze),
          tournamentRepository, registrationRepository);
      setupTournament("Elite Championship 2026", null,
          List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze,
              teamFrost, teamEmber),
          tournamentRepository, registrationRepository);

      // ════════════════════════════════════════════════════════
      // BRACKETS TOURNOIS TERMINÉS
      // ════════════════════════════════════════════════════════

      // ── Spring Arena Cup 2025 (7 teams, gagnant TEAM_OMEGA) ──
      Tournament springArena = tournamentRepository.findByName("Spring Arena Cup 2025").orElseThrow();
      if (matchRepository.findByTournamentOrderByRoundNumberAsc(springArena).isEmpty()) {
        Match sacFinale = new Match();
        sacFinale.setTournament(springArena);
        sacFinale.setTeamA(teamOmega);
        sacFinale.setTeamB(teamBlaze);
        sacFinale.setRoundNumber(3);
        sacFinale.setDateTime(LocalDateTime.of(2025, 4, 24, 15, 0));
        sacFinale.setState(MatchState.PLAYED);
        sacFinale.setResultStatus(ResultStatus.VALIDATED);
        sacFinale.setScoreA(3); sacFinale.setScoreB(1);
        sacFinale.setWinner(teamOmega);
        sacFinale.setResponsibleAdmin(admin);
        sacFinale = matchRepository.save(sacFinale);

        Match sacDemi1 = buildPlayedMatch(springArena, teamOmega, teamIota, 2,
            LocalDateTime.of(2025, 4, 21, 14, 0), 2, 0, teamOmega, admin, sacFinale, matchRepository);
        Match sacDemi2 = buildPlayedMatch(springArena, teamBlaze, teamAlpha, 2,
            LocalDateTime.of(2025, 4, 21, 16, 0), 2, 1, teamBlaze, admin, sacFinale, matchRepository);

        Match sacR1m1 = buildPlayedMatch(springArena, teamOmega, teamNova, 1,
            LocalDateTime.of(2025, 4, 17, 10, 0), 2, 0, teamOmega, admin, sacDemi1, matchRepository);
        buildPlayedMatch(springArena, teamIota, teamVoid, 1,
            LocalDateTime.of(2025, 4, 17, 12, 0), 2, 1, teamIota, admin, sacDemi1, matchRepository);
        buildPlayedMatch(springArena, teamAlpha, teamStorm, 1,
            LocalDateTime.of(2025, 4, 17, 14, 0), 2, 0, teamAlpha, admin, sacDemi2, matchRepository);

        // Historique tibo dans Spring Arena
        addSelection(tibo, sacR1m1, teamOmega, playersSelectionRepository);
        addSelection(neo,  sacR1m1, teamOmega, playersSelectionRepository);
        addSelection(kai,  sacR1m1, teamOmega, playersSelectionRepository);
        addSelection(mia,  sacR1m1, teamOmega, playersSelectionRepository);
        addSelection(tibo, sacDemi1, teamOmega, playersSelectionRepository);
        addSelection(neo,  sacDemi1, teamOmega, playersSelectionRepository);
        addSelection(kai,  sacDemi1, teamOmega, playersSelectionRepository);
        addSelection(mia,  sacDemi1, teamOmega, playersSelectionRepository);
      }

      // ── Elite Championship 2025 (6 teams, gagnant TEAM_IOTA) ──
      Tournament eliteChamp2025 = tournamentRepository.findByName("Elite Championship 2025").orElseThrow();
      if (matchRepository.findByTournamentOrderByRoundNumberAsc(eliteChamp2025).isEmpty()) {
        Match ec25Finale = new Match();
        ec25Finale.setTournament(eliteChamp2025);
        ec25Finale.setTeamA(teamIota);
        ec25Finale.setTeamB(teamAlpha);
        ec25Finale.setRoundNumber(3);
        ec25Finale.setDateTime(LocalDateTime.of(2025, 5, 29, 15, 0));
        ec25Finale.setState(MatchState.PLAYED);
        ec25Finale.setResultStatus(ResultStatus.VALIDATED);
        ec25Finale.setScoreA(3); ec25Finale.setScoreB(2);
        ec25Finale.setWinner(teamIota);
        ec25Finale.setResponsibleAdmin(admin);
        ec25Finale = matchRepository.save(ec25Finale);

        Match ec25Demi1 = buildPlayedMatch(eliteChamp2025, teamIota, teamOmega, 2,
            LocalDateTime.of(2025, 5, 26, 14, 0), 2, 1, teamIota, admin, ec25Finale, matchRepository);
        Match ec25Demi2 = buildPlayedMatch(eliteChamp2025, teamAlpha, teamNova, 2,
            LocalDateTime.of(2025, 5, 26, 16, 0), 2, 0, teamAlpha, admin, ec25Finale, matchRepository);

        Match ec25R1m1 = buildPlayedMatch(eliteChamp2025, teamOmega, teamStorm, 1,
            LocalDateTime.of(2025, 5, 22, 14, 0), 2, 0, teamOmega, admin, ec25Demi1, matchRepository);
        buildPlayedMatch(eliteChamp2025, teamNova, teamVoid, 1,
            LocalDateTime.of(2025, 5, 22, 16, 0), 2, 1, teamNova, admin, ec25Demi2, matchRepository);

        // Historique tibo dans Elite 2025
        addSelection(tibo, ec25R1m1, teamOmega, playersSelectionRepository);
        addSelection(neo,  ec25R1m1, teamOmega, playersSelectionRepository);
        addSelection(kai,  ec25R1m1, teamOmega, playersSelectionRepository);
        addSelection(mia,  ec25R1m1, teamOmega, playersSelectionRepository);
        addSelection(tibo, ec25Demi1, teamOmega, playersSelectionRepository);
        addSelection(neo,  ec25Demi1, teamOmega, playersSelectionRepository);
        addSelection(kai,  ec25Demi1, teamOmega, playersSelectionRepository);
        addSelection(mia,  ec25Demi1, teamOmega, playersSelectionRepository);
      }

      // ── Summer Pro League 2025 (14 teams, gagnant TEAM_ALPHA) ──
      Tournament summerPro = tournamentRepository.findByName("Summer Pro League 2025").orElseThrow();
      if (matchRepository.findByTournamentOrderByRoundNumberAsc(summerPro).isEmpty()) {
        Match splFinale = new Match();
        splFinale.setTournament(summerPro);
        splFinale.setTeamA(teamAlpha);
        splFinale.setTeamB(teamOmega);
        splFinale.setRoundNumber(4);
        splFinale.setDateTime(LocalDateTime.of(2025, 7, 14, 15, 0));
        splFinale.setState(MatchState.PLAYED);
        splFinale.setResultStatus(ResultStatus.VALIDATED);
        splFinale.setScoreA(3); splFinale.setScoreB(1);
        splFinale.setWinner(teamAlpha);
        splFinale.setResponsibleAdmin(admin);
        splFinale = matchRepository.save(splFinale);

        Match splDemi1 = buildPlayedMatch(summerPro, teamAlpha, teamIota, 3,
            LocalDateTime.of(2025, 7, 11, 14, 0), 2, 1, teamAlpha, admin, splFinale, matchRepository);
        Match splDemi2 = buildPlayedMatch(summerPro, teamOmega, teamDelta, 3,
            LocalDateTime.of(2025, 7, 11, 16, 0), 2, 0, teamOmega, admin, splFinale, matchRepository);

        Match splQ1 = buildPlayedMatch(summerPro, teamAlpha, teamNova, 2,
            LocalDateTime.of(2025, 7, 8, 10, 0), 2, 0, teamAlpha, admin, splDemi1, matchRepository);
        Match splQ2 = buildPlayedMatch(summerPro, teamIota, teamCrypt, 2,
            LocalDateTime.of(2025, 7, 8, 12, 0), 2, 1, teamIota, admin, splDemi1, matchRepository);
        Match splQ3 = buildPlayedMatch(summerPro, teamOmega, teamBlaze, 2,
            LocalDateTime.of(2025, 7, 8, 14, 0), 2, 0, teamOmega, admin, splDemi2, matchRepository);
        Match splQ4 = buildPlayedMatch(summerPro, teamDelta, teamSurge, 2,
            LocalDateTime.of(2025, 7, 8, 16, 0), 2, 1, teamDelta, admin, splDemi2, matchRepository);

        buildPlayedMatch(summerPro, teamNova, teamVoid, 1,
            LocalDateTime.of(2025, 7, 3, 10, 0), 2, 0, teamNova, admin, splQ1, matchRepository);
        buildPlayedMatch(summerPro, teamCrypt, teamFrost, 1,
            LocalDateTime.of(2025, 7, 3, 12, 0), 2, 1, teamCrypt, admin, splQ2, matchRepository);
        buildPlayedMatch(summerPro, teamBlaze, teamEmber, 1,
            LocalDateTime.of(2025, 7, 3, 14, 0), 2, 0, teamBlaze, admin, splQ3, matchRepository);
        buildPlayedMatch(summerPro, teamSurge, teamStorm, 1,
            LocalDateTime.of(2025, 7, 3, 16, 0), 2, 1, teamSurge, admin, splQ4, matchRepository);

        // Historique tibo dans Summer Pro
        addSelection(tibo, splQ3, teamOmega, playersSelectionRepository);
        addSelection(neo,  splQ3, teamOmega, playersSelectionRepository);
        addSelection(kai,  splQ3, teamOmega, playersSelectionRepository);
        addSelection(mia,  splQ3, teamOmega, playersSelectionRepository);
        addSelection(tibo, splDemi2, teamOmega, playersSelectionRepository);
        addSelection(neo,  splDemi2, teamOmega, playersSelectionRepository);
        addSelection(kai,  splDemi2, teamOmega, playersSelectionRepository);
        addSelection(mia,  splDemi2, teamOmega, playersSelectionRepository);
      }

      // ── Vinci Winter Clash 2026 (12 teams, gagnant TEAM_DELTA) ──
      Tournament winterClash = tournamentRepository.findByName("Vinci Winter Clash 2026").orElseThrow();
      if (matchRepository.findByTournamentOrderByRoundNumberAsc(winterClash).isEmpty()) {
        Match wc26Finale = new Match();
        wc26Finale.setTournament(winterClash);
        wc26Finale.setTeamA(teamDelta);
        wc26Finale.setTeamB(teamAlpha);
        wc26Finale.setRoundNumber(4);
        wc26Finale.setDateTime(LocalDateTime.of(2026, 1, 19, 15, 0));
        wc26Finale.setState(MatchState.PLAYED);
        wc26Finale.setResultStatus(ResultStatus.VALIDATED);
        wc26Finale.setScoreA(3); wc26Finale.setScoreB(2);
        wc26Finale.setWinner(teamDelta);
        wc26Finale.setResponsibleAdmin(admin);
        wc26Finale = matchRepository.save(wc26Finale);

        Match wc26Demi1 = buildPlayedMatch(winterClash, teamDelta, teamIota, 3,
            LocalDateTime.of(2026, 1, 16, 14, 0), 2, 1, teamDelta, admin, wc26Finale, matchRepository);
        Match wc26Demi2 = buildPlayedMatch(winterClash, teamAlpha, teamOmega, 3,
            LocalDateTime.of(2026, 1, 16, 16, 0), 2, 0, teamAlpha, admin, wc26Finale, matchRepository);

        Match wc26Q1 = buildPlayedMatch(winterClash, teamDelta, teamNova, 2,
            LocalDateTime.of(2026, 1, 13, 10, 0), 2, 0, teamDelta, admin, wc26Demi1, matchRepository);
        Match wc26Q2 = buildPlayedMatch(winterClash, teamIota, teamCrypt, 2,
            LocalDateTime.of(2026, 1, 13, 12, 0), 2, 1, teamIota, admin, wc26Demi1, matchRepository);
        Match wc26Q3 = buildPlayedMatch(winterClash, teamAlpha, teamFrost, 2,
            LocalDateTime.of(2026, 1, 13, 14, 0), 2, 0, teamAlpha, admin, wc26Demi2, matchRepository);
        Match wc26Q4 = buildPlayedMatch(winterClash, teamOmega, teamSurge, 2,
            LocalDateTime.of(2026, 1, 13, 16, 0), 2, 1, teamOmega, admin, wc26Demi2, matchRepository);

        buildPlayedMatch(winterClash, teamNova, teamVoid, 1,
            LocalDateTime.of(2026, 1, 11, 10, 0), 2, 1, teamNova, admin, wc26Q1, matchRepository);
        buildPlayedMatch(winterClash, teamCrypt, teamBlaze, 1,
            LocalDateTime.of(2026, 1, 11, 12, 0), 2, 0, teamCrypt, admin, wc26Q2, matchRepository);
        buildPlayedMatch(winterClash, teamFrost, teamStorm, 1,
            LocalDateTime.of(2026, 1, 11, 14, 0), 2, 1, teamFrost, admin, wc26Q3, matchRepository);
        buildPlayedMatch(winterClash, teamSurge, teamEmber, 1,
            LocalDateTime.of(2026, 1, 11, 16, 0), 2, 0, teamSurge, admin, wc26Q4, matchRepository);

        // Historique tibo dans Winter Clash
        addSelection(tibo, wc26Q4, teamOmega, playersSelectionRepository);
        addSelection(neo,  wc26Q4, teamOmega, playersSelectionRepository);
        addSelection(kai,  wc26Q4, teamOmega, playersSelectionRepository);
        addSelection(mia,  wc26Q4, teamOmega, playersSelectionRepository);
      }

      // ── Vinci Easter Cup 2026 (7 teams, gagnant TEAM_DELTA) ──
      Tournament easterCup = tournamentRepository.findByName("Vinci Easter Cup 2026").orElseThrow();
      if (matchRepository.findByTournamentOrderByRoundNumberAsc(easterCup).isEmpty()) {
        Match ec26Finale = new Match();
        ec26Finale.setTournament(easterCup);
        ec26Finale.setTeamA(teamDelta);
        ec26Finale.setTeamB(teamOmega);
        ec26Finale.setRoundNumber(3);
        ec26Finale.setDateTime(LocalDateTime.of(2026, 4, 24, 15, 0));
        ec26Finale.setState(MatchState.PLAYED);
        ec26Finale.setResultStatus(ResultStatus.VALIDATED);
        ec26Finale.setScoreA(3); ec26Finale.setScoreB(1);
        ec26Finale.setWinner(teamDelta);
        ec26Finale.setResponsibleAdmin(admin);
        ec26Finale = matchRepository.save(ec26Finale);

        Match ec26Demi1 = buildPlayedMatch(easterCup, teamDelta, teamIota, 2,
            LocalDateTime.of(2026, 4, 21, 14, 0), 2, 0, teamDelta, admin, ec26Finale, matchRepository);
        Match ec26Demi2 = buildPlayedMatch(easterCup, teamOmega, teamNova, 2,
            LocalDateTime.of(2026, 4, 21, 16, 0), 2, 1, teamOmega, admin, ec26Finale, matchRepository);

        buildPlayedMatch(easterCup, teamIota, teamVoid, 1,
            LocalDateTime.of(2026, 4, 17, 10, 0), 2, 0, teamIota, admin, ec26Demi1, matchRepository);
        buildPlayedMatch(easterCup, teamOmega, teamBlaze, 1,
            LocalDateTime.of(2026, 4, 17, 12, 0), 2, 1, teamOmega, admin, ec26Demi2, matchRepository);
        buildPlayedMatch(easterCup, teamNova, teamStorm, 1,
            LocalDateTime.of(2026, 4, 17, 14, 0), 2, 1, teamNova, admin, ec26Demi2, matchRepository);
      }

      // ════════════════════════════════════════════════════════
      // SPRING BATTLE SERIES 2026 — matchs de démo
      // ════════════════════════════════════════════════════════
      Tournament springBattle = tournamentRepository.findByName("Spring Battle Series 2026").orElseThrow();
      if (matchRepository.findByTournamentOrderByRoundNumberAsc(springBattle).isEmpty()) {

        // Round 2 — Finale (sans équipes, remplie par advanceWinner)
        Match sbsFinale = new Match();
        sbsFinale.setTournament(springBattle);
        sbsFinale.setRoundNumber(2);
        sbsFinale.setDateTime(LocalDateTime.of(2026, 5, 10, 15, 0));
        sbsFinale.setState(MatchState.SCHEDULED);
        sbsFinale.setResultStatus(ResultStatus.NOT_ENTERED);
        sbsFinale.setResponsibleAdmin(admin);
        sbsFinale = matchRepository.save(sbsFinale);

        // Round 1 — DELTA vs IOTA (heure passée, prêt pour encodage)
        Match deltaVsIota = new Match();
        deltaVsIota.setTournament(springBattle);
        deltaVsIota.setTeamA(teamDelta);
        deltaVsIota.setTeamB(teamIota);
        deltaVsIota.setRoundNumber(1);
        deltaVsIota.setDateTime(LocalDateTime.now().minusHours(1));
        deltaVsIota.setState(MatchState.SCHEDULED);
        deltaVsIota.setResultStatus(ResultStatus.NOT_ENTERED);
        deltaVsIota.setResponsibleAdmin(admin);
        deltaVsIota.setNextMatch(sbsFinale);
        deltaVsIota = matchRepository.save(deltaVsIota);

        addSelection(max,  deltaVsIota, teamDelta, playersSelectionRepository);
        addSelection(ali,  deltaVsIota, teamDelta, playersSelectionRepository);
        addSelection(zed,  deltaVsIota, teamDelta, playersSelectionRepository);
        addSelection(seb,  deltaVsIota, teamDelta, playersSelectionRepository);
        addSelection(lisa, deltaVsIota, teamIota,  playersSelectionRepository);
        addSelection(noa,  deltaVsIota, teamIota,  playersSelectionRepository);
        addSelection(tim,  deltaVsIota, teamIota,  playersSelectionRepository);
        addSelection(zoe,  deltaVsIota, teamIota,  playersSelectionRepository);

        // Round 1 — OMEGA vs ALPHA (heure future, sélections modifiables)
        Match omegaVsAlpha = new Match();
        omegaVsAlpha.setTournament(springBattle);
        omegaVsAlpha.setTeamA(teamOmega);
        omegaVsAlpha.setTeamB(teamAlpha);
        omegaVsAlpha.setRoundNumber(1);
        omegaVsAlpha.setDateTime(LocalDateTime.now().plusHours(3));
        omegaVsAlpha.setState(MatchState.SCHEDULED);
        omegaVsAlpha.setResultStatus(ResultStatus.NOT_ENTERED);
        omegaVsAlpha.setResponsibleAdmin(admin);
        omegaVsAlpha.setNextMatch(sbsFinale);
        omegaVsAlpha = matchRepository.save(omegaVsAlpha);

        addSelection(tibo, omegaVsAlpha, teamOmega, playersSelectionRepository);
        addSelection(neo,  omegaVsAlpha, teamOmega, playersSelectionRepository);
        addSelection(kai,  omegaVsAlpha, teamOmega, playersSelectionRepository);
        addSelection(mia,  omegaVsAlpha, teamOmega, playersSelectionRepository);
        addSelection(lea,  omegaVsAlpha, teamAlpha, playersSelectionRepository);
        addSelection(tom,  omegaVsAlpha, teamAlpha, playersSelectionRepository);
        addSelection(ines, omegaVsAlpha, teamAlpha, playersSelectionRepository);
        addSelection(pol,  omegaVsAlpha, teamAlpha, playersSelectionRepository);

        // Round 1 — NOVA vs VOID (heure future)
        Match novaVsVoid = new Match();
        novaVsVoid.setTournament(springBattle);
        novaVsVoid.setTeamA(teamNova);
        novaVsVoid.setTeamB(teamVoid);
        novaVsVoid.setRoundNumber(1);
        novaVsVoid.setDateTime(LocalDateTime.now().plusHours(2));
        novaVsVoid.setState(MatchState.SCHEDULED);
        novaVsVoid.setResultStatus(ResultStatus.NOT_ENTERED);
        novaVsVoid.setResponsibleAdmin(admin);
        novaVsVoid.setNextMatch(sbsFinale);
        matchRepository.save(novaVsVoid);

        // Round 1 — STORM vs BLAZE (heure future)
        Match stormVsBlaze = new Match();
        stormVsBlaze.setTournament(springBattle);
        stormVsBlaze.setTeamA(teamStorm);
        stormVsBlaze.setTeamB(teamBlaze);
        stormVsBlaze.setRoundNumber(1);
        stormVsBlaze.setDateTime(LocalDateTime.now().plusHours(4));
        stormVsBlaze.setState(MatchState.SCHEDULED);
        stormVsBlaze.setResultStatus(ResultStatus.NOT_ENTERED);
        stormVsBlaze.setResponsibleAdmin(admin);
        stormVsBlaze.setNextMatch(sbsFinale);
        matchRepository.save(stormVsBlaze);
      }
    };
  }
}