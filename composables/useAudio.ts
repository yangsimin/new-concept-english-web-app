export function useAudio() {
  const audio = new Audio()
  let time = 0

  watchEffect(() => {
    useEventListener(audio, 'play', () => {
      console.log('play')
      if (time) {
        setTimeout(() => {
          pause()
        }, time)
      }
    })
  })

  function updateSource(source: string) {
    audio.src = source
    audio.load()
  }

  function play(durationMs?: number) {
    audio.play()
    if (durationMs !== undefined) {
      time = durationMs
    }
  }

  function pause() {
    audio.pause()
  }

  return {
    audioInstance: audio,
    play,
    pause,
    updateSource,
  }
}
