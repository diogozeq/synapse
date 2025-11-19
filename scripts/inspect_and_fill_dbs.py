import sqlite3
import json
import os
import uuid
import random
from datetime import datetime, timedelta

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(__file__))
DB_PATHS = [
    os.path.join(WORKSPACE_ROOT, 'data', 'databases', 'dev.db'),
    os.path.join(WORKSPACE_ROOT, 'backups', 'pre-migrate-20251119-133438', 'dev.db')
]

TARGET_USERS = 80
TARGET_COURSES = 12

def summarize_db(path):
    out = { 'path': path, 'exists': os.path.exists(path) }
    if not out['exists']:
        return out
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    c = con.cursor()
    tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")]
    out['tables'] = {}
    for t in tables:
        try:
            rc = c.execute(f"SELECT COUNT(*) as cnt FROM '{t}'").fetchone()['cnt']
        except Exception as e:
            rc = str(e)
        cols = c.execute(f"PRAGMA table_info('{t}')").fetchall()
        colinfo = []
        for col in cols:
            coln = col['name']
            try:
                nulls = c.execute(f"SELECT COUNT(*) as cnt FROM '{t}' WHERE \"{coln}\" IS NULL").fetchone()['cnt']
                distinct = c.execute(f"SELECT COUNT(DISTINCT \"{coln}\") as cnt FROM '{t}'").fetchone()['cnt']
                sample = [r[0] for r in c.execute(f"SELECT DISTINCT \"{coln}\" FROM '{t}' LIMIT 5").fetchall()]
            except Exception as e:
                nulls = str(e); distinct = None; sample = []
            colinfo.append({'name': coln, 'nulls': nulls, 'distinct': distinct, 'sample': sample})
        out['tables'][t] = {'row_count': rc, 'columns': colinfo}
    con.close()
    return out

# helper inserts

def ensure_teams(con):
    c = con.cursor()
    # find actual equipe table name (case-insensitive)
    tname = None
    for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"):
        if r[0].lower() == 'equipe':
            tname = r[0]
            break
    if not tname:
        return
    existing = {r[0] for r in c.execute(f"SELECT id FROM '{tname}'").fetchall()}
    teams = [
        ('t1', 'Atendimento N1', 'Customer Success'),
        ('t2', 'Comercial Inside Sales', 'Vendas'),
        ('t3', 'Backoffice Financeiro', 'Financeiro'),
        ('t4', 'Engenharia de Produto', 'Produto'),
        ('t5', 'Suporte Técnico', 'Suporte')
    ]
    for tid, name, area in teams:
        if tid not in existing:
            cols = [cinfo[1] for cinfo in con.execute(f"PRAGMA table_info('{tname}')").fetchall()]
            insert_cols = [col for col in ('id','nome','descricao') if col in cols]
            placeholders = ','.join(['?']*len(insert_cols))
            sql = f"INSERT OR REPLACE INTO '{tname}' ({','.join(insert_cols)}) VALUES ({placeholders})"
            vals = []
            for col in insert_cols:
                if col == 'id': vals.append(tid)
                elif col == 'nome': vals.append(name)
                elif col == 'descricao': vals.append(area)
            c.execute(sql, vals)
    con.commit()


def table_exists(con, table):
    c = con.cursor()
    r = c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone()
    return r is not None


