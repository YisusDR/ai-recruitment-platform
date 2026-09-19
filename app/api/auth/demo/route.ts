import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Set demo user cookie
  response.cookies.set('ats_demo_user', JSON.stringify({
    id: '55555555-0000-0000-0000-000000000001',
    email: 'admin@ats.local',
    name: 'Admin Dev',
    role: 'admin',
  }), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirectTo') || '/'
  const response = NextResponse.redirect(new URL(redirectTo, request.url))

  response.cookies.set('ats_demo_user', JSON.stringify({
    id: '55555555-0000-0000-0000-000000000001',
    email: 'admin@ats.local',
    name: 'Admin Dev',
    role: 'admin',
  }), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
