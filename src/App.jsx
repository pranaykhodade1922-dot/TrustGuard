import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthGuard } from './components/layout/AuthGuard';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { ScanDetailsPage } from './pages/ScanDetailsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Application Checkpoint & Workspace Routes: /app/* */}
          <Route element={<AuthGuard />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="analyze" element={<AnalyzePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="scan/:id" element={<ScanDetailsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Automatic canonical redirects for legacy root paths */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/analyze" element={<Navigate to="/app/analyze" replace />} />
          <Route path="/history" element={<Navigate to="/app/history" replace />} />
          <Route path="/scan/:id" element={<Navigate to="/app/scan/:id" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
