package be.vinci.ipl.cae.api;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
public class DemoApplication {

  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }

  @Bean
  CommandLineRunner seed(MemberRepository memberRepository, ImageRepository imageRepository,
      SpecialityRepository specialityRepository) {
    return args -> {
      // D'abord une image et une spécialité car Member en a besoin
      Image image = imageRepository.save(new Image("https://example.com/image.png"));
      Speciality speciality = specialityRepository.save(new Speciality("Support"));

      // Ensuite un membre
      Member member = new Member("test@test.com", "password", "tag1", false, image, speciality);
      memberRepository.save(member);
    };
  }
}
