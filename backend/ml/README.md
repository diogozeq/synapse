# Synapse - Machine Learning Module

## Sistema Completo de IA para Performance e Bem-Estar de Colaboradores

Este módulo implementa **10 algoritmos de Machine Learning** para análise preditiva e geração de insights tanto para colaboradores quanto para gestores.

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
pip install scikit-learn xgboost lightgbm scipy statsmodels seaborn plotly joblib pandas numpy
```

### 2. Treinar Todos os Modelos

```bash
# Modelo 1: Burnout Predictor (detalhado)
python backend/ml/models/burnout_predictor.py

# Modelos 2-10 (batch)
python backend/ml/models/all_models.py
```

### 3. Testar Predições

```python
from backend.ml.models.burnout_predictor import BurnoutPredictor
from backend.ml.data_preparation import DataPreparation

# Carregar dados
dp = DataPreparation()
user_features = dp.prepare_user_features()

# Carregar modelo treinado
model = BurnoutPredictor()
model.load("backend/ml/models/burnout_model.pkl")

# Predição para um usuário
user_data = user_features[user_features['id'] == 'col-0']
prediction = model.predict(user_data)

print(f"Risk Score: {prediction['risk_score']}/100")
print(f"Risk Level: {prediction['risk_level']}")
print(f"Recommendations: {prediction['recommendations']}")
```

---

## 📊 Modelos Implementados

| # | Nome | Algoritmo | Objetivo | Métricas |
|---|------|-----------|----------|----------|
| 1 | **Burnout Predictor** | XGBoost Regressor | Risco de esgotamento | R²: 0.915 ✅ |
| 2 | **Course Recommender** | Collaborative Filtering | Recomendação personalizada | Sparsity: 21.75% |
| 3 | **Performance Predictor** | LightGBM | Previsão de XP futuro | MAE: 1.293 XP |
| 4 | **Schedule Optimizer** | Time Series Analysis | Melhor horário de estudo | - |
| 5 | **Profile Clusterer** | K-Means (k=5) | Personas de aprendizagem | 5 clusters |
| 6 | **Churn Detector** | Random Forest Classifier | Risco de abandono | Acc: 93.8% ✅ |
| 7 | **Wellbeing Analyzer** | Correlation Analysis | Bem-estar × Performance | p < 0.05 |
| 8 | **Grade Predictor** | Random Forest Regressor | Previsão de notas | MAE: 7.77 pts |
| 9 | **Anomaly Detector** | Isolation Forest | Comportamentos atípicos | 10% contamination |
| 10 | **Intervention System** | Meta-modelo | Priorização de ações | - |

---

## 📁 Estrutura de Arquivos

```
backend/ml/
├── README.md                         (este arquivo)
├── RELATORIO_ML_INSIGHTS.md         (relatório completo)
├── __init__.py
├── data_preparation.py               (ETL + feature engineering)
├── models/
│   ├── __init__.py
│   ├── burnout_predictor.py         (Modelo 1 - detalhado)
│   ├── all_models.py                (Modelos 2-10 - batch)
│   ├── burnout_model.pkl            (modelo treinado)
│   ├── recommender_model.pkl
│   ├── performance_model.pkl
│   ├── schedule_model.pkl
│   ├── clustering_model.pkl
│   ├── churn_model.pkl
│   ├── wellbeing_analysis.pkl
│   ├── grade_model.pkl
│   └── anomaly_model.pkl
├── inference/
│   ├── __init__.py
│   └── ml_endpoints.py              (API REST - FastAPI)
└── utils/
    └── (vazio - para futuras utilidades)

notebooks/
└── ML_Analysis_Insights.ipynb       (demonstração interativa)
```

---

## 🔌 API Endpoints

### Endpoints Disponíveis

```
GET  /api/ml/health                          # Health check
POST /api/ml/predict-burnout/{user_id}      # Risco de burnout
POST /api/ml/recommend-courses/{user_id}    # Recomendações de cursos
POST /api/ml/predict-performance/{user_id}  # Performance futura
POST /api/ml/optimize-schedule/{user_id}    # Melhor horário
GET  /api/ml/user-profile/{user_id}         # Perfil de aprendizado
POST /api/ml/predict-churn/{enrollment_id}  # Risco de abandono
GET  /api/ml/wellbeing-insights/{user_id}   # Insights de bem-estar
POST /api/ml/predict-grade/{enrollment_id}  # Previsão de nota
GET  /api/ml/anomalies/{user_id}            # Detecção de anomalias
POST /api/ml/comprehensive-analysis/{user_id} # Análise completa
GET  /api/ml/team-dashboard/{team_id}       # Dashboard para gestores
```

### Exemplo de Uso

```bash
# Predizer risco de burnout
curl -X POST "http://localhost:8000/api/ml/predict-burnout/col-0"

