import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are FitBot, an expert AI fitness coach for the LetsFit app.
You help users with exercise form, workout plans, nutrition advice, and fitness motivation.
Keep responses concise, encouraging, and actionable. Avoid medical diagnoses.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.MAXPLUS_API_KEY;
  const baseURL = 'https://api.maxplus-ai.cc/v1';
  console.log('[FitBot] MAXPLUS_API_KEY exists:', !!apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'FitBot is not configured.' }, { status: 503 });
  }

  let message: string;
  try {
    const body = await req.json();
    message = typeof body?.message === 'string' ? body.message.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey, baseURL });
    const completion = await client.chat.completions.create({
      model: 'gpt-5.5-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ reply });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[FitBot] API error:', errMsg);
    if (process.env.NODE_ENV === 'development') {
      console.error('[FitBot] Full error:', err);
    }
    return NextResponse.json({ error: 'FitBot is unavailable. Please try again.' }, { status: 502 });
  }
}
