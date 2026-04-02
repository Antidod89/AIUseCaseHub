// Общие типы, синхронизированные с backend

export type RoleEnum = 'ADMIN' | 'EDITOR' | 'USER';

export interface User {
  id: number;
  email: string;
  role: RoleEnum;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
}

export interface Technology {
  id: number;
  name: string;
  description: string;
  link?: string | null;
}

export interface CaseTechnologyRef {
  technology: Technology;
}

export interface Case {
  id: number;
  title: string;
  description: string;
  effect: string;
  author?: string | null;
  technologiesHtml?: string | null;
  role: Role;
  technologies: CaseTechnologyRef[];
  createdAt: string;
  updatedAt: string;
}

