import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = __dirname;

export function readDb<T>(filename: string): T {
  const filePath = path.join(DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [] as unknown as T;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return [] as unknown as T;
  }
}

export function writeDb<T>(filename: string, data: T): void {
  const filePath = path.join(DB_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
