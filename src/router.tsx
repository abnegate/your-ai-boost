import { createBrowserRouter } from 'react-router';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { CallbackPage } from '~/pages/CallbackPage';
import { DashboardPage } from '~/pages/DashboardPage';
import { LandingPage } from '~/pages/LandingPage';
import { NotFoundPage } from '~/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '/callback',
    element: (
      <ErrorBoundary>
        <CallbackPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
