import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_DB = ROOT / "data" / "databases" / "dev.db"
DEST_DB = ROOT / "data" / "databases" / "real.db"


def gen_uuid() -> str:
    return str(uuid.uuid4())


def map_tipo_atividade(raw: str) -> str:
    if not raw:
        return "RESUMO"
    lowered = raw.lower()
    if "flash" in lowered:
        return "FLASHCARD"
    if "quiz" in lowered:
        return "QUIZ"
    if "simulad" in lowered:
        return "SIMULADO"
    if "caso" in lowered or "case" in lowered:
        return "ESTUDO_DE_CASO"
    if "mapa" in lowered or "mind" in lowered:
        return "MAPA_MENTAL"
    if "cloze" in lowered:
        return "CLOZE"
    if "compar" in lowered:
        return "COMPARACAO"
    if "auto" in lowered or "self" in lowered:
        return "AUTO_EXPLICACAO"
    return "RESUMO"


def normalize_status(status: str) -> str:
    if not status:
        return "PENDENTE"
    status_upper = status.upper()
    if "CONCL" in status_upper:
        return "CONCLUIDO"
    if "ANDAMENTO" in status_upper or "PROCESS" in status_upper:
        return "PROCESSANDO"
    return "PENDENTE"


def ensure_real_db():
    if not DEST_DB.exists():
        raise SystemExit(f"Destino {DEST_DB} inexistente. Execute `prisma db push` antes.")


def migrate():
    ensure_real_db()
    src = sqlite3.connect(SRC_DB)
    src.row_factory = sqlite3.Row
    dest = sqlite3.connect(DEST_DB)
    dest.row_factory = sqlite3.Row

    dest.execute("PRAGMA foreign_keys = OFF;")
    try:
        reset_destination(dest)
        migrate_equipes(src, dest)
        cargo_map = migrate_cargos(src, dest)
        migrate_usuarios(src, dest, cargo_map)
        tag_map = migrate_material_fonte(src, dest)
        migrate_tags(src, dest, tag_map)
        migrate_atividades(src, dest)
        migrate_matriculas(src, dest)
        migrate_checkins(src, dest)
        migrate_logs(src, dest)
    finally:
        dest.execute("PRAGMA foreign_keys = ON;")
        src.close()
        dest.close()


def reset_destination(dest):
    tables = [
        "interacoes",
        "revisoes_sr",
        "sessoes_aprendizado",
        "checkins_bio",
        "logs_auditoria",
        "matriculas",
        "atividades_aprendizado",
        "materiais_tags",
        "tags",
        "materiais_competencias",
        "competencias",
        "materiais_fonte",
        "usuarios",
        "cargos",
        "equipes",
    ]
    for table in tables:
        dest.execute(f'DELETE FROM "{table}"')
    dest.commit()


def migrate_equipes(source, dest):
    rows = source.execute('SELECT id, nome, descricao FROM "Equipe"').fetchall()
    for row in rows:
        dest.execute(
            """
            INSERT INTO "equipes" (id, nome, descricao, idGestor, criadoEm, atualizadoEm)
            VALUES (?, ?, ?, NULL, ?, ?)
            """,
            (
                row["id"],
                row["nome"],
                row["descricao"],
                datetime.now(timezone.utc),
                datetime.now(timezone.utc),
            ),
        )
    dest.commit()


def migrate_cargos(source, dest):
    cargo_rows = source.execute('SELECT DISTINCT cargo FROM "usuarios" WHERE cargo IS NOT NULL AND cargo != ""').fetchall()
    cargo_map = {}
    for idx, row in enumerate(cargo_rows, start=1):
        cargo_id = gen_uuid()
        cargo_map[row["cargo"]] = cargo_id
        dest.execute('INSERT INTO "cargos" (id, nome) VALUES (?, ?)', (cargo_id, row["cargo"]))
    dest.commit()
    return cargo_map


def migrate_usuarios(source, dest, cargo_map):
    rows = source.execute(
        """
        SELECT id, nome, email, hashSenha, cargo, papel, createdAt,
               totalXp, nivel, diasSequencia, idEquipe, avatarUrl
        FROM "usuarios"
        """
    ).fetchall()
    for idx, row in enumerate(rows, start=1):
        cpf_value = f"{idx:011d}"
        dest.execute(
            """
            INSERT INTO "usuarios" (
                id, nome, email, hashSenha, cpf, avatarUrl, papel,
                idEquipe, idCargo, cargo, totalXp, nivel, diasSequencia,
                aceitouTermos, preferenciaAcessibilidade,
                criadoEm, atualizadoEm
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
            """,
            (
                row["id"],
                row["nome"],
                row["email"],
                row["hashSenha"],
                cpf_value,
                row["avatarUrl"],
                row["papel"] or "COLABORADOR",
                row["idEquipe"],
                cargo_map.get(row["cargo"]),
                row["cargo"],
                row["totalXp"],
                row["nivel"],
                row["diasSequencia"],
                row["createdAt"],
                row["createdAt"],
            ),
        )
    dest.commit()


