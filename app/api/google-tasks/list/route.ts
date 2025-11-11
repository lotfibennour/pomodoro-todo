import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get('google_tokens')?.value;

  if (!tokenCookie) return new NextResponse('Not authenticated', { status: 401 });

  const tokens = JSON.parse(tokenCookie);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  );
  oauth2Client.setCredentials(tokens);

  const service = google.tasks({ version: 'v1', auth: oauth2Client });

  try {
    const res = await service.tasks.list({ tasklist: '@default' });
    return NextResponse.json(res.data.items || []);
  } catch (err) {
    console.error(err);
    return new NextResponse('Error fetching tasks', { status: 500 });
  }
}
