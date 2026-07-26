import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userCode, deviceCode } = body;

    if (action === 'request_code') {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      return NextResponse.json({
        userCode: `TWN-${code}`,
        deviceCode: `DEV-${Date.now()}`,
        verificationUri: 'https://atlas-app.dev/device',
        expiresIn: 300
      });
    }

    if (action === 'poll_token') {
      return NextResponse.json({
        status: 'AUTHORIZED',
        user: {
          id: 'usr-dev-1',
          email: 'taiwansz@atlas.dev',
          name: 'Taiwansz',
          organizationId: 'org-taiwansz-enterprise',
          plan: 'PRO'
        },
        accessToken: `JWT-TWN-SESSION-${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
