package be.vinci.ipl.cae.api.configuration;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
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
                                     BCryptPasswordEncoder passwordEncoder) {
    return args -> {


      // 1. Image
      Image defaultImage;
      List<Image> images = imageRepository.findAll();
      if (images.isEmpty()) {
        defaultImage = new Image();
        defaultImage.setUrl("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRTZjZFbcuX7hBSisFiZXdPRCG9t14Kt0Xxg&s");
        defaultImage = imageRepository.save(defaultImage);
      } else {
        defaultImage = images.getFirst();
      }

      // 2. Speciality
      Speciality defaultSpeciality;
      List<Speciality> specialities = specialityRepository.findAll();
      if (specialities.isEmpty()) {
        defaultSpeciality = new Speciality();
        defaultSpeciality.setName("Architecte");
        defaultSpeciality = specialityRepository.save(defaultSpeciality);
      } else {
        defaultSpeciality = specialities.getFirst();
      }

      if (!memberRepository.existsByEmail("admin@vinci.be")) {
        Member admin = new Member();
        admin.setEmail("admin@vinci.be");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setTag("Admin");
        admin.setAdmin(true);
        admin.setImage(defaultImage);
        admin.setSpeciality(defaultSpeciality);

        memberRepository.save(admin);
      }

      if (!memberRepository.existsByEmail("user@vinci.be")) {
        Member user = new Member();
        user.setEmail("user@vinci.be");
        user.setPassword(passwordEncoder.encode("user"));
        user.setTag("User");
        user.setAdmin(false);
        user.setImage(defaultImage);
        user.setSpeciality(defaultSpeciality);

        memberRepository.save(user);
      }
    };
  }
}
