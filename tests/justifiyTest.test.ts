import { justifyText } from '../src/controllers/controllers';
import { getUsageForEmail } from '../src/redis/usageStore';
import { usageGuard } from '../src/middlewares/usage';
import express from 'express';
import request from 'supertest';

jest.mock('../src/redis/usageStore.ts');

const mockedGetUsage = getUsageForEmail as jest.Mock;

const app = express();
app.use(express.text());

app.post(
  '/api/justify',
  (req, res, next) => {
    (req as any).user = { email: 'test@example.com' };
    next();
  },
  usageGuard,
  justifyText
);

describe('POST /api/justify', () => {
  beforeEach(() => {
    mockedGetUsage.mockReset();
  });

  it('should justify text if user under daily limit', async () => {
    mockedGetUsage.mockResolvedValue({ date: '2025-10-14', words: 0 });

    const res = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send('Hello world this is a test');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello world');
  });

  it('should reject if daily limit exceeded', async () => {
    mockedGetUsage.mockResolvedValue({ date: '2025-10-14', words: 90000 });

    const res = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send('Hello world this is a test');

    expect(res.status).toBe(402);
    expect(res.body.error).toMatch(/payment required/i);
  });

  it('should justify multiple paragraphs correctly', async () => {
    mockedGetUsage.mockResolvedValue({ date: '2025-10-14', words: 0 });

    const input = `This is paragraph one. It has a few words.\n\nThis is paragraph two, a bit longer than the first one.\nIt even has two lines.`;
    const res = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send(input);

    expect(res.status).toBe(200);
    expect(res.text.split('\n').length).toBe(2); 
    expect(res.text).toContain('paragraph one');
    expect(res.text).toContain('paragraph two');
  });

  it('should handle a single long word', async () => {
    mockedGetUsage.mockResolvedValue({ date: '2025-10-14', words: 0 });

    const input = Array(80).fill('a').join('');
    const res = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send(input);

    expect(res.status).toBe(200);
    expect(res.text.trim()).toBe(input);
  });

  it('should handle large text inputs', async () => {
    mockedGetUsage.mockResolvedValue({ date: '2025-10-14', words: 0 });

    const input = Array(1000).fill('word').join(' ');
    const res = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send(input);

    expect(res.status).toBe(200);
    expect(res.text.split('\n').length).toBeGreaterThan(1);
  });

  it('should handle text with mixed whitespace', async () => {
    mockedGetUsage.mockResolvedValue({ date: '2025-10-14', words: 0 });

    const input = 'Hello   world\tthis is   spaced   out';
    const res = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send(input);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello world this is spaced out');
  });
});
