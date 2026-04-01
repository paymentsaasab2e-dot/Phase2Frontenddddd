const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');

try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('[frontend] Cleared stale .next cache');
  }
} catch (error) {
  console.warn('[frontend] Could not clear .next cache:', error instanceof Error ? error.message : error);
}
