import axios from 'axios';

// Базовый клиент Axios для вызова backend API
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

