import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { User } from '../types';
import {
  login as apiLogin,
  logout as apiLogout,
  refresh
} from '../services/auth';

// Тип состояния авторизации
interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Контекст авторизации
const AuthContext = createContext<AuthState | undefined>(undefined);

// Провайдер авторизации
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Инициализация авторизации при загрузке
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await refresh();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  // Логин пользователя
  const handleLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  // Выход пользователя
  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login: handleLogin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста авторизации
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

