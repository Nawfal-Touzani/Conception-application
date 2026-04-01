import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './components/layout/App/index.tsx';
import HomePage from './components/layout/pages/HomePage/HomePage.tsx';
import RegisterPage from './components/layout/pages/RegisterPage/RegisterPage.tsx';
import LoginPage from './components/layout/pages/LoginPage/LoginPage.tsx';
import NotificationsPage from './components/layout/pages/NotificationPage/NotificationsPage.tsx';

import { AuthProvider } from './contexts/AuthProvider.tsx';

import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';
import { ProfilePage } from './components/layout/pages/MemberProfilePage/ProfilePage.tsx';
import TeamPage from './components/layout/pages/TeamPages/TeamPage.tsx';
import AdminPage from './components/layout/pages/AdminPages/AdminPage.tsx';
import CreateTournamentPage from './components/layout/pages/AdminPages/CreateTournamentPage.tsx';
import TournamentsPage from './components/layout/pages/TournamentPages/TournamentPage.tsx';
import MembersListPage from './components/layout/pages/AdminPages/MemberListPage.tsx';
import PublicProfilePage from './components/layout/pages/PublicProfilePage/PublicProfilePage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'members/me',
        element: <ProfilePage />,
      },
      {
        path: 'team',
        element: <TeamPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'tournament/create',
        element: <CreateTournamentPage />,
      },
      {
        path: 'tournaments',
        element: <TournamentsPage />,
      },
      {
        path: 'admin/members',
        element: <MembersListPage />,
      },
      {
        path: 'members/:id',
        element: <PublicProfilePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Global CSS reset from Material-UI */}
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
