package be.vinci.ipl.cae.api.configuration;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.services.AuthService;
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

@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final AuthService authService;

  public JwtAuthenticationFilter(AuthService authService) {
    this.authService = authService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

    String token = request.getHeader("Authorization");

    // Additional security: remove the "Bearer" prefix if the frontend sends it.
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    if (token != null) {
      String email = authService.verifyJwtToken(token); // On vérifie l'email
      if (email != null) {
        Member member = authService.readOneFromEmail(email);
        if (member != null) {
          List<GrantedAuthority> authorities = new ArrayList<>();

          // The correct role is assigned based on the `isAdmin` attribute of your entity.
          if (member.isAdmin()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
          } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
          }

          UsernamePasswordAuthenticationToken authentication =
                  new UsernamePasswordAuthenticationToken(member, null, authorities);

          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
    }
    filterChain.doFilter(request, response);
  }
}