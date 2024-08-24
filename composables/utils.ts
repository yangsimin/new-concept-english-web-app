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

export function downloadJson(data: string | object) {
  if (typeof data === 'object') {
    data = JSON.stringify(data)
  }
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 在Firefox中可能有效，在Chrome中可能无法正常工作，需要保留这一行，因为不立即释放URL可能会导致内存泄露
  URL.revokeObjectURL(url)
}
