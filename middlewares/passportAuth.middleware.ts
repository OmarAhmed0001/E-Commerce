import { googlePassport } from '../utils/googleAuth';

export const authenticateWithGoogle = googlePassport.authenticate('google', {
  scope: ['profile', 'email'],
});
