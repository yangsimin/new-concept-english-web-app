import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { num } = getQuery(event)
  const filePath = path.resolve('assets', 'nce', `book${num}.json`)
  const json = await fs.readFile(filePath, 'utf8')
  return json
})
