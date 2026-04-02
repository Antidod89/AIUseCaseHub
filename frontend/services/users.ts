import { api } from './api';
import { RoleEnum, User } from '../types';

// Получение списка пользователей (ADMIN)
export async function fetchUsers() {
  const { data } = await api.get<User[]>('/users');
  return data;
}

// Создание пользователя (ADMIN)
export async function createUser(payload: {
  email: string;
  password: string;
  role: RoleEnum;
}) {
  const { data } = await api.post<User>('/users', payload);
  return data;
}

// Обновление роли пользователя
export async function updateUserRole(userId: number, role: RoleEnum) {
  const { data } = await api.patch<User>(`/users/${userId}/role`, { role });
  return data;
}

// Удаление пользователя
export async function deleteUser(userId: number) {
  await api.delete(`/users/${userId}`);
}

