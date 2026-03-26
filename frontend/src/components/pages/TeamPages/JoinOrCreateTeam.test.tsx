import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import JoinOrCreateTeam from './JoinOrCreateTeam';
import { AuthContext } from '../../../contexts/AuthContext';

const mockUser = {
  id: 1,
  email: 'lynx@vinci.be',
  tag: 'Lynx',
  role: 'MEMBER',
  token: 'fake-token',
};

const mockTeams = [
  {
    id: 1,
    name: 'Team Alpha',
    responsibleTag: 'Lynx',
    secondResponsibleTag: null,
    creationDate: null,
  },
  {
    id: 2,
    name: 'Team Beta',
    responsibleTag: 'Rogue',
    secondResponsibleTag: null,
    creationDate: null,
  },
];

const mockContextValue = {
  user: mockUser,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const onTeamCreated = vi.fn();

const renderPage = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContextValue}>
        <JoinOrCreateTeam onTeamCreated={onTeamCreated} />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

// Helper : dernier textbox = champ "Créer une team"
const getCreateInput = () => {
  const inputs = screen.getAllByRole('textbox');
  return inputs[inputs.length - 1];
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe('JoinOrCreateTeam', () => {
  test('affiche les deux sections', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeams,
    });

    renderPage();
    expect(await screen.findByText('Rejoindre une team')).toBeTruthy();
    expect(screen.getByText('Créer une team')).toBeTruthy();
  });

  test('affiche la liste des équipes', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeams,
    });

    renderPage();
    expect(await screen.findByText('Team Alpha')).toBeTruthy();
    expect(await screen.findByText('Team Beta')).toBeTruthy();
  });

  test('filtre les équipes par recherche', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeams,
    });

    renderPage();
    await screen.findByText('Team Alpha');

    fireEvent.change(screen.getByPlaceholderText("Nom de l'équipe"), {
      target: { value: 'Alpha' },
    });

    expect(screen.getByText('Team Alpha')).toBeTruthy();
    expect(screen.queryByText('Team Beta')).toBeFalsy();
  });

  test('affiche message si aucune équipe trouvée', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeams,
    });

    renderPage();
    await screen.findByText('Team Alpha');

    fireEvent.change(screen.getByPlaceholderText("Nom de l'équipe"), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText('Aucune équipe trouvée')).toBeTruthy();
  });

  test('le bouton Envoyer demande est désactivé si aucune équipe sélectionnée', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeams,
    });

    renderPage();
    await screen.findByText('Team Alpha');

    expect(
      (screen.getByText('Envoyer demande') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test('sélectionne une équipe et envoie une demande avec succès', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTeams })
      .mockResolvedValueOnce({ ok: true, status: 201 });

    renderPage();
    await screen.findByText('Team Alpha');
    fireEvent.click(screen.getByText('Team Alpha'));

    expect(
      (screen.getByText('Envoyer demande') as HTMLButtonElement).disabled,
    ).toBe(false);
    fireEvent.click(screen.getByText('Envoyer demande'));

    expect(
      await screen.findByText('Demande envoyée avec succès !'),
    ).toBeTruthy();
  });

  test("affiche erreur si l'envoi de demande échoue", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTeams })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    renderPage();
    await screen.findByText('Team Alpha');
    fireEvent.click(screen.getByText('Team Alpha'));
    fireEvent.click(screen.getByText('Envoyer demande'));

    expect(await screen.findByText("Erreur lors de l'envoi.")).toBeTruthy();
  });

  test("affiche erreur réseau lors de l'envoi de demande", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTeams })
      .mockRejectedValueOnce(new Error('network'));

    renderPage();
    await screen.findByText('Team Alpha');
    fireEvent.click(screen.getByText('Team Alpha'));
    fireEvent.click(screen.getByText('Envoyer demande'));

    expect(
      await screen.findByText('Impossible de joindre le serveur.'),
    ).toBeTruthy();
  });

  test('le bouton Créer est désactivé si le nom est vide', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderPage();
    await screen.findByText('Créer une team');

    expect((screen.getByText('Créer') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  test('crée une équipe avec succès', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, status: 201 });

    renderPage();
    await screen.findByText('Créer une team');

    fireEvent.change(getCreateInput(), { target: { value: 'NewTeam' } });
    fireEvent.click(screen.getByText('Créer'));

    await waitFor(() => {
      expect(onTeamCreated).toHaveBeenCalled();
    });
  });

  test("affiche erreur si le nom d'équipe existe déjà (409)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, status: 409 });

    renderPage();
    await screen.findByText('Créer une team');
    fireEvent.change(getCreateInput(), { target: { value: 'ExistingTeam' } });
    fireEvent.click(screen.getByText('Créer'));

    expect(
      await screen.findByText("Ce nom d'équipe existe déjà."),
    ).toBeTruthy();
  });

  test('affiche erreur si nom invalide (400)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, status: 400 });

    renderPage();
    await screen.findByText('Créer une team');
    fireEvent.change(getCreateInput(), { target: { value: '!' } });
    fireEvent.click(screen.getByText('Créer'));

    expect(await screen.findByText("Nom d'équipe invalide.")).toBeTruthy();
  });

  test('affiche erreur générique si création échoue (autre status)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    renderPage();
    await screen.findByText('Créer une team');
    fireEvent.change(getCreateInput(), { target: { value: 'SomeTeam' } });
    fireEvent.click(screen.getByText('Créer'));

    expect(await screen.findByText('Erreur lors de la création.')).toBeTruthy();
  });

  test('affiche erreur réseau lors de la création', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockRejectedValueOnce(new Error('network'));

    renderPage();
    await screen.findByText('Créer une team');
    fireEvent.change(getCreateInput(), { target: { value: 'SomeTeam' } });
    fireEvent.click(screen.getByText('Créer'));

    expect(
      await screen.findByText('Impossible de joindre le serveur.'),
    ).toBeTruthy();
  });

  test('crée une équipe en appuyant sur Enter', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, status: 201 });

    renderPage();
    await screen.findByText('Créer une team');

    const input = getCreateInput();
    fireEvent.change(input, { target: { value: 'NewTeam' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onTeamCreated).toHaveBeenCalled();
    });
  });
});
