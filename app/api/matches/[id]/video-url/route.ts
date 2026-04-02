import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/matches/[id]/video-url
 * Gera uma signed URL válida por 12 horas para o vídeo da partida.
 * Verifica que o usuário é dono da partida antes de gerar.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Busca o vídeo garantindo que o usuário é dono
  const { data: video, error: videoError } = await supabase
    .from('match_videos')
    .select('storage_path')
    .eq('match_id', id)
    .eq('owner_id', user.id)
    .single()

  if (videoError || !video) {
    return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
  }

  // Signed URL com 12h de validade
  const { data: signedData, error: signedError } = await supabase.storage
    .from('match-videos')
    .createSignedUrl(video.storage_path, 60 * 60 * 12)

  if (signedError || !signedData) {
    return NextResponse.json(
      { error: 'Não foi possível gerar a URL do vídeo' },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: signedData.signedUrl })
}
