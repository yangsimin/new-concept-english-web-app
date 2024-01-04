export function useEventListener(
  el: HTMLElement,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  el.addEventListener(type, handler, options)
  onUnmounted(() => {
    el.removeEventListener(type, handler, options)
  })
}
