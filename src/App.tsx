import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Revendedores } from '@/pages/Revendedores';
import { Vendas } from '@/pages/Vendas';
import { Envios } from '@/pages/Envios';
import { Pagamentos } from '@/pages/Pagamentos';
import { VendaCliente } from '@/pages/VendaCliente';
import { Estoque } from '@/pages/Estoque';
import { Configuracoes } from '@/pages/Configuracoes';
import { IAAna } from '@/pages/IAAna';
import { Relatorios } from '@/pages/Relatorios';
import { useAuthStore } from '@/stores/auth';
import { useIdleTimer } from '@/hooks/useIdleTimer';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  // Error boundary for debugging
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('🚨 ERRO JAVASCRIPT:', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        stack: error.error?.stack
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 PROMISE REJECTION:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Monitor user activity and auto-logout after 10 minutes of inactivity
  useIdleTimer();

  useEffect(() => {
    // Only clear storage on initial load, not during session
    // Auth store already cleared storage on initialization
    console.log('🚀 App initialized, auth state check:', {
      isAuthenticated,
      user: user?.email,
      hasToken: !!sessionStorage.getItem('auth-token')
    });

    // Short loading time to allow React to stabilize
    const timer = setTimeout(() => {
      console.log('⏱️ Loading complete, final auth state:', {
        isAuthenticated,
        user: user?.email,
        hasToken: !!sessionStorage.getItem('auth-token'),
        currentPath: window.location.pathname
      });
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Show loading screen while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 App render:', { isAuthenticated, user: user?.email, isLoading });

  return (
    <Router>
      <Routes>
        {/* Login route - always accessible */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with nested structure for AppLayout Outlet */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="revendedores" element={<Revendedores />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="envios" element={
            <ProtectedRoute requireRole="admin">
              <Envios />
            </ProtectedRoute>
          } />
          <Route path="pagamentos" element={
            <ProtectedRoute requireRole="admin">
              <Pagamentos />
            </ProtectedRoute>
          } />
          <Route path="estoque" element={<Estoque />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="ia" element={<IAAna />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>

        {/* Public route for client sales */}
        <Route path="/venda" element={<VendaCliente />} />

        {/* Catch all routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
