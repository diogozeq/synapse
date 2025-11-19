<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/13iWRtrTtOxH4plXFufsuRmaGi7kWi6oO

## Run Locally

**Prerequisites:** Node.js 18+, Python 3.11+, SQLite 3

### âš ï¸ Importante: Configurar Chave da API Gemini

Antes de executar o projeto, vocÃª **DEVE** configurar a chave da API do Google Gemini:

1. **Obtenha sua chave gratuita** em: https://makersuite.google.com/app/apikey
2. **Crie um arquivo `.env`** no diretÃ³rio `backend/` (use o `.env.example` como referÃªncia)
3. **Adicione sua chave**: `GEMINI_API_KEY=sua_chave_aqui`

### Passos de InstalaÃ§Ã£o

1. Install the frontend dependencies
   `npm install`
2. Install backend dependencies
   `pip install -r backend/requirements.txt`
3. **Configure your AI key** (OBRIGATÃ“RIO - veja seÃ§Ã£o acima)
   - Crie `backend/.env` com: `GEMINI_API_KEY=YOUR_KEY`
   - Alternativa: `export GENAI_API_KEY=YOUR_KEY` ou `setx GENAI_API_KEY YOUR_KEY` no Windows
   > O backend aceita: `GEMINI_API_KEY`, `GENAI_API_KEY` ou `GOOGLE_GENAI_API_KEY`
4. (Optional) Override the API URL used by the frontend by defining `VITE_API_URL` in `.env.local`. The default is `http://localhost:8000`.
5. (First run only) Apply migrations if needed
   `npm run db:migrate`
6. Start everything with one command (this seeds the DB automatically if empty)
   `npm run dev`
   > Internally it executes `node scripts/bootstrap.mjs` â†’ `uvicorn backend:app --reload` and `vite` in paralelo.

The app will be available at `http://localhost:5173` proxying data from `http://localhost:8000`.

## Database & Prisma

- The schema lives at [`schema.prisma`](schema.prisma). Migrations are tracked in [`prisma/migrations`](prisma/migrations) and can be applied with `npm run db:migrate`.
- Use `npm run db:seed` to populate the SQLite database (`data/databases/real.db`) with the former mock data (courses, teams, collaborators, enrollments and biometric samples). A legacy `dev.db` snapshot can live alongside it in the same folder for migrations.
- Every time the schema evolves we capture a migration with `prisma migrate diff --from-url file:./data/databases/dev.db --to-schema-datamodel schema.prisma --script` and commit the SQL under `prisma/migrations/<timestamp>_*`.
- A snapshot of the previous state is stored under `backups/pre-migrate-*` before each migration.

## Backend & AI Proxy

- [`backend/app.py`](backend/app.py) exposes REST endpoints for courses, users, enrollments and teams plus the existing IoT + dashboard KPI routes.
- The new `POST /api/ai` route proxies Gemini/GPE requests server-side, hiding the API key from the browser. The frontend helpers in [`src/services/geminiService.ts`](src/services/geminiService.ts) now call this proxy.
- Run the backend with `npm run dev:backend` (internally `uvicorn backend:app --reload`). Ensure the environment variable `GENAI_API_KEY` (or `GOOGLE_GENAI_API_KEY`/`GEMINI_API_KEY`) is available before starting.

## Scripts Ãºteis

| Script | DescriÃ§Ã£o |
| --- | --- |
| `npm run dev` | Levanta backend (com seed automÃ¡tico) e frontend em paralelo |
| `npm run dev:frontend` | Inicia somente o frontend Vite |
| `npm run dev:backend` | Executa o FastAPI (jÃ¡ rodando seed automÃ¡tico) |
| `npm run db:migrate` | Aplica as migraÃ§Ãµes registradas no SQLite |
| `npm run db:seed` | Recria os dados a partir dos mocks oficiais |
| `npm run build` / `npm run preview` | Build e preview de produÃ§Ã£o |

## Arquitetura HÃ­brida & Compliance (Schema Unificado)

> Diferente de soluÃ§Ãµes tradicionais, o Synapse utiliza uma arquitetura *Schema-First* focada em integridade de dados e auditoria.
>
> 1. **PersistÃªncia Robusta (Banco de Dados):** Utilizamos um schema relacional normalizado (ver diagrama ER) que contempla tabelas de Auditoria (`logs_auditoria`) para conformidade com normas de **Cybersecurity** e rastreabilidade.
> 2. **IoT Data Lake:** A tabela `checkins_bio` atua como repositÃ³rio central dos dados biomÃ©tricos coletados via Python, permitindo ingestÃ£o de alta frequÃªncia.
> 3. **IntegraÃ§Ã£o Multi-Linguagem:**
>    - **Prisma ORM:** Gerencia a estrutura e migraÃ§Ãµes (Modelagem).
>    - **Python/FastAPI:** Atua como processador de IA e controlador IoT, lendo/escrevendo no DB.
>    - **R:** Conecta-se ao mesmo Data Lake para gerar clusters de comportamento e prever burnout organizacional.
>
> Essa estrutura garante que a soluÃ§Ã£o Ã© nÃ£o apenas funcional (frontend), mas escalÃ¡vel, segura e baseada em dados (backend).
## Synapse Nebula — Cloud & AICSS

- **Blueprint multi-cloud:** o PDF final inclui o diagrama “Synapse Nebula” (FastAPI + Cloud Run + Cloud SQL + buckets estáticos). O scripts/bootstrap.mjs mostra como garantimos a paridade local vs cloud usando Prisma, snapshots automáticos e fixture eal.db.
- **Ops Symphony (CI/CD):** workflows GitHub Actions empacotam o Vite, rodam testes FastAPI/Python + Vitest e executam scripts/analytics/analise_cluster.R, anexando o relatório e o laudo OWASP (Red Team Arena) no artefato.
- **Vaulted Repo:** o código de entrega fica em um GitHub privado com convites aceitos pelo tutor; este mirror contém apenas o POC para rodar localmente. O PDF traz o link privado e o QR do vídeo “QUERO CONCORRER”.

## Zero Trust Shield & Data Vault

- **CORS restritivo:** defina ALLOWED_ORIGINS no .env para liberar apenas portais FIAP/org. Nada de *.
- **Passkey-ready hashing:** passlib[bcrypt] gera o hash padrão para todo usuário criado (incluindo o fluxo IoT), habilitando WebAuthn/JWT curto via proxy.
- **Auditoria automatizada:** cada chamada ao /api/iot/predict, /api/ai e /api/checkins dispara logs_auditoria, garantindo rastreabilidade para Cybersecurity.

## BioDigital Twin + Formação Social

- **/api/iot/predict:** o PredictiveLab treina Logistic Regression + RandomForest + mini-MLP Torch com os check-ins reais (sem gerar novos dados). O card “NeuroPredictor” mostra stress/foco projetado, confiança e roteiro de ações.
- **Radar ESG & Inclusion Pulse:** ackend/services/social_impact.py calcula KPI de pertencimento, diversidade e missões verdes usando matrículas, equipes e bots. O painel “Social Impact” responde aos eixos “modelos verdes”, “bots/agentes” e “recrutamento inclusivo”.
- **R Synapse Lab:** scripts/analytics/analise_cluster.R agora roda ANOVA, correlações foco x sono e exporta insight_r_summary.json, consumida pelo AnalyticsPanel para storytelling social/ambiental direto no front.
