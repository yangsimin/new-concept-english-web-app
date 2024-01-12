export async function copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    }
    else {
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.style.position = 'absolute'
      textarea.style.clip = 'rect(0 0 0 0)'
      textarea.value = text
      textarea.select()
      try {
        document.execCommand('copy', true)
      }
      catch (error) {
        console.error(error)
        throw error
      }
      finally {
        textarea.remove()
      }
    }
  }
  