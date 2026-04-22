import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TeamPage from './TeamPage';
import { AuthContext } from '../../../../contexts/AuthContext';

vi.mock('../../../../services/tournament/tournament.service', () => ({
  getTournaments: vi.fn().mockResolvedValue([]),
}));

const mockUser = {
  id: 1,
  email: 'lynx@vinci.be',
  tag: 'Lynx',
  role: 'MEMBER',
  token: 'fake-token',
};

const mockMembers = [
  {
    memberId: 1,
    gameTag: 'Lynx',
    avatarUrl: '/images/avatar1.png',
    isAvailable: true,
  },
  {
    memberId: 2,
    gameTag: 'Rogue',
    avatarUrl: '/images/avatar2.png',
    isAvailable: false,
  },
];

const mockTeam = {
  id: 10,
  name: 'TEAM_ALPHA',
  responsibleTag: 'Lynx',
  secondResponsibleTag: null,
  creationDate: '2026-03-12T00:00:00',
};

const mockContextValue = {
  user: mockUser,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const renderTeamPage = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContextValue}>
        <TeamPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

// Mock les fetches initiaux : membres + équipe
const mockInitialFetches = () => {
  (global.fetch as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockMembers,
    })
    .mockResolvedValueOnce({ ok: true, json: async () => mockTeam });
};

// Mock un reload complet (après action)
const mockReload = () => {
  (global.fetch as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockMembers,
    })
    .mockResolvedValueOnce({ ok: true, json: async () => mockTeam });
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe('TeamPage — avec équipe', () => {
  test('affiche le titre de la page', async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('Mon équipe')).toBeTruthy();
  });

  test("affiche le nom de l'équipe", async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('TEAM_ALPHA')).toBeTruthy();
  });

  test("affiche les membres de l'équipe", async () => {
    mockInitialFetches();
    renderTeamPage();
    expect((await screen.findAllByText('Lynx')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Rogue')).toBeTruthy();
  });

  test('affiche le responsable dans la section infos', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('TEAM_ALPHA');
    const lynxElements = screen.getAllByText('Lynx');
    expect(lynxElements.length).toBeGreaterThanOrEqual(2);
  });

  test('affiche le bouton Quitter', async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('Quitter')).toBeTruthy();
  });

  test('affiche la date de création', async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('12/03/2026')).toBeTruthy();
  });

  test('affiche la légende disponible/indisponible', async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('Disponible')).toBeTruthy();
    expect(await screen.findByText('Indisponible')).toBeTruthy();
  });

  test('ouvre le dialog de confirmation quitter', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Quitter');
    fireEvent.click(screen.getByText('Quitter'));
    expect(await screen.findByText("Quitter l'équipe")).toBeTruthy();
    expect(
      await screen.findByText(/Es-tu sûr de vouloir quitter l'équipe/),
    ).toBeTruthy();
  });

  test('ferme le dialog quand on annule', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Quitter');
    fireEvent.click(screen.getByText('Quitter'));
    await screen.findByText("Quitter l'équipe");
    fireEvent.click(screen.getByText('Annuler'));
    await waitFor(() => {
      expect(screen.queryByText("Quitter l'équipe")).toBeFalsy();
    });
  });

  test("quitte l'équipe avec succès", async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Quitter');
    fireEvent.click(screen.getByText('Quitter'));
    await screen.findByText("Quitter l'équipe");

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

    fireEvent.click(screen.getByText('Confirmer'));
    await waitFor(() => {
      expect(screen.queryByText("Quitter l'équipe")).toBeFalsy();
    });
  });

  test('affiche erreur générique si leave échoue', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Quitter');
    fireEvent.click(screen.getByText('Quitter'));
    await screen.findByText("Quitter l'équipe");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    fireEvent.click(screen.getByText('Confirmer'));
    expect(await screen.findByText('Une erreur est survenue.')).toBeTruthy();
  });

  test('affiche erreur 409 quand le responsable quitte sans second', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Quitter');
    fireEvent.click(screen.getByText('Quitter'));
    await screen.findByText("Quitter l'équipe");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 409,
      text: async () => 'Désignez un second responsable avant de quitter.',
    });

    fireEvent.click(screen.getByText('Confirmer'));
    expect(
      await screen.findByText(
        'Désignez un second responsable avant de quitter.',
      ),
    ).toBeTruthy();
  });

  test('affiche erreur réseau lors du leave', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Quitter');
    fireEvent.click(screen.getByText('Quitter'));
    await screen.findByText("Quitter l'équipe");

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('network'),
    );

    fireEvent.click(screen.getByText('Confirmer'));
    expect(await screen.findByText('Erreur réseau.')).toBeTruthy();
  });

  test('affiche le bouton Nommer pour le responsable sur les autres membres', async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('Nommer')).toBeTruthy();
  });

  test('nomme un second responsable avec succès', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Nommer');

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
    });
    mockReload();

    fireEvent.click(screen.getByText('Nommer'));
    expect(
      await screen.findByText('Second responsable nommé avec succès.'),
    ).toBeTruthy();
  });

  test('affiche erreur si la nomination échoue', async () => {
    mockInitialFetches();
    renderTeamPage();
    expect(await screen.findByText('Nommer')).toBeTruthy();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    fireEvent.click(screen.getByText('Nommer'));
    expect(
      await screen.findByText('Impossible de nommer ce membre.'),
    ).toBeTruthy();
  });

  test('affiche les onglets Tournois', async () => {
    mockInitialFetches();
    renderTeamPage();
    await screen.findByText('Mon équipe');
    expect(await screen.findByText(/En cours/)).toBeTruthy();
    expect(await screen.findByText(/À venir/)).toBeTruthy();
  });
});

describe('TeamPage — sans équipe', () => {
  test("affiche JoinOrCreateTeam si pas d'équipe", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderTeamPage();
    expect(await screen.findByText('Rejoindre une team')).toBeTruthy();
    expect(await screen.findByText('Créer une team')).toBeTruthy();
  });
});

describe('TeamPage — dernier membre', () => {
  test("affiche message suppression d'équipe si solo", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockMembers[0]],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTeam });

    renderTeamPage();
    expect(await screen.findByText('Quitter')).toBeTruthy();
    fireEvent.click(screen.getByText('Quitter'));
    expect(
      await screen.findByText(/Quitter supprimera définitivement l'équipe/),
    ).toBeTruthy();
  });
});