def insert_users(con, n, start_index=0):
    c = con.cursor()
    cargos = ['Analista Jr','Analista Pl','Analista Sr','Especialista','Assistente','Líder','Coordenador']
    firsts = ['João','Maria','Pedro','Ana','Lucas','Juliana','Marcos','Fernanda','Rafael','Beatriz','Thiago','Camila','Bruno','Larissa','Rodrigo','Amanda','Guilherme','Patrícia','Gabriel','Vanessa','Daniel','Renata','Eduardo','Sofia','Mateus','Helena','Vitor','Clara','Fábio','Isabela','Igor','Laura']
    lasts = ['Silva','Oliveira','Santos','Costa','Pereira','Souza','Lima','Rocha','Alves','Dias','Ribeiro','Gomes','Martins','Carvalho','Ferreira','Rodrigues','Barbosa','Castro','Nogueira','Cardoso','Mendes','Pinto','Araújo','Moraes','Freitas']

    for i in range(n):
        name = f"{firsts[(start_index+i) % len(firsts)]} {lasts[(start_index+i) % len(lasts)]}"
        uid = str(uuid.uuid4())
        email = name.lower().replace(' ', '.') + f'.{random.randint(1,999)}@synapse.com'
        cpf = f"{random.randint(100,999)}.{random.randint(100,999)}.{random.randint(100,999)}-{random.randint(10,99)}"
        cargo = random.choice(cargos)
        team_id = random.choice(['t1','t2','t3','t4','t5'])
        now = datetime.utcnow().isoformat()
        totalXp = random.randint(0,8000)
        nivel = random.randint(1,30)
        diasSequencia = random.randint(0,60)
        # adapt to actual usuarios table columns
        # determine usuarios table name (case-insensitive)
        tname = 'usuarios'
        cur = con.cursor()
        names = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").fetchall()]
        for nm in names:
            if nm.lower() == 'usuarios':
                tname = nm
                break
        tcols = [r[1] for r in con.execute(f"PRAGMA table_info('{tname}')").fetchall()]
        vals_map = {
            'id': uid,
            'nome': name,
            'email': email,
            'hashSenha': 'hashed_secret',
            'avatarUrl': f'https://i.pravatar.cc/150?u={uid}',
            'cargo': cargo,
            'papel': 'COLABORADOR',
            'createdAt': now,
            'totalXp': totalXp,
            'nivel': nivel,
            'diasSequencia': diasSequencia,
            'idEquipe': team_id
        }
        insert_cols = [col for col in vals_map.keys() if col in tcols]
        placeholders = ','.join(['?']*len(insert_cols))
        sql = f"INSERT INTO {tname} ({','.join(insert_cols)}) VALUES ({placeholders})"
        vals = [vals_map[cname] for cname in insert_cols]
        c.execute(sql, vals)
    con.commit()
    return


def insert_courses(con, n, start_index=0):
    c = con.cursor()
    # detect actual material table name (case-insensitive)
    tname = None
    for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"):
        if r[0].lower() == 'materialfonte' or r[0].lower() == 'materialfonte':
            tname = r[0]
            break
    if not tname:
        return
    table_cols = [r[1] for r in c.execute(f"PRAGMA table_info('{tname}')").fetchall()]
    for i in range(n):
        cid = f'course-extra-{start_index+i}-{uuid.uuid4().hex[:6]}'
        title = f'Conteúdo Extra {start_index+i+1}: Boas Práticas {random.choice(["RH","TI","Produto","Segurança"]) }'
        created = datetime.utcnow().isoformat()
        vals_map = {
            'id': cid,
            'titulo': title,
            'descricao': 'Gerado para popular amostra',
            'categoria': 'Extra',
            'tags': json.dumps(["Extra","Seed"]),
            'modules': json.dumps([]),
            'progress': random.randint(0,100),
            'totalXp': random.randint(100,2000),
            'createdAt': created,
            'isRecommended': 0,
            'tipoArquivo': 'AI_GENERATED',
            'urlArquivo': f'https://cdn.synapse/{cid}.pdf',
            'status': 'CONCLUIDO' if random.random()>0.5 else 'EM_ANDAMENTO',
            'thumbnailUrl': None
        }
        insert_cols = [col for col in vals_map.keys() if col in table_cols]
        placeholders = ','.join(['?']*len(insert_cols))
        sql = f"INSERT INTO '{tname}' ({','.join(insert_cols)}) VALUES ({placeholders})"
        vals = [vals_map[cname] for cname in insert_cols]
        c.execute(sql, vals)
    con.commit()


def insert_enrollments(con, users_limit=10):
    c = con.cursor()
    # get all users and courses
    users = [r[0] for r in c.execute("SELECT id FROM usuarios").fetchall()]
    courses = [r[0] for r in c.execute("SELECT id FROM materialFonte").fetchall()]
    if not users or not courses:
        return
    statuses = ['NAO_INICIADO','EM_ANDAMENTO','CONCLUIDO','ATRASADO','REPROVADO_SIMULADO']
    created = datetime.utcnow()
    count = 0
    for u in users[:users_limit]:
        chosen = random.sample(courses, min(3, len(courses)))
        for course in chosen:
            mid = str(uuid.uuid4())
            status = random.choice(statuses)
            progress = 100 if status=='CONCLUIDO' else random.randint(0,99)
            finalScore = random.randint(70,100) if status=='CONCLUIDO' else None
            prazo = (created + timedelta(days=random.randint(5,30))).isoformat()
            atribuido = created.isoformat()
            ultimo = (created - timedelta(days=random.randint(0,10))).isoformat()
            ehObrigatorio = 1 if random.random()<0.3 else 0
            c.execute("INSERT INTO matriculas (id, idUsuario, idCurso, status, progresso, notaFinal, prazo, atribuidoEm, ultimoAcesso, ehObrigatorio) VALUES (?,?,?,?,?,?,?,?,?,?)",
                      (mid, u, course, status, progress, finalScore, prazo, atribuido, ultimo, ehObrigatorio))
            count += 1
    con.commit()
    return count


