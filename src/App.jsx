import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider }         from './components/Toast';
import Layout                    from './components/Layout';
import AuthPage                  from './pages/AuthPage';
import DashboardPage             from './pages/DashboardPage';
import UploadPage                from './pages/UploadPage';
import ProfitabilityPage         from './pages/ProfitabilityPage';
import IntelligencePage          from './pages/IntelligencePage';
import AddItemPage               from './pages/AddItemPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
      fontSize: 13,
    }}>
      Loading…
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13,
    }}>
      Loading…
    </div>
  );

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout><UploadPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profitability"
        element={
          <ProtectedRoute>
            <Layout><ProfitabilityPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-item"
        element={
          <ProtectedRoute>
            <Layout><AddItemPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/intelligence"
        element={
          <ProtectedRoute>
            <Layout><IntelligencePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
