// controller.ts
import authService from '../services/authService';
import type { Context } from 'hono';

const controller = {

  register: async (c: Context) => {
    // REVIEW: How to distinguish from company/user registratiom?
    const { username, password, name } = await c.req.json();
    try {
      // REVIEW: Do we need to return user info/JWT here?
      await authService.register(username, password, name);
      return c.json({ success: true, data: null });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { "error": error.message } }, 400);
      } else {
        return c.json({ success: false, data: { "error": "An unknown error has occurred" } }, 400);
      }
    }
  },

  login: async (c: Context) => {
    const { username, password } = await c.req.json();
    try {
      // REVIEW: How to distinguish from company/user login?
      const token = await authService.login(username, password);
      return c.json({ success: true, data: { "token": token } });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { "error": error.message } }, 400);
      } else {
        return c.json({ success: false, data: { "error": "An unknown error has occurred" } }, 400);
      }
    }
  }
};

export default controller;

