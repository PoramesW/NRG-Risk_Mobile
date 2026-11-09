import { User } from '@/types';

const MOCK_USER: User = {
  id: 'USR-1001',
  name: 'Thanawat P.',
  email: 'thanawat@powercast.energy',
  role: 'Admin',
  department: 'Power Systems & Forecast Operations',
};

export async function loginUser(email: string, _password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const normalized = email.trim().toLowerCase();
  const inferredRole = normalized.includes('viewer')
    ? 'Viewer'
    : normalized.includes('analyst')
      ? 'Analyst'
      : 'Admin';

  return {
    ...MOCK_USER,
    email: email.trim(),
    role: inferredRole,
  };
}

export async function logoutUser(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
}

export async function registerUser(
  name: string,
  email: string,
  _password: string
): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!name || name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }

  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  return {
    ...MOCK_USER,
    name: name.trim(),
    email: email.trim(),
    role: 'Admin',
  };
}

export async function fetchCurrentUser(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return MOCK_USER;
}
