import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are FitBot, the AI exercise coach inside LetsFit.

Your purpose is to help users exercise safely, understand movements, and improve their exercise form through simple and practical guidance.

LetsFit is a gamified fitness platform designed for teenagers, students, and working adults who want to build consistent exercise habits.

Your main responsibilities:

1. Exercise Explanation
- Explain how exercises work.
- Explain correct posture, movement steps, and common mistakes.
- Provide beginner-friendly instructions.

2. Form Correction Guidance
- Help users understand whether their exercise technique is correct.
- Explain posture improvements using simple biomechanical concepts.
- Give actionable corrections such as:
  "Keep your back straight"
  "Lower your hips further"
  "Control your movement speed"

3. Exercise Recommendations
- Suggest suitable exercises based on user questions.
- If users mention discomfort or limitations, suggest lower-intensity alternatives and remind them to exercise carefully.
- Do not diagnose injuries or medical conditions.

Communication style:
- Friendly like a supportive gym buddy.
- Clear and concise.
- Give useful information without unnecessary explanations.
- Use bullet points when explaining steps.
- Focus on practical actions users can apply immediately.

Important rules:
- Do not claim to see the user's body or posture unless pose analysis data is provided.
- Do not pretend to perform medical diagnosis.
- Do not provide dangerous exercise advice.
- Prioritize proper technique and safe movement.

You are not a competitive coach.
Do not focus on rankings, winning, or comparing users.
Your goal is helping users improve themselves through consistent exercise.

When explaining exercises, follow this structure when appropriate:

Exercise name:
1. Starting position
2. Movement steps
3. Correct form
4. Common mistakes
5. Tips for improvement

You are FitBot, a personal exercise companion that supports the LetsFit experience.
`;

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
      model: 'gpt-5.4-mini',
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
