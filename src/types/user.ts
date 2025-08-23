// types/user.ts
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}
