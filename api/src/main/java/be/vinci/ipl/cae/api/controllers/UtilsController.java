package be.vinci.ipl.cae.api.controllers;

import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Utility class for controllers.
 */
public final class UtilsController {

  private UtilsController() {}

  /**
   * Handle exception.
   *
   * @param e the e
   * @return the response status exception
   */
  public static ResponseStatusException handleException(RuntimeException e) {
    if (e instanceof IllegalArgumentException || e instanceof NoSuchElementException) {
      return new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } else if (e instanceof IllegalStateException) {
      return new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
  }
}