import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username');

  if (!room || !username) {
    return NextResponse.json({ error: 'Oda adı ve kullanıcı adı gereklidir' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Sunucu ayarları eksik' }, { status: 500 });
  }

  // Kullanıcı için bir bilet (token) oluşturuyoruz
  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  
  // Bu kullanıcının odaya katılmasına, ses/video göndermesine ve almasına izin veriyoruz
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: await at.toJwt() });
}