import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(`/?error=auth_failed&message=${error}`);
  }

  if (!code) {
    return NextResponse.redirect('/?error=auth_failed&message=no_code');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Redirect back to app with tokens in URL (for frontend to handle)
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }
    redirectUrl.searchParams.set('expires_in', tokens.expires_in.toString());

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect('/?error=auth_failed&message=token_exchange_failed');
  }
}