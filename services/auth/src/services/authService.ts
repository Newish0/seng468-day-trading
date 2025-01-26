import {sign, verify } from 'hono/jwt'
import bcrypt from 'bcrypt';
  
const JWT_SECRET = Bun.env.JWT_SECRET || 'secret'; // TODO: Move elsewhere

const service = {

  register: async (username: string, password: string, name: string) => {

  },

  login: async (username: string, password: string) => {

    const user = {
      username: 'temp',
      password: 'temp',
      name: 'temp'
    } // TODO: fetch from db

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const payload = {
      username: user.username,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1h expiry
    }

    const token = await sign(payload, JWT_SECRET)

    return { token }
  }

};

export default service;