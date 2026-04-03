type UserRole = 'ADMIN' | 'MEMBER' | string;

export interface NavBarUser {
  id: number;
  email: string;
  tag: string;
  role: UserRole;
  token: string;
}

export interface NavBarProps {
  user: NavBarUser | null;
  unreadCount: number;
  isTournamentsPage: boolean;
  isTeamPage: boolean;
  isAdminPage: boolean;
  isProfilePage: boolean;
  isCreateTournamentPage: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}
