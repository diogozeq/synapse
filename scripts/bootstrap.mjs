import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dbDir = path.join(projectRoot, 'data', 'databases');
const realDbPath = path.join(dbDir, 'real.db');
const legacyDbPath = path.join(dbDir, 'dev.db');

function ensureRealDatabase() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(realDbPath)) {
    console.log('? Banco real.db encontrado. Nenhuma ação necessária.');
    return;
  }

  console.log('??  Criando real.db a partir do schema.prisma...');
  execSync('prisma db push --skip-generate', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (fs.existsSync(legacyDbPath)) {
    console.log('?? Migrando dados existentes de dev.db para real.db...');
    execSync('python scripts/migrate_real_db.py', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  } else {
    console.log('??  Nenhum dev.db encontrado para migrar. real.db criado vazio.');
  }
}

try {
  ensureRealDatabase();
} catch (error) {
  console.error('Erro ao preparar o banco real:', error);
  process.exit(1);
}
