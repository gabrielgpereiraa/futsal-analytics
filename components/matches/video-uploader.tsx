'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveVideoMetadata } from '@/app/(app)/matches/actions'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { formatFileSize } from '@/lib/utils/format'
import { Upload, X, CheckCircle2 } from 'lucide-react'

interface ExistingVideo {
  id: string
  filename: string
  file_size_bytes: number | null
  fps: number | null
}

interface VideoUploaderProps {
  matchId: string
  existingVideo: ExistingVideo | null
}

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number; filename: string }
  | { status: 'saving' }
  | { status: 'done' }
  | { status: 'error'; message: string }

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB

export function VideoUploader({ matchId, existingVideo }: VideoUploaderProps) {
  const inputRef       = useRef<HTMLInputElement>(null)
  const { toast }      = useToast()
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setState({ status: 'error', message: 'Formato inválido. Use MP4, WebM, MOV ou AVI.' })
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setState({ status: 'error', message: 'Arquivo muito grande. Máximo: 5 GB.' })
      return
    }

    void uploadFile(file)
  }

  async function uploadFile(file: File) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setState({ status: 'error', message: 'Sessão expirada. Faça login novamente.' })
      return
    }

    const ext         = file.name.split('.').pop() ?? 'mp4'
    const storagePath = `${user.id}/${matchId}/${Date.now()}.${ext}`

    setState({ status: 'uploading', progress: 0, filename: file.name })

    const { error: uploadError } = await supabase.storage
      .from('match-videos')
      .upload(storagePath, file, {
        upsert: true,
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded / (progressEvent.total ?? file.size)) * 100
          )
          setState({ status: 'uploading', progress: pct, filename: file.name })
        },
      })

    if (uploadError) {
      setState({ status: 'error', message: uploadError.message })
      return
    }

    setState({ status: 'saving' })

    // Tenta ler duração do vídeo via elemento <video>
    const duration = await getVideoDuration(file)

    const result = await saveVideoMetadata({
      matchId,
      storagePath,
      filename:       file.name,
      fileSizeBytes:  file.size,
      durationSeconds: duration ?? undefined,
      fps:            30,
    })

    if (result.error) {
      setState({ status: 'error', message: result.error })
      return
    }

    setState({ status: 'done' })
    toast({ title: 'Vídeo enviado com sucesso' })
  }

  return (
    <div className="space-y-3">
      {/* Estado de upload / progresso */}
      {state.status === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground truncate max-w-xs">
              {state.filename}
            </span>
            <span className="font-mono text-muted-foreground">{state.progress}%</span>
          </div>
          <Progress value={state.progress} className="h-2" />
        </div>
      )}

      {state.status === 'saving' && (
        <p className="text-sm text-muted-foreground">Salvando metadados…</p>
      )}

      {state.status === 'done' && (
        <div className="flex items-center gap-2 text-sm text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          Vídeo enviado. Recarregue a página para ver o status atualizado.
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex items-center justify-between text-sm text-destructive">
          <span>{state.message}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setState({ status: 'idle' })}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Botão de upload */}
      {state.status !== 'uploading' && state.status !== 'saving' && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {existingVideo ? 'Substituir vídeo' : 'Enviar vídeo'}
          </Button>
          <p className="text-xs text-muted-foreground">
            MP4, WebM, MOV ou AVI · máx. 5 GB
          </p>
        </>
      )}
    </div>
  )
}

/** Extrai duração do arquivo de vídeo via elemento <video> no browser */
function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    const url = URL.createObjectURL(file)
    video.src = url

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      const dur = video.duration
      resolve(isFinite(dur) ? dur : null)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
  })
}
