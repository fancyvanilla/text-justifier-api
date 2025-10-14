import { Request, Response } from 'express';
import { signToken as sign } from '../middlewares/auth';
import { LINE_LENGTH } from '../constants';

export function generateToken(req: Request, res: Response) {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ error: 'Email is required' });
	}
	const token = sign(email);
	return res.json({ token });
}

export function justifyText(req: Request, res: Response) {
	const text = req.body as string;
	if (!text) {
		return res.status(400).json({ error: 'Text is required' });
	}
	const paragraphs = text.split(/\n\s*\n/);
	let justifiedText = paragraphs.map((p) => justifyParagraph(p, LINE_LENGTH)).join('\n');
	res.type('text/plain');
	return res.send(justifiedText);
}

function justifyParagraph(paragraph: string, lineLength: number): string {
	let words = paragraph.split(/\s+/);
	let lines: string[] = [];
	let current_index = 0;
	while (current_index < words.length) {
		let current_line: string[] = [];
		let currentLineLength = 0;
		while (current_index < words.length) {
			let word = words[current_index];
			let extraSpace = currentLineLength === 0 ? 0 : 1;
			if (currentLineLength + word.length + extraSpace > lineLength) break;
			current_line.push(word);
			currentLineLength += word.length + extraSpace;
			current_index++;
		}
		let lastLine = current_index >= words.length;
		if (currentLineLength > 0) {
			lines.push(lastLine ? current_line.join(' ') : justifyLine(current_line.join(' '), lineLength));
		}
	}
	return lines.join('\n');
}

function justifyLine(line: string, lineLength: number): string {
	const words = line.trim().split(/\s+/);
	if (words.length === 1) {
		return words[0] + ' '.repeat(lineLength - words[0].length);
	}
	const totalChars = words.reduce((sum, word) => sum + word.length, 0);
	const totalSpaces = lineLength - totalChars;
	const spaceSlots = words.length - 1;
	const evenSpace = Math.floor(totalSpaces / spaceSlots);
	let extraSpaces = totalSpaces % spaceSlots;
	let justifiedLine = '';
	for (let i = 0; i < words.length; i++) {
		justifiedLine += words[i];
		if (i < words.length - 1) {
			justifiedLine += ' '.repeat(evenSpace + (extraSpaces > 0 ? 1 : 0));
			if (extraSpaces > 0) extraSpaces--;
		}
	}
	return justifiedLine;
}