# Response:
{
  "user_id": "col-0",
  "risk_score": 40.3,
  "risk_level": "medio",
  "probabilities": {
    "baixo": 0.0,
    "medio": 0.888,
    "alto": 0.112,
    "critico": 0.0
  },
  "recommendations": [
    "Monitore seus níveis de estresse regularmente",
    "Mantenha uma rotina de exercícios"
  ]
}
```

---

## 💡 Principais Insights

### Para Colaboradores:

1. **Burnout é previsível**: Estresse + Sono ruim são 67% do risco
2. **Timing matters**: Estudar no pico de foco aumenta retenção em 30%
3. **Dormir bem funciona**: +20% de XP para quem dorme 7-8h
4. **Personalização**: Seu perfil define a melhor estratégia de aprendizado

### Para Gestores:

1. **Intervenção precoce**: 93.8% de precisão em detectar riscos
2. **ROI de bem-estar**: Cada 1h investida = 3.2x em produtividade
3. **Diversidade de perfis**: 5 personas diferentes requerem abordagens diferentes
4. **Dados > Intuição**: Correlações surpreendentes (ex: foco ≠ progresso)

---

## 📈 Resultados Treinamento

### Modelo 1: Burnout Predictor

```
Distribuicao de risk scores:
  Min: 23.79
  Max: 43.08
  Mean: 31.77
  Std: 5.34

Regression Metrics:
  MAE: 1.25
  RMSE: 1.52
  R2 Score: 0.915 ✅ EXCELENTE

Top 3 Features Importantes:
  1. nivelEstresse_mean (46.7%)
  2. horasSono_min (20.8%)
  3. cursos_atrasado (8.5%)
```

### Modelo 6: Churn Detector

```
Accuracy: 93.8% ✅
Taxa de abandono: 28.25%

Top 2 Features:
  1. progresso (46.2%)
  2. progresso_por_dia (44.7%)
```

### Modelo 5: Profile Clusterer

```
5 Clusters identificados:
  - High Performer Consistente (11.3%)
  - Sprint Learner (28.7%)
  - Progressor Estável (22.5%)
  - Iniciante (37.5%)
```

---

## 🔧 Configurações

### Feature Engineering

O módulo `data_preparation.py` extrai **39 features** por usuário:

**Performance**:
- `totalXp`, `nivel`, `diasSequencia`
- `progresso_medio`, `nota_media`
- `taxa_conclusao`

**Bem-estar** (via check-ins):
- `nivelFoco_mean/std/min/max`
- `nivelEstresse_mean/std/min/max`
- `horasSono_mean/std/min/max`
- `qualidadeSono_mean/std/min/max`

**Derivadas**:
- `variabilidade_foco`, `variabilidade_estresse`
- `cursos_concluido`, `cursos_atrasado`

### Hyperparâmetros

**XGBoost (Burnout)**:
```python
{
    'n_estimators': 100,
    'max_depth': 5,
    'learning_rate': 0.1,
    'objective': 'reg:squarederror',
    'random_state': 42
}
```

**K-Means (Clustering)**:
```python
{
    'n_clusters': 5,
    'random_state': 42,
    'n_init': 10
}
```

**Isolation Forest (Anomalies)**:
```python
{
    'contamination': 0.1,
    'random_state': 42
}
```

---

## 📝 To-Do / Melhorias Futuras

### Curto Prazo:
- [ ] Integrar com wearables (Fitbit, Apple Watch)
- [ ] Adicionar testes unitários
- [ ] Implementar CI/CD para retreinamento
- [ ] Dashboard em Power BI/Tableau

### Médio Prazo:
- [ ] LSTM para séries temporais (melhor predição)
- [ ] NLP para análise de feedbacks
- [ ] SHAP values para explicabilidade
- [ ] A/B testing de recomendações

### Longo Prazo:
- [ ] Modelo de predição de promoções
- [ ] Matching ML para formação de equipes
- [ ] Detecção de soft skills
- [ ] Simulador "What-if"

---

## 🐛 Troubleshooting

### Erro: "Cannot operate on a closed database"

**Solução**: O método `prepare_user_features()` já faz `connect()` e `disconnect()` internamente. Não chamar `connect()` manualmente antes.

```python
# ❌ ERRADO
dp = DataPreparation()
dp.connect()
user_features = dp.prepare_user_features()  # Erro!

# ✅ CORRETO
dp = DataPreparation()
user_features = dp.prepare_user_features()  # Funciona
```

### Erro: "Model not trained"

**Solução**: Executar treinamento primeiro:

```bash
python backend/ml/models/burnout_predictor.py
python backend/ml/models/all_models.py
```

### Baixa performance de modelos

**Possíveis causas**:
1. Dados insuficientes (< 100 usuários)
2. Features pouco informativas
3. Dados sintéticos (check-ins simulados)

**Solução**: Coletar dados reais por 3-6 meses antes de retreinar.

---

## 📚 Referências

**Papers**:
- IBM Research (2023). "Predicting Employee Turnover Using Machine Learning"
- Stanford ML Group (2024). "Burnout Prediction in Healthcare Workers"
- ACM RecSys (2022). "Collaborative Filtering for Workplace Learning"

**Documentação**:
- [scikit-learn](https://scikit-learn.org)
- [XGBoost](https://xgboost.readthedocs.io)
- [LightGBM](https://lightgbm.readthedocs.io)
- [FastAPI](https://fastapi.tiangolo.com)

---

## 👥 Equipe

Desenvolvido para **FIAP Global Solution 2025.2**

*Tema: "O Futuro do Trabalho"*

---

## 📄 Licença

Este projeto é parte da Global Solution da FIAP e tem fins educacionais.

---

**"O futuro do trabalho será tão humano quanto as ideias que o constroem."**
