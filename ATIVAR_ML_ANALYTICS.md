# 🚀 GUIA RÁPIDO: Ativar ML Analytics

## ✅ Passo 1: Treinar os Modelos ML

Abra um terminal e execute:

```bash
cd "C:\Users\USUARIO\Desktop\FIAP\Fase 7 - 2025\Synapse (Gemini)"

# Treinar Modelo 1 (Burnout Predictor)
python backend/ml/models/burnout_predictor.py

# Treinar Modelos 2-10 (todos os outros)
python backend/ml/models/all_models.py
```

**Tempo estimado**: ~2-3 minutos

**Resultado esperado**:
```
TODOS OS MODELOS TREINADOS COM SUCESSO!
```

Arquivos `.pkl` serão criados em `backend/ml/models/`

---

## ✅ Passo 2: Reiniciar o Backend

```bash
# Se estiver rodando, pare o backend (Ctrl+C)

# Reinicie
.\play.ps1
```

**Verifique no console**:
```
✓ ML endpoints registered successfully!
```

---

## ✅ Passo 3: Testar a Página Analytics

1. Acesse: http://localhost:3005 (ou http://localhost:3000)
2. Faça login
3. Clique em "Analytics" na barra lateral
4. Selecione um colaborador no dropdown
5. Veja os insights de ML aparecerem! 🎉

---

## 🔍 Troubleshooting

### Erro: "Modelos ML não disponíveis"

**Causa**: Modelos não foram treinados ou arquivos `.pkl` não existem

**Solução**: Execute o Passo 1 novamente

### Erro: "404 Not Found"

**Causa**: Backend não incluiu os endpoints ML

**Solução**:
1. Verifique se vê "✓ ML endpoints registered successfully!" no console do backend
2. Se não aparecer, verifique o arquivo `backend/app.py` (linhas 26-33 e 58-61)

### Erro: "CORS policy"

**Causa**: Porta do frontend não está nas origens permitidas

**Solução**: Já corrigido! `backend/app.py` linha 45 inclui porta 3005

### Erro: "500 Internal Server Error"

**Causa**: Possível erro nos endpoints antigos de analytics

**Solução**: Os novos endpoints ML funcionam independentemente. Ignore erros do `/api/analytics/r/report`

---

## 📊 Endpoints Disponíveis

Após ativação, você terá acesso a:

```
GET  /api/ml/health
POST /api/ml/predict-burnout/{user_id}
POST /api/ml/recommend-courses/{user_id}
POST /api/ml/predict-performance/{user_id}
POST /api/ml/optimize-schedule/{user_id}
GET  /api/ml/user-profile/{user_id}
POST /api/ml/predict-churn/{enrollment_id}
GET  /api/ml/wellbeing-insights/{user_id}
POST /api/ml/predict-grade/{enrollment_id}
GET  /api/ml/anomalies/{user_id}
POST /api/ml/comprehensive-analysis/{user_id}  ← Usado pela página Analytics
GET  /api/ml/team-dashboard/{team_id}
```

---

## 🎯 Teste Rápido via API

```bash
# Testar se ML está ativo
curl http://localhost:8000/api/ml/health

# Análise completa de um colaborador
curl http://localhost:8000/api/ml/comprehensive-analysis/col-0
```

---

## 📝 Checklist

- [ ] Modelos treinados (`burnout_predictor.py` executado)
- [ ] Modelos 2-10 treinados (`all_models.py` executado)
- [ ] Arquivos `.pkl` existem em `backend/ml/models/`
- [ ] Backend reiniciado
- [ ] Mensagem "✓ ML endpoints registered successfully!" apareceu
- [ ] Página Analytics carrega sem erro 404
- [ ] Insights de ML aparecem ao selecionar colaborador

---

**Tudo pronto! 🚀 A página Analytics agora mostra 10 algoritmos de ML em ação!**
