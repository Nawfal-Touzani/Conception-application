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
   * Handle not found string.
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
   * Handle bad request string.
   *
   * @param e the e
   * @return the string
   */
  @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String handleBadRequest(RuntimeException e) {
    return e.getMessage();
  }
}