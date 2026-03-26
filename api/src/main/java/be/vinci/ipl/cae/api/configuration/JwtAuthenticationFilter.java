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

/**
 * JWT authentication filter that intercepts incoming HTTP requests
 * to validate the JWT token provided in the Authorization header.
 * If the token is valid, the authenticated user is injected into
 * the Spring Security context to be accessible throughout the application.
 */
@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final AuthService authService;

  /**
   * Constructs a JwtAuthenticationFilter with the given AuthService.
   *
   * @param authService the service used to verify JWT tokens and retrieve users
   */
  public JwtAuthenticationFilter(AuthService authService) {
    this.authService = authService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

    String token = request.getHeader("Authorization");

    // No token, let it through. It will be auto blocked later if needed.
    if (token == null) {
      filterChain.doFilter(request, response);
      return;
    }

    // Additional security: remove the "Bearer" prefix if the frontend sends it.
    if (token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    // Token verification
    String email = authService.verifyJwtToken(token);
    if (email == null) { // invalid token or expired
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT");
      return; // 401 & stop filtering
    }

    // User catch
    Member member = authService.readOneFromEmail(email);
    if (member == null) {
      // user doesn't exist anymore
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
      return;
    }

    // If the member is banned, we block the request immediately
    if (member.isBan()) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN, "Votre compte a été banni.");
      return;
    }

    // Valid token, the request can continue.
    // The authentication object contains the user's identity and roles,
    // and is stored in the SecurityContext to be accessible throughout the application.

    // Role
    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER")); // EVERYONE has this basic role
    if (member.getIsAdmin()) {
      authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN")); // The admins ALSO have this role
    }

    // Identity injection into the SecurityContext
    UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(member, null, authorities);
    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authentication);

    // We let the request continue to the controller
    filterChain.doFilter(request, response);
  }
}