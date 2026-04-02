// Интерфейс полезной нагрузки JWT токена
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

