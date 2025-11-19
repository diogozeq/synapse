-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "avatarUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaterialFonte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "tags" TEXT,
    "modules" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "tipoArquivo" TEXT NOT NULL,
    "urlArquivo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "thumbnailUrl" TEXT
);
INSERT INTO "new_MaterialFonte" ("categoria", "descricao", "id", "status", "tags", "tipoArquivo", "titulo", "urlArquivo") SELECT "categoria", "descricao", "id", "status", "tags", "tipoArquivo", "titulo", "urlArquivo" FROM "MaterialFonte";
DROP TABLE "MaterialFonte";
ALTER TABLE "new_MaterialFonte" RENAME TO "MaterialFonte";
CREATE TABLE "new_matriculas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idUsuario" TEXT NOT NULL,
    "idCurso" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NAO_INICIADO',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "notaFinal" REAL,
    "prazo" DATETIME NOT NULL,
    "atribuidoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoAcesso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ehObrigatorio" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "matriculas_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "matriculas_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "MaterialFonte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_matriculas" ("atribuidoEm", "ehObrigatorio", "id", "idCurso", "idUsuario", "notaFinal", "prazo", "progresso", "status", "ultimoAcesso") SELECT "atribuidoEm", "ehObrigatorio", "id", "idCurso", "idUsuario", "notaFinal", "prazo", "progresso", "status", "ultimoAcesso" FROM "matriculas";
DROP TABLE "matriculas";
ALTER TABLE "new_matriculas" RENAME TO "matriculas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

