import { Role } from '../../interfaces/user/user.interface';

interface RoleLimit {
  limit: number;
}

type RoleLimits = {
  [key in Role]: RoleLimit;
};

const roles: RoleLimits = {
  rootAdmin: { limit: 1 },
  adminA: { limit: 5 },
  adminB: { limit: 5 },
  adminC: { limit: 5 },
  subAdmin: { limit: 5 },
  user: { limit: 1 },
  guest: { limit: 1 },
  marketer: { limit: 1 },
} as const;

export const limitedForAdmin = (role: Role): number => {
  return roles[role].limit || 0;
};
