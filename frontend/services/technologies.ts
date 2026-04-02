import { api } from './api';
import { Technology } from '../types';

// Получение списка технологий
export async function fetchTechnologies() {
  const { data } = await api.get<Technology[]>('/technologies');
  return data;
}

// Создание технологии
export async function createTechnology(payload: {
  name: string;
  description: string;
  link?: string;
}) {
  const { data } = await api.post<Technology>('/technologies', payload);
  return data;
}

// Обновление технологии
export async function updateTechnology(
  id: number,
  payload: Partial<Pick<Technology, 'name' | 'description' | 'link'>>
) {
  const { data } = await api.patch<Technology>(`/technologies/${id}`, payload);
  return data;
}

// Удаление технологии
export async function deleteTechnology(id: number) {
  await api.delete(`/technologies/${id}`);
}

