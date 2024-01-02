import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const { book } = getQuery(event)
  await sendRedirect(event, `/nce/book${book}.json`)
})
