import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { useDataStore } from './data';

// Limpar dados antigos do localStorage apenas (manter sessionStorage)
if (typeof window !== 'undefined') {
  // Remove dados antigos do localStorage
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('auth-session');

  console.log('🔧 Auth store initialized - localStorage cleaned, sessionStorage preserved');
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock users para autenticação
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Julio Correa',
    email: 'juliocorrea@check2.com.br',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julio'
  },
  {
    id: '2',
    name: 'João Revendedor',
    email: 'joao@revendedor.com',
    role: 'revendedor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao'
  },
  {
    id: '3',
    name: 'Admin',
    email: 'admin',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        console.log('🔐 Login attempt for:', email);

        // Simulação de autenticação
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verificar usuários estáticos
        let user = mockUsers.find(u => u.email === email);
        let validCredentials =
          (email === 'juliocorrea@check2.com.br' && password === 'Ju113007') ||
          (email === 'joao@revendedor.com' && password === '123456') ||
          (email === 'admin' && password === 'admin');

        // Se não encontrou nos usuários estáticos, verificar revendedores cadastrados
        if (!user || !validCredentials) {
          const dataState = useDataStore.getState();
          const revendedor = dataState.revendedores.find(r => r.email === email);

          if (revendedor && revendedor.password === password) {
            console.log('📊 Revendedor found:', revendedor.name);
            user = {
              id: revendedor.id,
              name: revendedor.name,
              email: revendedor.email,
              role: 'revendedor' as const,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${revendedor.name}`
            };
            validCredentials = true;
          }
        }

        if (user && validCredentials) {
          console.log('✅ Login successful - saving token and state');

          // PRIMEIRO: Save token to sessionStorage
          if (typeof window !== 'undefined') {
            const token = `auth-${Date.now()}-${user.id}`;
            sessionStorage.setItem('auth-token', token);
            console.log('💾 Token saved to sessionStorage:', token);
          }

          // SEGUNDO: Set auth state
          set({ user, isAuthenticated: true });
          console.log('🔄 Auth state set:', { user: user.email, isAuthenticated: true });

          // TERCEIRO: Verify token was saved
          const savedToken = sessionStorage.getItem('auth-token');
          console.log('🔍 Token verification after save:', savedToken ? 'Token found' : 'Token NOT found');

          return true;
        }

        console.log('❌ Login failed - invalid credentials');
        return false;
      },

      logout: () => {
        console.log('🚪 Logout - clearing auth state');
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth-token');
          sessionStorage.removeItem('auth-session');
          console.log('🗑️ Auth data cleared from sessionStorage');
        }
        // Note: ProtectedRoute will automatically redirect to /login when isAuthenticated becomes false
      },
    }),
    {
      name: 'auth-session',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const item = sessionStorage.getItem(name);
          console.log('📖 Reading from sessionStorage:', name, item ? 'found' : 'not found');
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          sessionStorage.setItem(name, JSON.stringify(value));
          console.log('💾 Saved to sessionStorage:', name);
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          sessionStorage.removeItem(name);
          console.log('🗑️ Removed from sessionStorage:', name);
        },
      },
    }
  )
);
