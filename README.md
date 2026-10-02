Conception-application — Gestion de tournois

Application web permettant de **créer, gérer et supprimer des tournois**, avec une gestion fine des rôles : **administrateurs**, **responsables d'équipe** et **joueurs**.

Projet réalisé dans le cadre de ma formation à l'Vinci, en équipe.

---

## Fonctionnalités

- Création et suppression de tournois
- Gestion des équipes (ajout, modification, suppression)
- Gestion des joueurs au sein des équipes
- Système de rôles avec permissions différenciées :
  - **Admin** : gestion complète de la plateforme
  - **Responsable d'équipe** : gestion de son équipe et de ses joueurs
  - **Joueur** : consultation des tournois et de son équipe
- Authentification et gestion des utilisateurs
- Tests end-to-end (e2e) pour garantir la fiabilité de l'application

---

## Stack technique

| Côté | Technologies |
|------|-------------|
| **Frontend** | TypeScript, React |
| **Backend** | Java (Spring Boot) |
| **Base de données** | PostgreSQL |
| **Déploiement** | Docker, Docker Compose, Nginx |
| **Tests** | Tests e2e |

---

## Structure du projet

```
├── api/                # Backend Java (Spring Boot)
├── frontend/           # Frontend React / TypeScript
├── e2e/                # Tests end-to-end
├── docker-compose.yaml # Orchestration des conteneurs
├── nginx.conf          # Configuration du reverse proxy
└── .idea/
```

---

## Lancer le projet

### Prérequis
- [Docker](https://www.docker.com/) et Docker Compose installés

### Installation

```bash
git clone https://github.com/Nawfal-Touzani/Conception-application.git
cd Conception-application
docker-compose up --build
```

---

## Équipe

Projet réalisé en équipe de 5 — voir les [contributeurs](../../graphs/contributors).

---

## 📄 Licence

Projet académique — usage éducatif.
