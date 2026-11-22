import type { Profile } from './domain';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Profile['role'];
        profile: Profile;
      };
      validatedQuery?: unknown;
    }
  }
}

export {};
