import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

export type UsageRecord = { date: string; words: number };

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  } catch (e) {
    console.error('Failed to init Upstash client:', e);
    redis = null;
  }
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getUsageForEmail(email: string): Promise<UsageRecord> {
  const today = todayDate();
  if (!redis) {
    return { date: today, words: 0 };
  }
  const key = `usage:${email}`;
  const raw = await redis.get<string>(key);
  if (!raw) {
    const rec: UsageRecord = { date: today, words: 0 };
    await redis.set(key, JSON.stringify(rec));
    return rec;
  }
  let parsed: UsageRecord;
  if (typeof raw === 'string') {
    parsed = JSON.parse(raw) as UsageRecord;
  } else {
    parsed = raw as UsageRecord;
  }
  if (parsed.date !== today) {
    const rec: UsageRecord = { date: today, words: 0 };
    await redis.set(key, JSON.stringify(rec));
    return rec;
  }
  return parsed;
}

export async function addWordsForEmail(email: string, words: number): Promise<void> {
  const today = todayDate();
  if (!redis) {
    return;
  }
  const current = await getUsageForEmail(email);
  if (current.date !== today) {
    current.date = today;
    current.words = 0;
  }
  const key = `usage:${email}`;
  current.words += words;
  await redis.set(key, JSON.stringify(current));
}
