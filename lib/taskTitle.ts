/**
 * Generate a task title derived from freeform task details.
 * Falls back to a readable default when the details are empty.
 */
export function deriveTaskTitle(details: string): string {
  const trimmed = details.trim();
  if (!trimmed) {
    return "Untitled task";
  }
  if (trimmed.length <= 80) {
    return trimmed;
  }
  const truncated = trimmed.slice(0, 77).trimEnd();
  return `${truncated}...`;
}
