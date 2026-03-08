<<<<<<<< HEAD:api/src/main/java/be/vinci/ipl/cae/api/models/entities/User.java
package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User entity.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String username;

  @Column(nullable = false)
  private String password;

}
========
package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Drink entity.
 */
@Entity
@Table(name = "drinks")
@Data
@NoArgsConstructor
public class Drink {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String image;

  @Column(nullable = false)
  private double volume;

  @Column(nullable = false)
  private double price;

}
>>>>>>>> origin/develop:api/src/main/java/be/vinci/ipl/cae/api/models/entities/Drink.java
