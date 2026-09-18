import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  verifyAuth,
  CvIngestedSchema,
  ApplicationScoredSchema,
  StageAdvancedSchema,
  InterviewScheduledSchema,
  handleCvIngested,
  handleApplicationScored,
  handleStageAdvanced,
  handleInterviewScheduled,
} from './_lib/webhook-utils'

// 1. Unified discriminated union schema to parse incoming payloads based on event type
const UnifiedWebhookSchema = z.discriminatedUnion('event', [
  z.object({ event: z.literal('cv.ingested'), payload: CvIngestedSchema }),
  z.object({ event: z.literal('application.scored'), payload: ApplicationScoredSchema }),
  z.object({ event: z.literal('stage.advanced'), payload: StageAdvancedSchema }),
  z.object({ event: z.literal('interview.scheduled'), payload: InterviewScheduledSchema }),
])

export async function POST(req: NextRequest) {
  // A. Verify security header / credentials
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await req.json()
    const parsed = UnifiedWebhookSchema.safeParse(rawBody)

    // B. Validate payload schema
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { event, payload } = parsed.data
    let result

    // C. Dispatch events to specific helpers
    switch (event) {
      case 'cv.ingested':
        result = await handleCvIngested(payload)
        break
      case 'application.scored':
        result = await handleApplicationScored(payload)
        break
      case 'stage.advanced':
        result = await handleStageAdvanced(payload)
        break
      case 'interview.scheduled':
        result = await handleInterviewScheduled(payload)
        break
      default:
        // TypeScript exhaustive check guard
        const _exhaustiveCheck: never = event
        return NextResponse.json({ error: 'Unhandled event type' }, { status: 400 })
    }

    // D. Return structured response
    return NextResponse.json({ ok: true, event, data: result }, { status: 200 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[Webhook Error]:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// Ensure methods other than POST return 405 Method Not Allowed
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export async function PATCH() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export async function HEAD() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
export async function OPTIONS() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
