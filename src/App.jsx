import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';

// Components
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';

// Pages
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import RecoverPassword from './pages/RecoverPassword';

function App() {
  const { theme } = useTheme();

  return (
    <HeroUIProvider>
      <div className={theme}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }>
                <Route index element={<Navigate to="/profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                
                {/* Admin routes */}
                <Route path="admin/*" element={
                  <RequireAuth adminOnly>
                    <Routes>
                      <Route path="users" element={<AdminDashboard />} />
                    </Routes>
                  </RequireAuth>
                } />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
            </HeroUIProvider>
  );
}

export default App;
