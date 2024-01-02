import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { book, lessonId } = getQuery(event)
  const filePath = path.resolve('assets', 'nce', `book${book}`, `${lessonId}.json`)
  const json = await fs.readFile(filePath, 'utf8')
  return JSON.parse(json)
})
