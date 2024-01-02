import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { book } = getQuery(event)
  const filePath = path.join('public', 'nce', `book${book}.json`)
  const json = await fs.readFile(filePath, 'utf8')
  return JSON.parse(json)
})
