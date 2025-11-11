import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 400 });
    }

    console.log('Refreshing access token...');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokens = await response.json();
    
    if (!response.ok) {
      console.error('Token refresh failed:', tokens);
      return NextResponse.json({ 
        error: 'Token refresh failed',
        details: tokens.error_description || tokens.error 
      }, { status: 400 });
    }

    console.log('Token refreshed successfully');
    
    return NextResponse.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      token_type: tokens.token_type,
      // Note: refresh_token is not returned on refresh, keep using the existing one
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Token refresh failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}