def migrate_material_fonte(source, dest):
    course_rows = source.execute(
        """
        SELECT id, titulo, descricao, categoria, tags, modules,
               progress, totalXp, createdAt, isRecommended,
               tipoArquivo, urlArquivo, status, thumbnailUrl
        FROM "MaterialFonte"
        """
    ).fetchall()
    tag_map = {}
    for course in course_rows:
        tipo_curso = "RECOMENDADO" if course["isRecommended"] else "OBRIGATORIO"
        status_proc = normalize_status(course["status"])
        dest.execute(
            """
            INSERT INTO "materiais_fonte" (
                id, titulo, descricao, categoria, tipoCurso,
                thumbnailUrl, urlArquivo, tipoArquivo, textoExtraido,
                statusProcessamento, idUsuarioUpload, criadoEm, atualizadoEm
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?)
            """,
            (
                course["id"],
                course["titulo"],
                course["descricao"],
                course["categoria"],
                tipo_curso,
                course["thumbnailUrl"],
                course["urlArquivo"],
                course["tipoArquivo"],
                status_proc,
                course["createdAt"],
                course["createdAt"],
            ),
        )

        tags = []
        if course["tags"]:
            try:
                tags = json.loads(course["tags"])
            except json.JSONDecodeError:
                pass
        for tag in tags:
            normalized = tag.strip()
            if not normalized:
                continue
            if normalized not in tag_map:
                tag_map[normalized] = gen_uuid()
            dest.execute(
                """
                INSERT INTO "materiais_tags" (idMaterial, idTag)
                VALUES (?, ?)
                """,
                (course["id"], tag_map[normalized]),
            )

    for name, tag_id in tag_map.items():
        dest.execute('INSERT INTO "tags" (id, nome) VALUES (?, ?)', (tag_id, name))

    dest.commit()
    return tag_map


def migrate_tags(source, dest, tag_map):
    # tags already created in migrate_material_fonte
    return tag_map


def migrate_atividades(source, dest):
    course_rows = source.execute('SELECT id, modules FROM "MaterialFonte"').fetchall()
    for course in course_rows:
        try:
            modules = json.loads(course["modules"]) if course["modules"] else []
        except json.JSONDecodeError:
            modules = []
        for order, module in enumerate(modules):
            tipo = map_tipo_atividade(module.get("type", ""))
            conteudo = json.dumps(module, ensure_ascii=False)
            xp = module.get("xpReward") or 10
            tempo = module.get("estimatedTimeMin") or 5
            avaliativa = bool(
                ("simulad" in module.get("type", "").lower())
                or ("quiz" in module.get("type", "").lower())
            )
            activity_id = module.get("id") or gen_uuid()
            dest.execute(
                """
                INSERT INTO "atividades_aprendizado" (
                    id, idMaterialFonte, tipo, conteudo,
                    xpReward, tempoEstimadoMin, ordem, avaliativa
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (activity_id, course["id"], tipo, conteudo, xp, tempo, order, int(avaliativa)),
            )
    dest.commit()


def migrate_matriculas(source, dest):
    rows = source.execute(
        """
        SELECT id, idUsuario, idCurso, status, progresso,
               notaFinal, prazo, atribuidoEm, ultimoAcesso, ehObrigatorio
        FROM "matriculas"
        """
    ).fetchall()
    for row in rows:
        dest.execute(
            """
            INSERT INTO "matriculas" (
                id, idUsuario, idCurso, status, progresso,
                notaFinal, ehObrigatorio, atribuidoEm, prazo, ultimoAcesso
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["id"],
                row["idUsuario"],
                row["idCurso"],
                row["status"],
                row["progresso"],
                row["notaFinal"],
                row["ehObrigatorio"],
                row["atribuidoEm"],
                row["prazo"],
                row["ultimoAcesso"],
            ),
        )
    dest.commit()


def migrate_checkins(source, dest):
    rows = source.execute(
        """
        SELECT id, idUsuario, horasSono, qualidadeSono, nivelFoco,
               nivelFadiga, nivelEstresse, nivelMotivacao, nivelHumor,
               nivelAnsiedade, scoreBemEstar, origemDados, dadosBrutosSensor,
               dataHora, diaDaSemana, horaDoDia
        FROM "checkins_bio"
        """
    ).fetchall()
    for row in rows:
        legacy_payload = {
            "nivelMotivacao": row["nivelMotivacao"],
            "nivelHumor": row["nivelHumor"],
            "nivelAnsiedade": row["nivelAnsiedade"],
            "scoreBemEstar": row["scoreBemEstar"],
        }
        legacy_blob = json.dumps({"legacy": legacy_payload})
        dados = row["dadosBrutosSensor"]
        if dados:
            try:
                parsed = json.loads(dados)
                if "legacy" not in parsed:
                    parsed["legacy"] = legacy_payload
                dados = json.dumps(parsed)
            except json.JSONDecodeError:
                dados = f"{dados} | {legacy_blob}"
        else:
            dados = legacy_blob

        dest.execute(
            """
            INSERT INTO "checkins_bio" (
                id, idUsuario, horasSono, qualidadeSono, nivelFoco,
                nivelEstresse, nivelFadiga, origemDados, dadosBrutosSensor,
                dataHora, diaDaSemana, horaDoDia
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["id"],
                row["idUsuario"],
                row["horasSono"],
                row["qualidadeSono"],
                row["nivelFoco"],
                row["nivelEstresse"],
                row["nivelFadiga"],
                row["origemDados"],
                dados,
                row["dataHora"],
                row["diaDaSemana"],
                row["horaDoDia"],
            ),
        )
    dest.commit()


def migrate_logs(source, dest):
    rows = source.execute(
        """
        SELECT id, idUsuario, acao, detalhes, dataHora
        FROM "logs_auditoria"
        """
    ).fetchall()
    for row in rows:
        dest.execute(
            """
            INSERT INTO "logs_auditoria" (
                id, idUsuario, acao, detalhes, dataHora, ipOrigem
            ) VALUES (?, ?, ?, ?, ?, NULL)
            """,
            (row["id"], row["idUsuario"], row["acao"], row["detalhes"], row["dataHora"]),
        )
    dest.commit()


if __name__ == "__main__":
    migrate()
