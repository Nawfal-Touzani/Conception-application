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
import java.util.Optional;
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

  private Member getOrCreateMember(String email, String password, String tag,
                                   Speciality speciality, Image image, LocalDate creationDate,
                                   MemberRepository memberRepository, BCryptPasswordEncoder passwordEncoder) {
    if (!memberRepository.existsByEmail(email)) {
      memberRepository.save(
          buildMember(email, password, tag, false, image, speciality, creationDate,
              passwordEncoder));
    }
    return memberRepository.findByEmail(email).orElseThrow();
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
    Optional<Tournament> opt = tournamentRepository.findByName(tournamentName);
    if (opt.isEmpty()) {
      return;
    }
    Tournament t = opt.get();
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

  private void addSelections4(Match match, Team team, Member m1, Member m2, Member m3, Member m4,
                              PlayersSelectionRepository repo) {
    addSelection(m1, match, team, repo);
    addSelection(m2, match, team, repo);
    addSelection(m3, match, team, repo);
    addSelection(m4, match, team, repo);
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
      final Image img0  = imageRepository.findAll().get(0);
      final Image img1  = imageRepository.findAll().get(1);
      final Image img2  = imageRepository.findAll().get(2);
      final Image img3  = imageRepository.findAll().get(3);
      final Image img4  = imageRepository.findAll().get(4);
      final Image img5  = imageRepository.findAll().get(5);
      final Image img6  = imageRepository.findAll().get(6);
      final Image img7  = imageRepository.findAll().get(7);
      final Image img8  = imageRepository.findAll().get(8);
      final Image img9  = imageRepository.findAll().get(9);
      final Image img10 = imageRepository.findAll().get(10);
      final Image img11 = imageRepository.findAll().get(11);
      final Image img12 = imageRepository.findAll().get(12);
      final Image img13 = imageRepository.findAll().get(13);
      final Image img14 = imageRepository.findAll().get(14);
      final Image img15 = imageRepository.findAll().get(15);
      final Image img16 = imageRepository.findAll().get(16);
      final Image img17 = imageRepository.findAll().get(17);
      final Image img18 = imageRepository.findAll().get(18);
      final Image img19 = imageRepository.findAll().get(19);
      final Image defaultImage = img11;

      // ── Core members ──
      if (!memberRepository.existsByEmail("lea@mail.com")) {
        memberRepository.save(buildMember("lea@mail.com", "lea", "Lynx", true, img0, tacticien, LocalDate.of(2025, 11, 12), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("tom@mail.com")) {
        memberRepository.save(buildMember("tom@mail.com", "tom", "Rogue", false, img3, executeur, LocalDate.of(2025, 12, 3), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("ines@mail.com")) {
        memberRepository.save(buildMember("ines@mail.com", "ines", "Pulse", false, img15, guerisseur, LocalDate.of(2026, 1, 18), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("pol@mail.com")) {
        memberRepository.save(buildMember("pol@mail.com", "pol", "Wolf", false, img7, architecte, LocalDate.of(2026, 2, 2), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("tibo@mail.com")) {
        memberRepository.save(buildMember("tibo@mail.com", "tibo", "Iron", false, img19, gardien, LocalDate.of(2025, 10, 27), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("neo@mail.com")) {
        memberRepository.save(buildMember("neo@mail.com", "neo", "Shade", false, img8, catalyseur, LocalDate.of(2025, 10, 30), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("kai@mail.com")) {
        memberRepository.save(buildMember("kai@mail.com", "kai", "Blaze", false, img9, perturbateur, LocalDate.of(2025, 11, 5), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("mia@mail.com")) {
        memberRepository.save(buildMember("mia@mail.com", "mia", "Nova", false, img10, guerisseur, LocalDate.of(2025, 11, 10), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("lisa@mail.com")) {
        memberRepository.save(buildMember("lisa@mail.com", "lisa", "Storm", false, img2, executeur, LocalDate.of(2026, 1, 10), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("noa@mail.com")) {
        memberRepository.save(buildMember("noa@mail.com", "noa", "Flash", false, img4, architecte, LocalDate.of(2026, 2, 2), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("tim@mail.com")) {
        memberRepository.save(buildMember("tim@mail.com", "tim", "Titi", false, img5, gardien, LocalDate.of(2026, 2, 3), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("zoe@mail.com")) {
        memberRepository.save(buildMember("zoe@mail.com", "zoe", "Vector", false, img6, catalyseur, LocalDate.of(2026, 2, 4), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("max@mail.com")) {
        memberRepository.save(buildMember("max@mail.com", "max", "Maximus", false, img12, gardien, LocalDate.of(2026, 3, 12), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("ali@mail.com")) {
        memberRepository.save(buildMember("ali@mail.com", "ali", "Putsh", false, img13, perturbateur, LocalDate.of(2026, 1, 22), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("zed@mail.com")) {
        memberRepository.save(buildMember("zed@mail.com", "zed", "Zero", true, img14, architecte, LocalDate.of(2025, 12, 11), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("seb@mail.com")) {
        memberRepository.save(buildMember("seb@mail.com", "seb", "Ice", true, img16, guerisseur, LocalDate.of(2026, 3, 1), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("oli@mail.com")) {
        memberRepository.save(buildMember("oli@mail.com", "oli", "Tiger", false, img17, tacticien, LocalDate.of(2025, 11, 11), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("fin@mail.com")) {
        memberRepository.save(buildMember("fin@mail.com", "fin", "Final", false, img18, executeur, LocalDate.of(2025, 10, 22), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("admin@vinci.be")) {
        memberRepository.save(buildMember("admin@vinci.be", "admin", "Admin", true, defaultImage, defaultSpec, LocalDate.now(), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("member@vinci.be")) {
        memberRepository.save(buildMember("member@vinci.be", "member", "Member", false, defaultImage, defaultSpec, LocalDate.now(), passwordEncoder));
      }
      if (!memberRepository.existsByEmail("banni@vinci.be")) {
        Member banni = buildMember("banni@vinci.be", "banni", "Banni", false, defaultImage, defaultSpec, LocalDate.now(), passwordEncoder);
        memberRepository.save(banni);
        Member adminRef = memberRepository.findByEmail("admin@vinci.be").orElseThrow();
        banishmentService.banMember(banni.getId(), adminRef.getId(), "Test de banissement pour données de test");
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

      // ── Core teams ──
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

      // ── Extra teams with 4 members each ──
      // TEAM_NOVA
      createMemberAndTeam("zara@mail.com", "zara", "Viper", architecte, img1, LocalDate.of(2025, 9, 5), "TEAM_NOVA", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamNova = teamRepository.findByName("TEAM_NOVA").orElseThrow();
      Member nova2 = getOrCreateMember("nova2@mail.com", "nova2", "Nova2", catalyseur, img2, LocalDate.of(2025, 9, 6), memberRepository, passwordEncoder);
      Member nova3 = getOrCreateMember("nova3@mail.com", "nova3", "Nova3", gardien,    img3, LocalDate.of(2025, 9, 7), memberRepository, passwordEncoder);
      Member nova4 = getOrCreateMember("nova4@mail.com", "nova4", "Nova4", executeur,  img4, LocalDate.of(2025, 9, 8), memberRepository, passwordEncoder);
      addToTeam(nova2, teamNova, teamCompositionRepository);
      addToTeam(nova3, teamNova, teamCompositionRepository);
      addToTeam(nova4, teamNova, teamCompositionRepository);
      Member nova1 = memberRepository.findByEmail("zara@mail.com").orElseThrow();

      // TEAM_VOID
      createMemberAndTeam("kael@mail.com", "kael", "Kael", catalyseur, img2, LocalDate.of(2025, 8, 14), "TEAM_VOID", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamVoid = teamRepository.findByName("TEAM_VOID").orElseThrow();
      Member void2 = getOrCreateMember("void2@mail.com", "void2", "Void2", tacticien,    img5, LocalDate.of(2025, 8, 15), memberRepository, passwordEncoder);
      Member void3 = getOrCreateMember("void3@mail.com", "void3", "Void3", perturbateur, img6, LocalDate.of(2025, 8, 16), memberRepository, passwordEncoder);
      Member void4 = getOrCreateMember("void4@mail.com", "void4", "Void4", guerisseur,   img7, LocalDate.of(2025, 8, 17), memberRepository, passwordEncoder);
      addToTeam(void2, teamVoid, teamCompositionRepository);
      addToTeam(void3, teamVoid, teamCompositionRepository);
      addToTeam(void4, teamVoid, teamCompositionRepository);
      Member void1 = memberRepository.findByEmail("kael@mail.com").orElseThrow();

      // TEAM_STORM
      createMemberAndTeam("sora@mail.com", "sora", "Sora", guerisseur, img4, LocalDate.of(2025, 7, 22), "TEAM_STORM", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamStorm = teamRepository.findByName("TEAM_STORM").orElseThrow();
      Member storm2 = getOrCreateMember("storm2@mail.com", "storm2", "Storm2", architecte, img8,  LocalDate.of(2025, 7, 23), memberRepository, passwordEncoder);
      Member storm3 = getOrCreateMember("storm3@mail.com", "storm3", "Storm3", executeur,  img9,  LocalDate.of(2025, 7, 24), memberRepository, passwordEncoder);
      Member storm4 = getOrCreateMember("storm4@mail.com", "storm4", "Storm4", gardien,    img10, LocalDate.of(2025, 7, 25), memberRepository, passwordEncoder);
      addToTeam(storm2, teamStorm, teamCompositionRepository);
      addToTeam(storm3, teamStorm, teamCompositionRepository);
      addToTeam(storm4, teamStorm, teamCompositionRepository);
      Member storm1 = memberRepository.findByEmail("sora@mail.com").orElseThrow();

      // TEAM_BLAZE
      createMemberAndTeam("rex@mail.com", "rex", "Rex", gardien, img5, LocalDate.of(2025, 6, 30), "TEAM_BLAZE", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamBlaze = teamRepository.findByName("TEAM_BLAZE").orElseThrow();
      Member blaze2 = getOrCreateMember("blaze2@mail.com", "blaze2", "Blaze2", catalyseur,  img11, LocalDate.of(2025, 7, 1), memberRepository, passwordEncoder);
      Member blaze3 = getOrCreateMember("blaze3@mail.com", "blaze3", "Blaze3", tacticien,   img12, LocalDate.of(2025, 7, 2), memberRepository, passwordEncoder);
      Member blaze4 = getOrCreateMember("blaze4@mail.com", "blaze4", "Blaze4", perturbateur,img13, LocalDate.of(2025, 7, 3), memberRepository, passwordEncoder);
      addToTeam(blaze2, teamBlaze, teamCompositionRepository);
      addToTeam(blaze3, teamBlaze, teamCompositionRepository);
      addToTeam(blaze4, teamBlaze, teamCompositionRepository);
      Member blaze1 = memberRepository.findByEmail("rex@mail.com").orElseThrow();

      // TEAM_FROST
      createMemberAndTeam("nyx@mail.com", "nyx", "Nyx", perturbateur, img6, LocalDate.of(2025, 5, 18), "TEAM_FROST", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamFrost = teamRepository.findByName("TEAM_FROST").orElseThrow();
      Member frost2 = getOrCreateMember("frost2@mail.com", "frost2", "Frost2", guerisseur, img14, LocalDate.of(2025, 5, 19), memberRepository, passwordEncoder);
      Member frost3 = getOrCreateMember("frost3@mail.com", "frost3", "Frost3", architecte, img15, LocalDate.of(2025, 5, 20), memberRepository, passwordEncoder);
      Member frost4 = getOrCreateMember("frost4@mail.com", "frost4", "Frost4", gardien,    img16, LocalDate.of(2025, 5, 21), memberRepository, passwordEncoder);
      addToTeam(frost2, teamFrost, teamCompositionRepository);
      addToTeam(frost3, teamFrost, teamCompositionRepository);
      addToTeam(frost4, teamFrost, teamCompositionRepository);
      Member frost1 = memberRepository.findByEmail("nyx@mail.com").orElseThrow();

      // TEAM_EMBER
      createMemberAndTeam("drak@mail.com", "drak", "Drak", tacticien, img7, LocalDate.of(2025, 4, 10), "TEAM_EMBER", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamEmber = teamRepository.findByName("TEAM_EMBER").orElseThrow();
      Member ember2 = getOrCreateMember("ember2@mail.com", "ember2", "Ember2", executeur,   img17, LocalDate.of(2025, 4, 11), memberRepository, passwordEncoder);
      Member ember3 = getOrCreateMember("ember3@mail.com", "ember3", "Ember3", catalyseur,  img18, LocalDate.of(2025, 4, 12), memberRepository, passwordEncoder);
      Member ember4 = getOrCreateMember("ember4@mail.com", "ember4", "Ember4", perturbateur,img19, LocalDate.of(2025, 4, 13), memberRepository, passwordEncoder);
      addToTeam(ember2, teamEmber, teamCompositionRepository);
      addToTeam(ember3, teamEmber, teamCompositionRepository);
      addToTeam(ember4, teamEmber, teamCompositionRepository);
      Member ember1 = memberRepository.findByEmail("drak@mail.com").orElseThrow();

      // TEAM_SURGE
      createMemberAndTeam("lumi@mail.com", "lumi", "Lumi", executeur, img8, LocalDate.of(2025, 3, 25), "TEAM_SURGE", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamSurge = teamRepository.findByName("TEAM_SURGE").orElseThrow();
      Member surge2 = getOrCreateMember("surge2@mail.com", "surge2", "Surge2", tacticien,  img0, LocalDate.of(2025, 3, 26), memberRepository, passwordEncoder);
      Member surge3 = getOrCreateMember("surge3@mail.com", "surge3", "Surge3", gardien,    img1, LocalDate.of(2025, 3, 27), memberRepository, passwordEncoder);
      Member surge4 = getOrCreateMember("surge4@mail.com", "surge4", "Surge4", guerisseur, img2, LocalDate.of(2025, 3, 28), memberRepository, passwordEncoder);
      addToTeam(surge2, teamSurge, teamCompositionRepository);
      addToTeam(surge3, teamSurge, teamCompositionRepository);
      addToTeam(surge4, teamSurge, teamCompositionRepository);
      Member surge1 = memberRepository.findByEmail("lumi@mail.com").orElseThrow();

      // TEAM_CRYPT
      createMemberAndTeam("fenn@mail.com", "fenn", "Fenn", architecte, img9, LocalDate.of(2025, 2, 14), "TEAM_CRYPT", memberRepository, teamRepository, teamCompositionRepository, passwordEncoder);
      Team teamCrypt = teamRepository.findByName("TEAM_CRYPT").orElseThrow();
      Member crypt2 = getOrCreateMember("crypt2@mail.com", "crypt2", "Crypt2", catalyseur,  img3, LocalDate.of(2025, 2, 15), memberRepository, passwordEncoder);
      Member crypt3 = getOrCreateMember("crypt3@mail.com", "crypt3", "Crypt3", perturbateur,img4, LocalDate.of(2025, 2, 16), memberRepository, passwordEncoder);
      Member crypt4 = getOrCreateMember("crypt4@mail.com", "crypt4", "Crypt4", executeur,   img5, LocalDate.of(2025, 2, 17), memberRepository, passwordEncoder);
      addToTeam(crypt2, teamCrypt, teamCompositionRepository);
      addToTeam(crypt3, teamCrypt, teamCompositionRepository);
      addToTeam(crypt4, teamCrypt, teamCompositionRepository);
      Member crypt1 = memberRepository.findByEmail("fenn@mail.com").orElseThrow();

      // ── Tournois ──
      if (!tournamentRepository.existsByName("Spring Arena Cup 2025")) {
        tournamentRepository.save(buildTournament("Spring Arena Cup 2025", "Compétition printanière ouverte aux nouvelles teams émergentes", LocalDate.of(2025, 4, 15), LocalDate.of(2025, 4, 25), LocalDate.of(2025, 4, 10), 8, Status.FINISHED, true, admin));
      }
      if (!tournamentRepository.existsByName("Elite Championship 2025")) {
        tournamentRepository.save(buildTournament("Elite Championship 2025", "Compétition élite réservée aux meilleures teams", LocalDate.of(2025, 5, 15), LocalDate.of(2025, 5, 30), LocalDate.of(2025, 5, 11), 8, Status.FINISHED, true, admin));
      }
      if (!tournamentRepository.existsByName("Summer Pro League 2025")) {
        tournamentRepository.save(buildTournament("Summer Pro League 2025", "Tournoi estival de haut niveau avec les meilleures teams", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 15), LocalDate.of(2025, 6, 25), 16, Status.FINISHED, true, admin));
      }
      if (!tournamentRepository.existsByName("Vinci Winter Clash 2026")) {
        tournamentRepository.save(buildTournament("Vinci Winter Clash 2026", "Tournoi hivernal réunissant des équipes semi-professionnelles", LocalDate.of(2026, 1, 10), LocalDate.of(2026, 1, 20), LocalDate.of(2026, 1, 5), 12, Status.FINISHED, true, admin));
      }
      if (!tournamentRepository.existsByName("Vinci Easter Cup 2026")) {
        tournamentRepository.save(buildTournament("Vinci Easter Cup 2026", "Tournoi de Pâques ouvert à toutes les teams actives", LocalDate.of(2026, 4, 15), LocalDate.of(2026, 4, 25), LocalDate.of(2026, 4, 8), 8, Status.FINISHED, true, admin));
      }
      if (!tournamentRepository.existsByName("Spring Battle Series 2026")) {
        tournamentRepository.save(buildTournament("Spring Battle Series 2026", "Série printanière avec élimination directe et forte participation", LocalDate.of(2026, 5, 4), LocalDate.of(2026, 5, 12), LocalDate.of(2026, 5, 1), 8, Status.IN_PROGRESS, true, admin));
      }
      if (!tournamentRepository.existsByName("Elite Championship 2026")) {
        tournamentRepository.save(buildTournament("Elite Championship 2026", "Compétition élite réservée aux meilleures teams", LocalDate.of(2026, 5, 16), LocalDate.of(2026, 5, 30), LocalDate.of(2026, 5, 13), 10, Status.PREPARATION, true, admin));
      }

      // ── Inscriptions & gagnants ──
      setupTournament("Spring Arena Cup 2025", teamOmega, List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze), tournamentRepository, registrationRepository);
      setupTournament("Elite Championship 2025", teamIota, List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm), tournamentRepository, registrationRepository);
      setupTournament("Summer Pro League 2025", teamAlpha, List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt, teamDelta), tournamentRepository, registrationRepository);
      setupTournament("Vinci Winter Clash 2026", teamDelta, List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze, teamFrost, teamEmber, teamSurge, teamCrypt, teamDelta), tournamentRepository, registrationRepository);
      setupTournament("Vinci Easter Cup 2026", teamDelta, List.of(teamDelta, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze), tournamentRepository, registrationRepository);
      setupTournament("Spring Battle Series 2026", null, List.of(teamAlpha, teamOmega, teamIota, teamDelta, teamNova, teamVoid, teamStorm, teamBlaze), tournamentRepository, registrationRepository);
      setupTournament("Elite Championship 2026", null, List.of(teamAlpha, teamOmega, teamIota, teamNova, teamVoid, teamStorm, teamBlaze, teamFrost, teamEmber), tournamentRepository, registrationRepository);

      // ════════════════════════════════════════════════════════
      // BRACKETS TOURNOIS TERMINÉS
      // ════════════════════════════════════════════════════════

      // ── Spring Arena Cup 2025 (7 teams, gagnant TEAM_OMEGA) ──
      // R1: OMEGA vs NOVA, IOTA vs VOID, ALPHA vs STORM | bye: BLAZE
      // R2: OMEGA vs IOTA, BLAZE vs ALPHA
      // R3: OMEGA vs BLAZE (finale)
      Optional<Tournament> springArenaOpt = tournamentRepository.findByName("Spring Arena Cup 2025");
      if (springArenaOpt.isPresent()) {
        Tournament sac = springArenaOpt.get();
        if (matchRepository.findByTournamentOrderByRoundNumberAsc(sac).isEmpty()) {
          Match sacFinale = new Match();
          sacFinale.setTournament(sac); sacFinale.setTeamA(teamOmega); sacFinale.setTeamB(teamBlaze);
          sacFinale.setRoundNumber(3); sacFinale.setDateTime(LocalDateTime.of(2025, 4, 24, 15, 0));
          sacFinale.setState(MatchState.PLAYED); sacFinale.setResultStatus(ResultStatus.VALIDATED);
          sacFinale.setScoreA(3); sacFinale.setScoreB(1); sacFinale.setWinner(teamOmega);
          sacFinale.setResponsibleAdmin(admin);
          sacFinale = matchRepository.save(sacFinale);
          addSelections4(sacFinale, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(sacFinale, teamBlaze, blaze1, blaze2, blaze3, blaze4, playersSelectionRepository);

          Match sacDemi1 = buildPlayedMatch(sac, teamOmega, teamIota, 2, LocalDateTime.of(2025, 4, 21, 14, 0), 2, 0, teamOmega, admin, sacFinale, matchRepository);
          addSelections4(sacDemi1, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(sacDemi1, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);

          Match sacDemi2 = buildPlayedMatch(sac, teamBlaze, teamAlpha, 2, LocalDateTime.of(2025, 4, 21, 16, 0), 2, 1, teamBlaze, admin, sacFinale, matchRepository);
          addSelections4(sacDemi2, teamBlaze, blaze1, blaze2, blaze3, blaze4, playersSelectionRepository);
          addSelections4(sacDemi2, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);

          Match sacR1m1 = buildPlayedMatch(sac, teamOmega, teamNova, 1, LocalDateTime.of(2025, 4, 17, 10, 0), 2, 0, teamOmega, admin, sacDemi1, matchRepository);
          addSelections4(sacR1m1, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(sacR1m1, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);

          Match sacR1m2 = buildPlayedMatch(sac, teamIota, teamVoid, 1, LocalDateTime.of(2025, 4, 17, 12, 0), 2, 1, teamIota, admin, sacDemi1, matchRepository);
          addSelections4(sacR1m2, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);
          addSelections4(sacR1m2, teamVoid, void1, void2, void3, void4, playersSelectionRepository);

          Match sacR1m3 = buildPlayedMatch(sac, teamAlpha, teamStorm, 1, LocalDateTime.of(2025, 4, 17, 14, 0), 2, 0, teamAlpha, admin, sacDemi2, matchRepository);
          addSelections4(sacR1m3, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(sacR1m3, teamStorm, storm1, storm2, storm3, storm4, playersSelectionRepository);
        }
      }

      // ── Elite Championship 2025 (6 teams, gagnant TEAM_IOTA) ──
      // R1: OMEGA vs STORM, NOVA vs VOID | bye: IOTA, ALPHA
      // R2: IOTA vs OMEGA, ALPHA vs NOVA
      // R3: IOTA vs ALPHA (finale)
      Optional<Tournament> ec25Opt = tournamentRepository.findByName("Elite Championship 2025");
      if (ec25Opt.isPresent()) {
        Tournament ec25 = ec25Opt.get();
        if (matchRepository.findByTournamentOrderByRoundNumberAsc(ec25).isEmpty()) {
          Match ec25Finale = new Match();
          ec25Finale.setTournament(ec25); ec25Finale.setTeamA(teamIota); ec25Finale.setTeamB(teamAlpha);
          ec25Finale.setRoundNumber(3); ec25Finale.setDateTime(LocalDateTime.of(2025, 5, 29, 15, 0));
          ec25Finale.setState(MatchState.PLAYED); ec25Finale.setResultStatus(ResultStatus.VALIDATED);
          ec25Finale.setScoreA(3); ec25Finale.setScoreB(2); ec25Finale.setWinner(teamIota);
          ec25Finale.setResponsibleAdmin(admin);
          ec25Finale = matchRepository.save(ec25Finale);
          addSelections4(ec25Finale, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);
          addSelections4(ec25Finale, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);

          Match ec25Demi1 = buildPlayedMatch(ec25, teamIota, teamOmega, 2, LocalDateTime.of(2025, 5, 26, 14, 0), 2, 1, teamIota, admin, ec25Finale, matchRepository);
          addSelections4(ec25Demi1, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);
          addSelections4(ec25Demi1, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);

          Match ec25Demi2 = buildPlayedMatch(ec25, teamAlpha, teamNova, 2, LocalDateTime.of(2025, 5, 26, 16, 0), 2, 0, teamAlpha, admin, ec25Finale, matchRepository);
          addSelections4(ec25Demi2, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(ec25Demi2, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);

          Match ec25R1m1 = buildPlayedMatch(ec25, teamOmega, teamStorm, 1, LocalDateTime.of(2025, 5, 22, 14, 0), 2, 0, teamOmega, admin, ec25Demi1, matchRepository);
          addSelections4(ec25R1m1, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(ec25R1m1, teamStorm, storm1, storm2, storm3, storm4, playersSelectionRepository);

          Match ec25R1m2 = buildPlayedMatch(ec25, teamNova, teamVoid, 1, LocalDateTime.of(2025, 5, 22, 16, 0), 2, 1, teamNova, admin, ec25Demi2, matchRepository);
          addSelections4(ec25R1m2, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);
          addSelections4(ec25R1m2, teamVoid, void1, void2, void3, void4, playersSelectionRepository);
        }
      }

      // ── Summer Pro League 2025 (12 teams, gagnant TEAM_ALPHA) ──
      // R1: NOVA vs VOID, CRYPT vs FROST, BLAZE vs EMBER, SURGE vs STORM | bye: ALPHA,IOTA,OMEGA,DELTA
      // R2: ALPHA vs NOVA, IOTA vs CRYPT, OMEGA vs BLAZE, DELTA vs SURGE
      // R3: ALPHA vs IOTA, OMEGA vs DELTA
      // R4: ALPHA vs OMEGA (finale)
      Optional<Tournament> splOpt = tournamentRepository.findByName("Summer Pro League 2025");
      if (splOpt.isPresent()) {
        Tournament spl = splOpt.get();
        if (matchRepository.findByTournamentOrderByRoundNumberAsc(spl).isEmpty()) {
          Match splFinale = new Match();
          splFinale.setTournament(spl); splFinale.setTeamA(teamAlpha); splFinale.setTeamB(teamOmega);
          splFinale.setRoundNumber(4); splFinale.setDateTime(LocalDateTime.of(2025, 7, 14, 15, 0));
          splFinale.setState(MatchState.PLAYED); splFinale.setResultStatus(ResultStatus.VALIDATED);
          splFinale.setScoreA(3); splFinale.setScoreB(1); splFinale.setWinner(teamAlpha);
          splFinale.setResponsibleAdmin(admin);
          splFinale = matchRepository.save(splFinale);
          addSelections4(splFinale, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(splFinale, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);

          Match splDemi1 = buildPlayedMatch(spl, teamAlpha, teamIota, 3, LocalDateTime.of(2025, 7, 11, 14, 0), 2, 1, teamAlpha, admin, splFinale, matchRepository);
          addSelections4(splDemi1, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(splDemi1, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);

          Match splDemi2 = buildPlayedMatch(spl, teamOmega, teamDelta, 3, LocalDateTime.of(2025, 7, 11, 16, 0), 2, 0, teamOmega, admin, splFinale, matchRepository);
          addSelections4(splDemi2, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(splDemi2, teamDelta, max, ali, zed, seb, playersSelectionRepository);

          Match splQ1 = buildPlayedMatch(spl, teamAlpha, teamNova, 2, LocalDateTime.of(2025, 7, 8, 10, 0), 2, 0, teamAlpha, admin, splDemi1, matchRepository);
          addSelections4(splQ1, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(splQ1, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);

          Match splQ2 = buildPlayedMatch(spl, teamIota, teamCrypt, 2, LocalDateTime.of(2025, 7, 8, 12, 0), 2, 1, teamIota, admin, splDemi1, matchRepository);
          addSelections4(splQ2, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);
          addSelections4(splQ2, teamCrypt, crypt1, crypt2, crypt3, crypt4, playersSelectionRepository);

          Match splQ3 = buildPlayedMatch(spl, teamOmega, teamBlaze, 2, LocalDateTime.of(2025, 7, 8, 14, 0), 2, 0, teamOmega, admin, splDemi2, matchRepository);
          addSelections4(splQ3, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(splQ3, teamBlaze, blaze1, blaze2, blaze3, blaze4, playersSelectionRepository);

          Match splQ4 = buildPlayedMatch(spl, teamDelta, teamSurge, 2, LocalDateTime.of(2025, 7, 8, 16, 0), 2, 1, teamDelta, admin, splDemi2, matchRepository);
          addSelections4(splQ4, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(splQ4, teamSurge, surge1, surge2, surge3, surge4, playersSelectionRepository);

          Match splR1m1 = buildPlayedMatch(spl, teamNova, teamVoid, 1, LocalDateTime.of(2025, 7, 3, 10, 0), 2, 0, teamNova, admin, splQ1, matchRepository);
          addSelections4(splR1m1, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);
          addSelections4(splR1m1, teamVoid, void1, void2, void3, void4, playersSelectionRepository);

          Match splR1m2 = buildPlayedMatch(spl, teamCrypt, teamFrost, 1, LocalDateTime.of(2025, 7, 3, 12, 0), 2, 1, teamCrypt, admin, splQ2, matchRepository);
          addSelections4(splR1m2, teamCrypt, crypt1, crypt2, crypt3, crypt4, playersSelectionRepository);
          addSelections4(splR1m2, teamFrost, frost1, frost2, frost3, frost4, playersSelectionRepository);

          Match splR1m3 = buildPlayedMatch(spl, teamBlaze, teamEmber, 1, LocalDateTime.of(2025, 7, 3, 14, 0), 2, 0, teamBlaze, admin, splQ3, matchRepository);
          addSelections4(splR1m3, teamBlaze, blaze1, blaze2, blaze3, blaze4, playersSelectionRepository);
          addSelections4(splR1m3, teamEmber, ember1, ember2, ember3, ember4, playersSelectionRepository);

          Match splR1m4 = buildPlayedMatch(spl, teamSurge, teamStorm, 1, LocalDateTime.of(2025, 7, 3, 16, 0), 2, 1, teamSurge, admin, splQ4, matchRepository);
          addSelections4(splR1m4, teamSurge, surge1, surge2, surge3, surge4, playersSelectionRepository);
          addSelections4(splR1m4, teamStorm, storm1, storm2, storm3, storm4, playersSelectionRepository);
        }
      }

      // ── Vinci Winter Clash 2026 (12 teams, gagnant TEAM_DELTA) ──
      // R1: NOVA vs VOID, CRYPT vs BLAZE, FROST vs STORM, SURGE vs EMBER | bye: DELTA,IOTA,ALPHA,OMEGA
      // R2: DELTA vs NOVA, IOTA vs CRYPT, ALPHA vs FROST, OMEGA vs SURGE
      // R3: DELTA vs IOTA, ALPHA vs OMEGA
      // R4: DELTA vs ALPHA (finale)
      Optional<Tournament> wcOpt = tournamentRepository.findByName("Vinci Winter Clash 2026");
      if (wcOpt.isPresent()) {
        Tournament wc = wcOpt.get();
        if (matchRepository.findByTournamentOrderByRoundNumberAsc(wc).isEmpty()) {
          Match wcFinale = new Match();
          wcFinale.setTournament(wc); wcFinale.setTeamA(teamDelta); wcFinale.setTeamB(teamAlpha);
          wcFinale.setRoundNumber(4); wcFinale.setDateTime(LocalDateTime.of(2026, 1, 19, 15, 0));
          wcFinale.setState(MatchState.PLAYED); wcFinale.setResultStatus(ResultStatus.VALIDATED);
          wcFinale.setScoreA(3); wcFinale.setScoreB(2); wcFinale.setWinner(teamDelta);
          wcFinale.setResponsibleAdmin(admin);
          wcFinale = matchRepository.save(wcFinale);
          addSelections4(wcFinale, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(wcFinale, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);

          Match wcDemi1 = buildPlayedMatch(wc, teamDelta, teamIota, 3, LocalDateTime.of(2026, 1, 16, 14, 0), 2, 1, teamDelta, admin, wcFinale, matchRepository);
          addSelections4(wcDemi1, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(wcDemi1, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);

          Match wcDemi2 = buildPlayedMatch(wc, teamAlpha, teamOmega, 3, LocalDateTime.of(2026, 1, 16, 16, 0), 2, 0, teamAlpha, admin, wcFinale, matchRepository);
          addSelections4(wcDemi2, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(wcDemi2, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);

          Match wcQ1 = buildPlayedMatch(wc, teamDelta, teamNova, 2, LocalDateTime.of(2026, 1, 13, 10, 0), 2, 0, teamDelta, admin, wcDemi1, matchRepository);
          addSelections4(wcQ1, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(wcQ1, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);

          Match wcQ2 = buildPlayedMatch(wc, teamIota, teamCrypt, 2, LocalDateTime.of(2026, 1, 13, 12, 0), 2, 1, teamIota, admin, wcDemi1, matchRepository);
          addSelections4(wcQ2, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);
          addSelections4(wcQ2, teamCrypt, crypt1, crypt2, crypt3, crypt4, playersSelectionRepository);

          Match wcQ3 = buildPlayedMatch(wc, teamAlpha, teamFrost, 2, LocalDateTime.of(2026, 1, 13, 14, 0), 2, 0, teamAlpha, admin, wcDemi2, matchRepository);
          addSelections4(wcQ3, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);
          addSelections4(wcQ3, teamFrost, frost1, frost2, frost3, frost4, playersSelectionRepository);

          Match wcQ4 = buildPlayedMatch(wc, teamOmega, teamSurge, 2, LocalDateTime.of(2026, 1, 13, 16, 0), 2, 1, teamOmega, admin, wcDemi2, matchRepository);
          addSelections4(wcQ4, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(wcQ4, teamSurge, surge1, surge2, surge3, surge4, playersSelectionRepository);

          Match wcR1m1 = buildPlayedMatch(wc, teamNova, teamVoid, 1, LocalDateTime.of(2026, 1, 11, 10, 0), 2, 1, teamNova, admin, wcQ1, matchRepository);
          addSelections4(wcR1m1, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);
          addSelections4(wcR1m1, teamVoid, void1, void2, void3, void4, playersSelectionRepository);

          Match wcR1m2 = buildPlayedMatch(wc, teamCrypt, teamBlaze, 1, LocalDateTime.of(2026, 1, 11, 12, 0), 2, 0, teamCrypt, admin, wcQ2, matchRepository);
          addSelections4(wcR1m2, teamCrypt, crypt1, crypt2, crypt3, crypt4, playersSelectionRepository);
          addSelections4(wcR1m2, teamBlaze, blaze1, blaze2, blaze3, blaze4, playersSelectionRepository);

          Match wcR1m3 = buildPlayedMatch(wc, teamFrost, teamStorm, 1, LocalDateTime.of(2026, 1, 11, 14, 0), 2, 1, teamFrost, admin, wcQ3, matchRepository);
          addSelections4(wcR1m3, teamFrost, frost1, frost2, frost3, frost4, playersSelectionRepository);
          addSelections4(wcR1m3, teamStorm, storm1, storm2, storm3, storm4, playersSelectionRepository);

          Match wcR1m4 = buildPlayedMatch(wc, teamSurge, teamEmber, 1, LocalDateTime.of(2026, 1, 11, 16, 0), 2, 0, teamSurge, admin, wcQ4, matchRepository);
          addSelections4(wcR1m4, teamSurge, surge1, surge2, surge3, surge4, playersSelectionRepository);
          addSelections4(wcR1m4, teamEmber, ember1, ember2, ember3, ember4, playersSelectionRepository);
        }
      }

      // ── Vinci Easter Cup 2026 (7 teams, gagnant TEAM_DELTA) ──
      // R1: IOTA vs VOID, OMEGA vs BLAZE, NOVA vs STORM | bye: DELTA
      // R2: DELTA vs IOTA, OMEGA vs NOVA
      // R3: DELTA vs OMEGA (finale)
      Optional<Tournament> ecOpt = tournamentRepository.findByName("Vinci Easter Cup 2026");
      if (ecOpt.isPresent()) {
        Tournament ec = ecOpt.get();
        if (matchRepository.findByTournamentOrderByRoundNumberAsc(ec).isEmpty()) {
          Match ecFinale = new Match();
          ecFinale.setTournament(ec); ecFinale.setTeamA(teamDelta); ecFinale.setTeamB(teamOmega);
          ecFinale.setRoundNumber(3); ecFinale.setDateTime(LocalDateTime.of(2026, 4, 24, 15, 0));
          ecFinale.setState(MatchState.PLAYED); ecFinale.setResultStatus(ResultStatus.VALIDATED);
          ecFinale.setScoreA(3); ecFinale.setScoreB(1); ecFinale.setWinner(teamDelta);
          ecFinale.setResponsibleAdmin(admin);
          ecFinale = matchRepository.save(ecFinale);
          addSelections4(ecFinale, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(ecFinale, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);

          Match ecDemi1 = buildPlayedMatch(ec, teamDelta, teamIota, 2, LocalDateTime.of(2026, 4, 21, 14, 0), 2, 0, teamDelta, admin, ecFinale, matchRepository);
          addSelections4(ecDemi1, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(ecDemi1, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);

          Match ecDemi2 = buildPlayedMatch(ec, teamOmega, teamNova, 2, LocalDateTime.of(2026, 4, 21, 16, 0), 2, 1, teamOmega, admin, ecFinale, matchRepository);
          addSelections4(ecDemi2, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(ecDemi2, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);

          Match ecR1m1 = buildPlayedMatch(ec, teamIota, teamVoid, 1, LocalDateTime.of(2026, 4, 17, 10, 0), 2, 0, teamIota, admin, ecDemi1, matchRepository);
          addSelections4(ecR1m1, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);
          addSelections4(ecR1m1, teamVoid, void1, void2, void3, void4, playersSelectionRepository);

          Match ecR1m2 = buildPlayedMatch(ec, teamOmega, teamBlaze, 1, LocalDateTime.of(2026, 4, 17, 12, 0), 2, 1, teamOmega, admin, ecDemi2, matchRepository);
          addSelections4(ecR1m2, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(ecR1m2, teamBlaze, blaze1, blaze2, blaze3, blaze4, playersSelectionRepository);

          Match ecR1m3 = buildPlayedMatch(ec, teamNova, teamStorm, 1, LocalDateTime.of(2026, 4, 17, 14, 0), 2, 1, teamNova, admin, ecDemi2, matchRepository);
          addSelections4(ecR1m3, teamNova, nova1, nova2, nova3, nova4, playersSelectionRepository);
          addSelections4(ecR1m3, teamStorm, storm1, storm2, storm3, storm4, playersSelectionRepository);
        }
      }

      // ── Spring Battle Series 2026 — matchs de démo ──
      Optional<Tournament> sbsOpt = tournamentRepository.findByName("Spring Battle Series 2026");
      if (sbsOpt.isPresent()) {
        Tournament sbs = sbsOpt.get();
        if (matchRepository.findByTournamentOrderByRoundNumberAsc(sbs).isEmpty()) {

          Match sbsFinale = new Match();
          sbsFinale.setTournament(sbs); sbsFinale.setRoundNumber(2);
          sbsFinale.setDateTime(LocalDateTime.of(2026, 5, 10, 15, 0));
          sbsFinale.setState(MatchState.SCHEDULED); sbsFinale.setResultStatus(ResultStatus.NOT_ENTERED);
          sbsFinale.setResponsibleAdmin(admin);
          sbsFinale = matchRepository.save(sbsFinale);

          // DELTA vs IOTA — heure passée, prêt pour encodage
          Match deltaVsIota = new Match();
          deltaVsIota.setTournament(sbs); deltaVsIota.setTeamA(teamDelta); deltaVsIota.setTeamB(teamIota);
          deltaVsIota.setRoundNumber(1); deltaVsIota.setDateTime(LocalDateTime.now().minusHours(1));
          deltaVsIota.setState(MatchState.SCHEDULED); deltaVsIota.setResultStatus(ResultStatus.NOT_ENTERED);
          deltaVsIota.setResponsibleAdmin(admin); deltaVsIota.setNextMatch(sbsFinale);
          deltaVsIota = matchRepository.save(deltaVsIota);
          addSelections4(deltaVsIota, teamDelta, max, ali, zed, seb, playersSelectionRepository);
          addSelections4(deltaVsIota, teamIota, lisa, noa, tim, zoe, playersSelectionRepository);

          // OMEGA vs ALPHA — heure future, sélections modifiables
          Match omegaVsAlpha = new Match();
          omegaVsAlpha.setTournament(sbs); omegaVsAlpha.setTeamA(teamOmega); omegaVsAlpha.setTeamB(teamAlpha);
          omegaVsAlpha.setRoundNumber(1); omegaVsAlpha.setDateTime(LocalDateTime.now().plusHours(3));
          omegaVsAlpha.setState(MatchState.SCHEDULED); omegaVsAlpha.setResultStatus(ResultStatus.NOT_ENTERED);
          omegaVsAlpha.setResponsibleAdmin(admin); omegaVsAlpha.setNextMatch(sbsFinale);
          omegaVsAlpha = matchRepository.save(omegaVsAlpha);
          addSelections4(omegaVsAlpha, teamOmega, tibo, neo, kai, mia, playersSelectionRepository);
          addSelections4(omegaVsAlpha, teamAlpha, lea, tom, ines, pol, playersSelectionRepository);

          // NOVA vs VOID
          Match novaVsVoid = new Match();
          novaVsVoid.setTournament(sbs); novaVsVoid.setTeamA(teamNova); novaVsVoid.setTeamB(teamVoid);
          novaVsVoid.setRoundNumber(1); novaVsVoid.setDateTime(LocalDateTime.now().plusHours(2));
          novaVsVoid.setState(MatchState.SCHEDULED); novaVsVoid.setResultStatus(ResultStatus.NOT_ENTERED);
          novaVsVoid.setResponsibleAdmin(admin); novaVsVoid.setNextMatch(sbsFinale);
          matchRepository.save(novaVsVoid);

          // STORM vs BLAZE
          Match stormVsBlaze = new Match();
          stormVsBlaze.setTournament(sbs); stormVsBlaze.setTeamA(teamStorm); stormVsBlaze.setTeamB(teamBlaze);
          stormVsBlaze.setRoundNumber(1); stormVsBlaze.setDateTime(LocalDateTime.now().plusHours(4));
          stormVsBlaze.setState(MatchState.SCHEDULED); stormVsBlaze.setResultStatus(ResultStatus.NOT_ENTERED);
          stormVsBlaze.setResponsibleAdmin(admin); stormVsBlaze.setNextMatch(sbsFinale);
          matchRepository.save(stormVsBlaze);
        }
      }
    };
  }
}