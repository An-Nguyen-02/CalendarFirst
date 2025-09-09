// api/auth.ts
import type { User } from "../types/types";
// Use import.meta.env for Vite, or define REACT_APP_API_URL in your .env and use process.env only in Node
const apiUrl = import.meta.env.VITE_API_URL;

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${apiUrl}/api/auth/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function loginUser(data: { username: string; password: string }) {
  const res = await fetch(`${apiUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function signupUser(data: { username: string; email: string; password: string }) {
  const res = await fetch(`${apiUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${apiUrl}/api/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
}
