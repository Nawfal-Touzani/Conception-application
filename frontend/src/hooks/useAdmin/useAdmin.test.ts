import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useAdmin } from './useAdmin';
import * as useAuthModule from '../../contexts/useAuth';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockNavigate = vi.fn();
  return { ...actual, useNavigate: vi.fn(() => mockNavigate) };
});

vi.mock('../../contexts/useAuth');

const adminMember = {
  id: 1,
  email: 'admin@vinci.be',
  tag: 'AdminTag',
  speciality: 'Architecte',
  teamName: null,
  profileImage: '/images/avatar1.png',
  isAvailable: true,
  isAdmin: true,
  admin: true,
  isBan: false,
};

const regularMember = {
  id: 2,
  email: 'member@vinci.be',
  tag: 'MemberTag',
  speciality: 'Gardien',
  teamName: null,
  profileImage: null,
  isAvailable: false,
  isAdmin: false,
  admin: false,
  isBan: false,
};

const otherAdmin = {
  id: 99,
  email: 'other@vinci.be',
  tag: 'OtherAdmin',
  speciality: 'Gardien',
  teamName: null,
  profileImage: null,
  isAvailable: true,
  isAdmin: true,
  admin: true,
  isBan: false,
};

const mockFetch = (responses: object[]) => {
  let call = 0;
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const res = responses[call] ?? { ok: true, json: async () => [] };
    call++;
    return Promise.resolve(res);
  });
};

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn();
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    user: {
      id: 1,
      email: 'admin@vinci.be',
      tag: 'AdminTag',
      role: 'ADMIN',
      token: 'fake-token',
    },
    logout: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    bannedError: null,
  });
});

describe('useAdmin', () => {
  test('charge les admins et membres au montage', async () => {
    mockFetch([
      { ok: true, json: async () => [adminMember, otherAdmin] },
      { ok: true, json: async () => [adminMember, regularMember] },
    ]);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.admins.length).toBeGreaterThan(0);
    });
  });

  test('filtre les admins bannis et soi-même', async () => {
    const bannedAdmin = {
      ...otherAdmin,
      id: 3,
      tag: 'BannedAdmin',
      isBan: true,
    };
    mockFetch([
      { ok: true, json: async () => [adminMember, otherAdmin, bannedAdmin] },
      { ok: true, json: async () => [] },
    ]);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(
        result.current.admins.find((a) => a.tag === 'BannedAdmin'),
      ).toBeUndefined();
      expect(
        result.current.admins.find((a) => a.tag === 'AdminTag'),
      ).toBeUndefined();
      expect(
        result.current.admins.find((a) => a.tag === 'OtherAdmin'),
      ).toBeTruthy();
    });
  });

  test('filtre les membres déjà admins', async () => {
    mockFetch([
      { ok: true, json: async () => [] },
      { ok: true, json: async () => [adminMember, regularMember] },
    ]);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(
        result.current.allMembers.find((m) => m.tag === 'AdminTag'),
      ).toBeUndefined();
      expect(
        result.current.allMembers.find((m) => m.tag === 'MemberTag'),
      ).toBeTruthy();
    });
  });

  test('handlePromote appelle promoteToAdmin et recharge', async () => {
    mockFetch([
      { ok: true, json: async () => [] },
      { ok: true, json: async () => [regularMember] },
      { ok: true },
      { ok: true, json: async () => [regularMember] },
      { ok: true, json: async () => [] },
    ]);

    const { result } = renderHook(() => useAdmin());
    await waitFor(() =>
      expect(result.current.allMembers.length).toBeGreaterThan(0),
    );

    await act(async () => {
      await result.current.handlePromote(regularMember);
    });

    expect(result.current.success).toBe(
      'MemberTag est maintenant administrateur.',
    );
  });

  test('handlePromote affiche erreur si échec', async () => {
    mockFetch([
      { ok: true, json: async () => [] },
      { ok: true, json: async () => [regularMember] },
      { ok: false },
    ]);

    const { result } = renderHook(() => useAdmin());
    await waitFor(() =>
      expect(result.current.allMembers.length).toBeGreaterThan(0),
    );

    await act(async () => {
      await result.current.handlePromote(regularMember);
    });

    expect(result.current.error).toBe(
      'Impossible de nommer cet administrateur.',
    );
  });

  test('handleDemote ne fait rien si demoteTarget est null', async () => {
    mockFetch([
      { ok: true, json: async () => [] },
      { ok: true, json: async () => [] },
    ]);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => expect(result.current.error).toBeNull());

    await act(async () => {
      await result.current.handleDemote();
    });

    expect(result.current.error).toBeNull();
  });

  test('handleDemote révoque un admin avec succès', async () => {
    mockFetch([
      { ok: true, json: async () => [otherAdmin] },
      { ok: true, json: async () => [regularMember] },
      { ok: true },
      { ok: true, json: async () => [] },
      { ok: true, json: async () => [regularMember] },
    ]);

    const { result } = renderHook(() => useAdmin());
    await waitFor(() =>
      expect(result.current.admins.length).toBeGreaterThan(0),
    );

    act(() => result.current.setDemoteTarget(otherAdmin));

    await act(async () => {
      await result.current.handleDemote();
    });

    expect(result.current.success).toBe(
      "OtherAdmin n'est plus administrateur.",
    );
  });

  test('handleDemote affiche erreur si révocation échoue', async () => {
    mockFetch([
      { ok: true, json: async () => [otherAdmin] },
      { ok: true, json: async () => [regularMember] },
      { ok: false },
    ]);

    const { result } = renderHook(() => useAdmin());
    await waitFor(() =>
      expect(result.current.admins.length).toBeGreaterThan(0),
    );

    act(() => result.current.setDemoteTarget(otherAdmin));

    await act(async () => {
      await result.current.handleDemote();
    });

    expect(result.current.error).toBe(
      'Impossible de révoquer cet administrateur.',
    );
  });

  test('pagination calcule totalPages correctement', async () => {
    const manyAdmins = Array.from({ length: 6 }, (_, i) => ({
      ...otherAdmin,
      id: i + 10,
      email: `admin${i}@vinci.be`,
      tag: `Admin${i}`,
    }));

    mockFetch([
      { ok: true, json: async () => manyAdmins },
      { ok: true, json: async () => [] },
    ]);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => expect(result.current.totalPages).toBe(2));
    expect(result.current.paginated.length).toBe(4);
  });
});
