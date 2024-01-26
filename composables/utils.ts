export function throttle(fn: Function, delay: number) {
    let timer: NodeJS.Timeout | undefined
  
    return function (...args: any[]) {
      if (timer) {
        return
      }
      fn.apply(this, args)
      timer = setTimeout(() => {
        timer = undefined
      }, delay)
    }
  }
  