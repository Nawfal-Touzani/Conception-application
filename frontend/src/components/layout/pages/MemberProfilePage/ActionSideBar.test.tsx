import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { ActionSidebar } from './ActionsSideBar';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

describe('ActionSidebar', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockProfile = { teamName: null } as any;

  test('shows the create team button if member does not have a team', () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <ActionSidebar profile={mockProfile} />
      </MemoryRouter>,
    );

    const teamButton = screen.getByText(/Rejoindre une team/i);
    expect(teamButton).toBeTruthy();

    fireEvent.click(teamButton);
    expect(navigateMock).toHaveBeenCalledWith('/team');
  });
});
