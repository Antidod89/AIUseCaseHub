import { api } from './api';
import { User } from '../types';

// Ответ от backend при аутентификации
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Регистрация пользователя
export async function register(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password
  });
  return data;
}

// Логин пользователя
export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    email,
    password
  });
  return data;
}

// Обновление токенов
export async function refresh() {
  const { data } = await api.post<AuthResponse>('/auth/refresh');
  return data;
}

// Выход из системы
export async function logout() {
  await api.post('/auth/logout');
}

