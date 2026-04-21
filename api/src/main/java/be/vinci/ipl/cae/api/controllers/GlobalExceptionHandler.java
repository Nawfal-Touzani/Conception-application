package be.vinci.ipl.cae.api.controllers;

import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Gestionnaire global des exceptions pour tous les contrôleurs.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Handle not found (404) string.
   *
   * @param e the e
   * @return the string
   */
  @ExceptionHandler(NoSuchElementException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public String handleNotFound(NoSuchElementException e) {
    return e.getMessage();
  }

  /**
   * Handle bad request (400) string.
   *
   * @param e the e
   * @return the string
   */
  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String handleBadRequest(IllegalArgumentException e) {
    return e.getMessage();
  }

  /**
   * Handle conflict (409) request string.
   *
   * @param e the e
   * @return the string
   */
  @ExceptionHandler(IllegalStateException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public String handleConflict(IllegalStateException e) {
    return e.getMessage();
  }

  /**
   * Handle forbidden (403) request string.
   *
   * @param e the e
   * @return the string
   */
  @ExceptionHandler(SecurityException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public String handleForbidden(SecurityException e) {
    return e.getMessage();
  }
}
