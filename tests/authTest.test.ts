import request from 'supertest';
import express from 'express';
import { generateToken } from '../src/controllers/controllers';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

const app = express();
app.use(express.json());
app.post('/api/token', generateToken);

describe('POST /api/token', () => {

  it('should return a JWT token when email is provided', async () => {
    const res = await request(app)
      .post('/api/token')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const payload = jwt.verify(
      res.body.token,
      process.env.JWT_SECRET || 'default_secret'
    ) as any;

    expect(payload.email).toBe('test@example.com');
  });

  it('should return 400 error when email is missing', async () => {
    const res = await request(app)
      .post('/api/token')
      .send({}); 

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toMatch(/email/i);
  });

});
