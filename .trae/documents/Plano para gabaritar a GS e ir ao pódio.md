## Prioridades Críticas (Segurança e Compliance)
- Implementar autenticação JWT e RBAC por rota (gestor/colaborador) no `backend/app.py`; proteger `/courses`, `/users`, `/teams`, `/roles`, `/enrollments`, `/api/*`.
- Endurecer CORS removendo `"*"` e restringindo a origens confiáveis (`backend/app.py:35`).
- Ativar criptografia consistente para dados sensíveis (usar `_enc/_dec` com `DATA_ENCRYPTION_KEY`) e política de retenção/remoção (LGPD).

## IA/ML Integrado em Tempo Real
- Conectar `backend/experiments/ml_models.py` ao `/api/iot/checkin` para prever `stress/focus` (substituir heurística atual `backend/app.py:1267-1269`).
- Treinar incrementalmente com histórico (`checkins_bio`) e expor endpoint `/api/analytics/predictions` para dashboards.

## Cloud & Banco de Dados
- Dockerizar frontend + backend; criar `docker-compose.yml` (FastAPI, Postgres, Prisma migrate).
- Migrar de `SQLite` (`schema.prisma:6`) para `PostgreSQL` gerenciado; configurar `DATABASE_URL` e `prisma migrate deploy`.
- Configurar CI/CD (GitHub Actions) para build, testes e deploy automático (Render/Azure/GCP).

## Vídeo, YouTube e Relatório GS
- Adicionar componente de embed YouTube com coleta de telemetria (tempo assistido, marcos) e endpoint `/api/video/telemetry`.
- Gerar PDF GS com capa, links íntegros (YouTube não listado + GitHub privado), arquitetura, justificativas e trechos de código referenciados.

## Gamificação Avançada
- Criar loja de recompensas (economia de pontos), missões/quests semanais e temporadas/ligas com reset de ranking.
- Integrar badges dinâmicos com eventos (SR, performance, colaboração).

## ESG/Well‑Being
- Adicionar painel de sustentabilidade (pegada de curso, metas ESG) e protocolos de intervenção de bem‑estar.
- Implementar acessibilidade (WCAG) e preferências de inclusão; módulo "Formação Social" com atividades e métricas.

## Observabilidade e Qualidade
- Logs estruturados + tracing; métricas Prometheus (latência, erros, throughput).
- Testes unitários (backend e frontend) e e2e (Cypress); smoke test para R (geração de gráfico).

## Entregáveis
- PDF único com: introdução, desenvolvimento, resultados esperados e conclusões; links YouTube (não listado) e GitHub (privado com tutor convidado).
- Vídeo integrador (≤7 min) destacando integração entre disciplinas; abrir com "QUERO CONCORRER".

Se aprovar, executo as mudanças por etapas começando por Segurança + ML em tempo real e migração para Postgres com Docker/CI.