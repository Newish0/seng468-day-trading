import service from '../services/authService';
import type { Context } from 'hono';

const controller = {
  // REVIEW: how to distinguish b/w user/company for register/login

  register: async (c: Context) => {
    const { user_name, password, name } = await c.req.json();

    if (!user_name || !password || !name) {
      return c.json({ success: false, data: { error: 'Username, password, and name are required' } }, 400);
    }

    try {
      await service.register(user_name, password, name);
      return c.json({ success: true, data: null });
    } catch (error) {
      return c.json(handleError(error), 400);
    }
  },

  login: async (c: Context) => {
    const { user_name, password } = await c.req.json();

    if (!user_name || !password) {
      return c.json({ success: false, data: { error: 'Username and password are required' } }, 400);
    }

    try {
      const token = await service.login(user_name, password);
      return c.json({ success: true, data: { token } });
    } catch (error) {
      return c.json(handleError(error), 400);
    }
  }
};

const handleError = (error: unknown) => {
    if (error instanceof Error) {
      return { success: false, data: { error: error.message } };
    }
    return { success: false, data: { error: 'An unknown error has occurred' } };
  };

export default controller;
