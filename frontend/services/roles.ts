import { api } from './api';
import { Role } from '../types';

// Получение списка ролей
export async function fetchRoles() {
  const { data } = await api.get<Role[]>('/roles');
  return data;
}

// Создание роли (ADMIN)
export async function createRole(payload: {
  name: string;
  description: string;
}) {
  const { data } = await api.post<Role>('/roles', payload);
  return data;
}

// Обновление роли (ADMIN)
export async function updateRole(
  id: number,
  payload: { name?: string; description?: string }
) {
  const { data } = await api.patch<Role>(`/roles/${id}`, payload);
  return data;
}

// Удаление роли (ADMIN)
export async function deleteRole(id: number) {
  await api.delete(`/roles/${id}`);
}

