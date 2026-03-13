export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  reputation: number;
  launchCount: number;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  chain: string;
  isPrimary: boolean;
  verifiedAt: string | null;
}
