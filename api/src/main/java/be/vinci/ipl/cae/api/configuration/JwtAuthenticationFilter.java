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

    // Valid token, the request can continue
    // The authentication object contains the user's identity and roles, and is stored in the SecurityContext to be accessible throughout the application

    // Role
    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER")); // EVERYONE has this basic role
    if (member.isAdmin()) {
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