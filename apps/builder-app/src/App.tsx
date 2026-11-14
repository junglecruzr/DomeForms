import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BuilderLayout } from './components/BuilderLayout';
import { FormBuilder } from './pages/FormBuilder';
import { FormList } from './pages/FormList';
import { ThemeBuilder } from './pages/ThemeBuilder';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><BuilderLayout /></ProtectedRoute>}>
            <Route path="/" element={<FormList />} />
            <Route path="builder/:formId" element={<FormBuilder />} />
            <Route path="themes" element={<ThemeBuilder />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </AuthProvider>
    </QueryClientProvider>
  );
}