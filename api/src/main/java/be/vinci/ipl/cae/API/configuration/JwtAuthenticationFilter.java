package be.vinci.ipl.cae.API.configuration;

<<<<<<< HEAD
=======
import be.vinci.ipl.cae.API.models.entities.User;
>>>>>>> develop
import be.vinci.ipl.cae.API.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JwtAuthenticationFilter to handle user authentication.
 */
@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final UserService userService;

  /**
   * Constructor for JwtAuthenticationFilter.
   *
   * @param userService the injected UserService.
   */
  public JwtAuthenticationFilter(UserService userService) {
    this.userService = userService;
  }

  /**
   * Filter to handle user authentication.
   *
   * @param request     the request.
   * @param response    the response.
   * @param filterChain the filter chain.
   * @throws ServletException the servlet exception.
   * @throws IOException      the IO exception.
   */
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String token = request.getHeader("Authorization");
    if (token != null) {
      String username = userService.verifyJwtToken(token);
      if (username != null) {
        User user = userService.readOneFromUsername(username);
        if (user != null) {
          List<GrantedAuthority> authorities = new ArrayList<>();
          if ("admin".equals(username)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
          }
          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(
                  user, null, authorities);
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
    }
    filterChain.doFilter(request, response);
  }
}
