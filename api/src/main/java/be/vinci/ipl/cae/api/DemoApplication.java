package be.vinci.ipl.cae.api;

import me.paulschwarz.springdotenv.DotenvPropertySource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
@EnableScheduling
public class DemoApplication {

  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
      DotenvPropertySource.addToEnvironment(context.getEnvironment());
    }
    SpringApplication.run(DemoApplication.class, args);
  }
}
