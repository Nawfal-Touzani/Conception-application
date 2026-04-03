import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/useAuth';
import { getNotifications } from '../../../services/notifications.service';
import NavBar from './NavBar';
import { Notification } from '../../../types/notifications.types';

const NavBarContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch unread notifications count when user is logged in
  // Why not fetch it in the notifications page ? Because we want to update the count in real time when the user receives a new notification, without having to refresh the page
  // Why not separate the fetch logic in a different file
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const unread: Notification[] = await getNotifications(
        user.id,
        user.token,
        false,
      );
      setUnreadCount(unread.length);
    };

    fetchUnreadCount();
  }, [user, location]);

  const isTournamentsPage = location.pathname === '/tournaments';
  const isTeamPage = location.pathname === '/team';
  const isAdminPage = location.pathname === '/admin';
  const isProfilePage = location.pathname === '/members/me';
  const isCreateTournamentPage = location.pathname === '/tournament/create';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <NavBar
      user={user}
      unreadCount={unreadCount}
      isTournamentsPage={isTournamentsPage}
      isTeamPage={isTeamPage}
      isAdminPage={isAdminPage}
      isProfilePage={isProfilePage}
      isCreateTournamentPage={isCreateTournamentPage}
      onNavigate={navigate}
      onLogout={handleLogout}
    />
  );
};

export default NavBarContainer;
