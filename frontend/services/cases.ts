import { api } from './api';
import { Case } from '../types';

export interface CasesPage {
  total: number;
  items: Case[];
}

// Получение списка кейсов с пагинацией и фильтром по роли
export async function fetchCases(params: {
  page?: number;
  pageSize?: number;
  roleId?: number;
  /** Поиск по названию, текстам кейса, автору и названиям технологий */
  q?: string;
}) {
  const { page = 1, pageSize = 10, roleId, q } = params;
  const { data } = await api.get<CasesPage>('/cases', {
    params: {
      page,
      pageSize,
      roleId,
      q: q?.trim() ? q.trim() : undefined
    }
  });
  return data;
}

// Получение одного кейса
export async function fetchCase(id: number) {
  const { data } = await api.get<Case>(`/cases/${id}`);
  return data;
}

// Создание кейса
export async function createCase(payload: {
  title: string;
  summary?: string | null;
  description: string;
  effect: string;
  author?: string;
  technologiesHtml?: string;
  roleId: number;
  technologyIds?: number[];
}) {
  const { data } = await api.post<Case>('/cases', payload);
  return data;
}

// Обновление кейса
export async function updateCase(
  id: number,
  payload: Partial<{
    title: string;
    summary: string | null;
    description: string;
    effect: string;
    author: string;
    technologiesHtml: string;
    roleId: number;
    technologyIds: number[];
  }>
) {
  const { data } = await api.patch<Case>(`/cases/${id}`, payload);
  return data;
}

// Удаление кейса
export async function deleteCase(id: number) {
  await api.delete(`/cases/${id}`);
}

