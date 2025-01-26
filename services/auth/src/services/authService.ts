import {sign, verify } from 'hono/jwt'
import bcrypt from 'bcrypt';
  
const JWT_SECRET = Bun.env.JWT_SECRET || 'secret'; // TODO: Move elsewhere
const saltRounds = 10 

const service = {

  register: async (username: string, password: string, name: string) => {

    const existingUser = null; // TODO: check db if user with username exists 

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // TODO: Store user in DB here

  },

  login: async (username: string, password: string) => {
    let token;
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
    

    try {
      token = await sign(payload, JWT_SECRET);
    } catch (error) {
      throw new Error('Failed to generate token');
    }

    return { token }
  }

};

export default service;