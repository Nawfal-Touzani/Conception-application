import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './components/App/index.tsx';
import HomePage from './components/pages/HomePage/HomePage.tsx';
import RegisterPage from './components/pages/RegisterPage/RegisterPage.tsx';
import LoginPage from './components/pages/LoginPage/LoginPage.tsx';
import NotificationsPage from './components/pages/NotificationsPage.tsx';

import { AuthProvider } from './contexts/AuthProvider.tsx';

import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';
import { ProfilePage } from './components/pages/ProfilePage.tsx';
import TeamPage from './components/pages/TeamPages/TeamPage.tsx';
import AdminPage from './components/pages/AdminPages/AdminPage.tsx';
import CreateTournamentPage from './components/pages/AdminPages/CreateTournamentPage.tsx';

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
