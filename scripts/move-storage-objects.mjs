/*
  One-time script to align storage object paths with the new policy:
  Objects must live under `<user_id>/<basename>` and `tasks.image_url` should reference that path.

  What it does:
  - Scans the `tasks` table for rows with a non-null `image_url`.
  - For each task, computes the desired path: `${user_id}/${basename}`.
  - If the current `image_url` differs, attempts to copy the object to the new path, then deletes the old object.

  Requirements:
  - env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY)
  - Run: node scripts/move-storage-objects.mjs
*/

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'task-attachments'

function requireEnv(...names) {
  for (const name of names) {
    const value = process.env[name]
    if (value) return value
  }
  const display = names.join(' or ')
  throw new Error(`Missing env: ${display}`)
}

async function main() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY')

  const supabase = createClient(url, serviceKey)

  let from = 0
  const size = 1000
  let totalMoved = 0
  let totalChecked = 0

  for (;;) {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('task_id, user_id, image_url')
      .not('image_url', 'is', null)
      .range(from, from + size - 1)

    if (error) throw error
    if (!tasks || tasks.length === 0) break

    for (const t of tasks) {
      totalChecked++
      const currentPath = t.image_url
      const base = currentPath.includes('/') ? currentPath.split('/').pop() : currentPath
      const desiredPath = `${t.user_id}/${base}`

      if (currentPath === desiredPath) continue

      const { error: copyError } = await supabase.storage
        .from(BUCKET)
        .copy(currentPath, desiredPath)
      if (copyError) {
        console.error(`Copy failed for ${currentPath} -> ${desiredPath}:`, copyError.message)
        continue
      }
      const { error: delError } = await supabase.storage
        .from(BUCKET)
        .remove([currentPath])
      if (delError) {
        console.error(`Delete failed for ${currentPath}:`, delError.message)
      }
      totalMoved++
      console.log(`Moved: ${currentPath} -> ${desiredPath}`)
    }

    if (tasks.length < size) break
    from += size
  }

  console.log(`Checked: ${totalChecked}, Moved: ${totalMoved}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
