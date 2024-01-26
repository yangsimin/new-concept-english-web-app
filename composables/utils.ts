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

export function getLocalStorageJson<T>(key: string, defaultValue: any = undefined): T {
  if (!localStorage[key]) {
    return defaultValue as T
  }
  return JSON.parse(localStorage[key]) as T
}

export function setLocalStorageJson(key: string, value: any) {
  if (value === undefined || value === null) {
    localStorage[key] = ''
    return
  }
  localStorage[key] = JSON.stringify(value)
}
