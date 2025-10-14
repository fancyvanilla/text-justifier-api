import { Request, Response, NextFunction } from 'express';
import { addWordsForEmail, getUsageForEmail } from '../redis/usageStore';
import { WORD_LIMIT } from '../constants';

interface UserRequest extends Request {
  user?: { email: string };
}
export async function usageGuard(req: UserRequest, res: Response, next: NextFunction) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ error: 'User email missing from token' });
    }
    let wordsToAdd = 0;
    if (req.is?.('text/plain')) {
      const text = typeof req.body === 'string' ? req.body : '';
      wordsToAdd = text.split(/\s+/).length;
    } else {
      return res.status(415).send('Unsupported Media Type. Use text/plain.');
    }
    if (wordsToAdd > WORD_LIMIT) {
        return res.status(402).json({ error: 'Payment Required' });
    }
    const current = await getUsageForEmail(email);

    if (current.words + wordsToAdd > WORD_LIMIT) {
      return res.status(402).json({ error: 'Payment Required' });
    }
    await addWordsForEmail(email, wordsToAdd);
    return next();
  } catch (err) {
    console.error('Usage guard error:', err);
    return res.status(500).json({ error: 'Server Error. Please try again later.' });
  }
}

