import service from '../services/authService';
import type { Context } from 'hono';

const controller = {

  register: async (c: Context) => {
    // REVIEW: How to distinguish from company/user registration
    const { username, password, name } = await c.req.json();

    if (!username || !password || !name) {
        return c.json({ success: false, data: {"error": 'Username, password, and name are required' }}, 400);
      }

    try {
      await service.register(username, password, name);
      return c.json({ success: true, data: null });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      } else {
        return c.json({ success: false, data: { error: "An unknown error has occurred" } }, 400);
      }
    }
  },

  login: async (c: Context) => {
    const { username, password } = await c.req.json();

    if (!username || !password) {
        return c.json({ success: false, data: {error: 'Username and password are required' }}, 400);
    }

    try {
      // REVIEW: How to distinguish from company/user login
      const token = await service.login(username, password);
      return c.json({ success: true, data: { token: token } });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, data: { error: error.message } }, 400);
      } else {
        return c.json({ success: false, data: { error: "An unknown error has occurred" } }, 400);
      }
    }
  }
};

export default controller;

