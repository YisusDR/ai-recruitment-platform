import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, InterviewScheduledSchema, handleInterviewScheduled } from '../_lib/webhook-utils'

export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await req.json()
    const parsed = InterviewScheduledSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const result = await handleInterviewScheduled(parsed.data)
    return NextResponse.json({ ok: true, data: result }, { status: 200 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[Interview Scheduled Webhook Error]:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET() { return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }) }
export async function PUT() { return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }) }
export async function PATCH() { return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }) }
