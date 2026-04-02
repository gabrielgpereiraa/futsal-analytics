'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface VideoPlayerState {
  isPlaying:       boolean
  currentTime:     number
  duration:        number
  isReady:         boolean
}

export interface VideoPlayerControls {
  videoRef:        React.RefObject<HTMLVideoElement | null>
  play:            () => void
  pause:           () => void
  togglePlay:      () => void
  seekTo:          (seconds: number) => void
  seekRelative:    (delta: number) => void
  stepFrame:       (direction: 1 | -1) => void
}

interface UseVideoPlayerOptions {
  fps?: number
}

export function useVideoPlayer(
  { fps = 30 }: UseVideoPlayerOptions = {}
): VideoPlayerState & VideoPlayerControls {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isPlaying,   setIsPlaying]   = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)
  const [isReady,     setIsReady]     = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay      = () => setIsPlaying(true)
    const onPause     = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDuration  = () => setDuration(video.duration)
    const onReady     = () => {
      setIsReady(true)
      setDuration(video.duration)
    }

    video.addEventListener('play',             onPlay)
    video.addEventListener('pause',            onPause)
    video.addEventListener('timeupdate',       onTimeUpdate)
    video.addEventListener('durationchange',   onDuration)
    video.addEventListener('loadedmetadata',   onReady)

    return () => {
      video.removeEventListener('play',           onPlay)
      video.removeEventListener('pause',          onPause)
      video.removeEventListener('timeupdate',     onTimeUpdate)
      video.removeEventListener('durationchange', onDuration)
      video.removeEventListener('loadedmetadata', onReady)
    }
  }, [])

  const play = useCallback(() => {
    videoRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const seekTo = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(seconds, video.duration || Infinity))
  }, [])

  const seekRelative = useCallback((delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(
      0,
      Math.min(video.currentTime + delta, video.duration || Infinity)
    )
  }, [])

  /**
   * Avança ou retrocede um frame.
   * Funciona apenas com o vídeo pausado — limitação do HTML5 Video.
   */
  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      const video = videoRef.current
      if (!video) return
      if (!video.paused) video.pause()
      const frameDuration = 1 / fps
      video.currentTime = Math.max(
        0,
        Math.min(video.currentTime + direction * frameDuration, video.duration || Infinity)
      )
    },
    [fps]
  )

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isReady,
    play,
    pause,
    togglePlay,
    seekTo,
    seekRelative,
    stepFrame,
  }
}
