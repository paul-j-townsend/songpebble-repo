import { NextRequest, NextResponse } from 'next/server'
import { generatePrompt } from '@/lib/promptGenerator'
import type { ToCharacter, Sender } from '@/lib/songSchema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const toCharacters: ToCharacter[] = body.toCharacters || []
    const senders: Sender[] = body.senders || []

    const lyrics = await generatePrompt(body.occasion || 'christmas', {
      toCharacters,
      senders,
      tone: body.tone,
      songStyle: body.songStyle,
      songMood: body.songMood,
      tempo: body.tempo,
      instruments: body.instruments,
      vocalGender: body.vocalGender,
      songTitle: body.songTitle,
    })

    return NextResponse.json({ success: true, lyrics })
  } catch (error) {
    console.error('❌ Claude generation failed in /api/generate-lyrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
