'use client'

import { useEffect, useRef } from 'react'
import type { VideoPlayerState, VideoPlayerControls } from '@/hooks/use-video-player'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatSeconds } from '@/lib/utils/format'
import {
  Play, Pause, SkipBack, SkipForward,
  ChevronLeft, ChevronRight
} from 'lucide-react'

interface VideoPlayerProps extends VideoPlayerState, VideoPlayerControls {
  videoUrl: string
}

export function VideoPlayer({
  videoRef,
  videoUrl,
  isPlaying,
  currentTime,
  duration,
  isReady,
  togglePlay,
  seekTo,
  seekRelative,
  stepFrame,
}: VideoPlayerProps) {
  const prevUrl = useRef<string>('')

  // Atualiza src apenas quando a URL muda (evita reload desnecessário)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl || videoUrl === prevUrl.current) return
    prevUrl.current = videoUrl
    video.src = videoUrl
    video.load()
  }, [videoUrl, videoRef])

  function handleSliderChange([value]: number[]) {
    seekTo(value)
  }

  return (
    <div className="flex flex-col rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--video-bg)' }}>
      {/* Área do vídeo */}
      <div className="relative aspect-video flex items-center justify-center" style={{ backgroundColor: 'var(--video-bg)' }}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          preload="auto"
          onClick={togglePlay}
          style={{ cursor: 'pointer' }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Carregando vídeo…</p>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="px-4 py-3 space-y-2" style={{ backgroundColor: 'var(--video-controls)' }}>
        {/* Barra de progresso */}
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 1}
          step={0.1}
          onValueChange={handleSliderChange}
          className="cursor-pointer"
          disabled={!isReady}
        />

        <div className="flex items-center justify-between">
          {/* Botões de controle */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => stepFrame(-1)}
              disabled={!isReady}
              title="Frame anterior (,)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => seekRelative(-2)}
              disabled={!isReady}
              title="Voltar 2s (J)"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 text-foreground"
              onClick={togglePlay}
              disabled={!isReady}
              title="Play/Pause (Space)"
            >
              {isPlaying
                ? <Pause className="h-5 w-5" />
                : <Play  className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => seekRelative(2)}
              disabled={!isReady}
              title="Avançar 2s (L)"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => stepFrame(1)}
              disabled={!isReady}
              title="Próximo frame (.)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Tempo */}
          <div className="font-mono text-sm text-muted-foreground tabular-nums select-none">
            {formatSeconds(currentTime)}
            <span className="mx-1">/</span>
            {formatSeconds(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}