def insert_checkins_and_logs(con, per_user=2):
    c = con.cursor()
    users = [r[0] for r in c.execute("SELECT id FROM usuarios").fetchall()]
    for u in users:
        for k in range(per_user):
            kid = f'{u}-bio-{uuid.uuid4().hex[:6]}'
            when = datetime.utcnow() - timedelta(days=random.randint(0,20))
            horasSono = random.randint(4,9)
            qualidade = random.randint(4,10)
            foco = random.randint(20,95)
            fadiga = random.randint(5,80)
            estresse = random.randint(10,90)
            motiv = random.randint(20,100)
            humor = random.randint(1,10)
            ansiedade = random.randint(1,90)
            score = random.randint(30,98)
            c.execute("INSERT INTO checkins_bio (id, idUsuario, horasSono, qualidadeSono, nivelFoco, nivelFadiga, nivelEstresse, nivelMotivacao, nivelHumor, nivelAnsiedade, scoreBemEstar, origemDados, dadosBrutosSensor, dataHora, diaDaSemana, horaDoDia) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (kid, u, horasSono, qualidade, foco, fadiga, estresse, motiv, humor, ansiedade, score, 'SIMULACAO_FILL', json.dumps({'seed': True, 'sample': k}), when.isoformat(), when.weekday(), when.hour))
        # logs
        for l in range(2):
            lid = f'{u}-log-{uuid.uuid4().hex[:6]}'
            when = datetime.utcnow() - timedelta(minutes=random.randint(0,1000))
            acao = random.choice(['LOGIN','COURSE_PROGRESS','DOWNLOAD','FEEDBACK'])
            detalhes = json.dumps({'text': f'{acao} em ação de seed', 'seed': True, 'index': l})
            c.execute("INSERT INTO logs_auditoria (id, idUsuario, acao, detalhes, dataHora) VALUES (?,?,?,?,?)", (lid, u, acao, detalhes, when.isoformat()))
    con.commit()


def main():
    summaries = [summarize_db(p) for p in DB_PATHS]
    print(json.dumps({'summary': summaries}, indent=2, ensure_ascii=False))

    # pick DB to fill: prefer workspace dev.db if exists but has fewer rows than backup
    existing = [s for s in summaries if s.get('exists')]
    if not existing:
        print('Nenhum dev.db encontrado — nada a preencher')
        return
    # compute total rows across all user-visible tables
    def total_rows(s):
        t = s.get('tables',{})
        return sum(v.get('row_count') if isinstance(v.get('row_count'), int) else 0 for v in t.values())
    target_db = min(existing, key=total_rows)
    path = target_db['path']
    print('\nSelecionado para preenchimento:', path)

    con = sqlite3.connect(path)
    try:
        # ensure teams
        if table_exists(con, 'equipe'):
            ensure_teams(con)
        # ensure materialFonte table
        cur = con.cursor()
        mat_count = 0
        if table_exists(con, 'materialFonte'):
            mat_count = cur.execute("SELECT COUNT(*) FROM materialFonte").fetchone()[0]
        if mat_count < TARGET_COURSES:
            insert_courses(con, TARGET_COURSES - mat_count, start_index=mat_count)
            print(f'Inseridos {TARGET_COURSES - mat_count} cursos extras')
        # ensure usuarios
        user_count = 0
        if table_exists(con, 'usuarios'):
            user_count = cur.execute("SELECT COUNT(*) FROM usuarios").fetchone()[0]
        if user_count < TARGET_USERS:
            insert_users(con, TARGET_USERS - user_count, start_index=user_count)
            print(f'Inseridos {TARGET_USERS - user_count} usuários')
        # create enrollments for a subset
        if table_exists(con, 'matriculas'):
            inserted = insert_enrollments(con, users_limit= min(50, TARGET_USERS))
            print(f'Inseridas {inserted} matrículas de amostra')
        # checkins and logs
        if table_exists(con, 'checkins_bio') and table_exists(con, 'logs_auditoria'):
            insert_checkins_and_logs(con, per_user=2)
            print('Inseridos checkins e logs para usuários')

        # final summary
        final = summarize_db(path)
        print('\nResumo final do DB atualizado:')
        print(json.dumps(final, indent=2, ensure_ascii=False))
    finally:
        con.close()

if __name__ == '__main__':
    main()
