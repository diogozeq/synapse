"""
ML API Endpoints
=================

Endpoints FastAPI para todos os modelos de Machine Learning.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import joblib
import pandas as pd
import sys
sys.path.append('.')

from backend.ml.data_preparation import DataPreparation
from backend.ml.models.burnout_predictor import BurnoutPredictor
from backend.ml.models.all_models import (
    CourseRecommender, PerformancePredictor, ScheduleOptimizer,
    ProfileClusterer, ChurnDetector, WellbeingAnalyzer,
    GradePredictor, AnomalyDetector
)

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

# Carregar modelos
dp = DataPreparation()

try:
    # Modelo 1: Burnout
    burnout_model = BurnoutPredictor()
    burnout_model.load("backend/ml/models/burnout_model.pkl")

    # Modelo 2: Recommender
    recommender_data = joblib.load("backend/ml/models/recommender_model.pkl")
    recommender = CourseRecommender()
    recommender.user_similarity_df = recommender_data['user_similarity']
    recommender.course_profiles = recommender_data['course_profiles']

    # Modelo 3: Performance
    perf_data = joblib.load("backend/ml/models/performance_model.pkl")
    perf_predictor = PerformancePredictor()
    perf_predictor.model = perf_data['model']
    perf_predictor.scaler = perf_data['scaler']

    # Modelo 4: Schedule
    schedule_data = joblib.load("backend/ml/models/schedule_model.pkl")
    scheduler = ScheduleOptimizer()
    scheduler.patterns = schedule_data['patterns']

    # Modelo 5: Clustering
    cluster_data = joblib.load("backend/ml/models/clustering_model.pkl")
    clusterer = ProfileClusterer()
    clusterer.model = cluster_data['model']
    clusterer.scaler = cluster_data['scaler']
    clusterer.cluster_names = cluster_data['cluster_names']

    # Modelo 6: Churn
    churn_data = joblib.load("backend/ml/models/churn_model.pkl")
    churn_detector = ChurnDetector()
    churn_detector.model = churn_data['model']
    churn_detector.scaler = churn_data['scaler']

    # Modelo 7: Wellbeing
    wellbeing_data = joblib.load("backend/ml/models/wellbeing_analysis.pkl")
    wellbeing_analyzer = WellbeingAnalyzer()
    wellbeing_analyzer.correlations = wellbeing_data['correlations']

    # Modelo 8: Grade
    grade_data = joblib.load("backend/ml/models/grade_model.pkl")
    grade_predictor = GradePredictor()
    grade_predictor.model = grade_data['model']
    grade_predictor.scaler = grade_data['scaler']

    # Modelo 9: Anomaly
    anomaly_data = joblib.load("backend/ml/models/anomaly_model.pkl")
    anomaly_detector = AnomalyDetector()
    anomaly_detector.model = anomaly_data['model']

    print("Todos os modelos ML carregados com sucesso!")

except Exception as e:
    print(f"Erro ao carregar modelos: {e}")
    print("Execute o treinamento primeiro: python backend/ml/models/all_models.py")


# ===== ENDPOINTS =====

@router.get("/health")
async def health_check():
    """Health check dos modelos ML"""
    return {
        "status": "ok",
        "models_loaded": {
            "burnout": burnout_model.model is not None,
            "recommender": recommender.course_profiles is not None,
            "performance": perf_predictor.model is not None,
            "scheduler": scheduler.patterns is not None,
            "clustering": clusterer.model is not None,
            "churn": churn_detector.model is not None,
            "wellbeing": wellbeing_analyzer.correlations is not None,
            "grade": grade_predictor.model is not None,
            "anomaly": anomaly_detector.model is not None,
        }
    }


@router.post("/predict-burnout/{user_id}")
async def predict_burnout(user_id: str):
    """
    Prediz risco de burnout para um colaborador.

    Returns:
        - risk_score: Score de 0-100
        - risk_level: baixo/medio/alto/critico
        - probabilities: Probabilidades de cada nível
        - recommendations: Recomendações personalizadas
    """
    try:
        user_features = dp.prepare_user_features()
        user_data = user_features[user_features['id'] == user_id]

        if len(user_data) == 0:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        result = burnout_model.predict(user_data)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend-courses/{user_id}")
async def recommend_courses(user_id: str, n: int = 5):
    """
    Recomenda cursos personalizados para um colaborador.

    Args:
        n: Número de recomendações

    Returns:
        Lista de cursos recomendados com score
    """
    try:
        recommendations = recommender.recommend(user_id, n=n)
        return {
            "user_id": user_id,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-performance/{user_id}")
async def predict_performance(user_id: str):
    """
    Prediz performance futura do colaborador.

    Returns:
        - current_xp: XP atual
        - predicted_xp_next_month: XP previsto
        - growth_estimate: Crescimento estimado
    """
    try:
        user_features = dp.prepare_user_features()
        user_data = user_features[user_features['id'] == user_id]

        if len(user_data) == 0:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        result = perf_predictor.predict(user_data)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-schedule/{user_id}")
async def optimize_schedule(user_id: str):
    """
    Recomenda melhor horário de estudo.

    Returns:
        - best_study_hour: Melhor hora para estudar
        - worst_study_hour: Pior hora
        - recommendation: Texto explicativo
    """
    try:
        result = scheduler.recommend_schedule(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """
    Identifica perfil de aprendizado do colaborador.

    Returns:
        - profile_cluster: ID do cluster
        - profile_name: Nome do perfil (ex: "High Performer Consistente")
    """
    try:
        user_features = dp.prepare_user_features()
        user_data = user_features[user_features['id'] == user_id]

        if len(user_data) == 0:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        result = clusterer.predict(user_data)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-churn/{enrollment_id}")
async def predict_churn(enrollment_id: str):
    """
    Prediz probabilidade de abandono de curso.

    Returns:
        - churn_probability: Probabilidade de 0-1
        - risk_level: baixo/medio/alto
    """
    try:
        enrollment_features = dp.prepare_enrollment_features()
        enrollment_data = enrollment_features[enrollment_features['id'] == enrollment_id]

        if len(enrollment_data) == 0:
            raise HTTPException(status_code=404, detail="Matricula nao encontrada")

        result = churn_detector.predict(enrollment_data)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wellbeing-insights/{user_id}")
async def get_wellbeing_insights(user_id: str):
    """
    Retorna insights sobre correlação bem-estar x performance.

    Returns:
        Lista de insights personalizados
    """
    try:
        user_features = dp.prepare_user_features()
        user_data = user_features[user_features['id'] == user_id]

        if len(user_data) == 0:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        insights = wellbeing_analyzer.get_insights(user_data)
        return {
            "user_id": user_id,
            "insights": insights,
            "correlations": wellbeing_analyzer.correlations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-grade/{enrollment_id}")
async def predict_grade(enrollment_id: str):
    """
    Prediz nota final em um curso.

    Returns:
        - predicted_grade: Nota prevista (0-100)
        - confidence: Nível de confiança
    """
    try:
        enrollment_features = dp.prepare_enrollment_features()
        enrollment_data = enrollment_features[enrollment_features['id'] == enrollment_id]

        if len(enrollment_data) == 0:
            raise HTTPException(status_code=404, detail="Matricula nao encontrada")

        result = grade_predictor.predict(enrollment_data)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/anomalies/{user_id}")
async def detect_anomalies(user_id: str):
    """
    Detecta comportamentos anormais.

    Returns:
        - is_anomaly: Boolean
        - anomaly_score: Score de anomalia
        - warning: Mensagem de alerta
    """
    try:
        user_features = dp.prepare_user_features()
        user_data = user_features[user_features['id'] == user_id]

        if len(user_data) == 0:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        result = anomaly_detector.predict(user_data)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/team-dashboard/{team_id}")
async def get_team_dashboard(team_id: str):
    """
    Dashboard agregado para gestores - métricas da equipe.

    Returns:
        Estatísticas agregadas da equipe
    """
    try:
        team_features = dp.prepare_team_features()
        team_data = team_features[team_features['id'] == team_id]

        if len(team_data) == 0:
            raise HTTPException(status_code=404, detail="Equipe nao encontrada")

        # Métricas agregadas
        team_stats = team_data.iloc[0].to_dict()

        # Colaboradores em risco
        user_features = dp.prepare_user_features()
        team_users = user_features[user_features['idEquipe'] == team_id]

        at_risk = []
        for _, user in team_users.iterrows():
            burnout_result = burnout_model.predict(pd.DataFrame([user]))
            if burnout_result['risk_level'] in ['alto', 'critico']:
                at_risk.append({
                    'user_id': user['id'],
                    'risk_level': burnout_result['risk_level'],
                    'risk_score': burnout_result['risk_score']
                })

        return {
            "team_id": team_id,
            "team_name": team_stats.get('nome', 'Unknown'),
            "total_members": int(team_stats.get('total_colaboradores', 0)),
            "avg_xp": float(team_stats.get('totalXp_mean', 0)),
            "avg_focus": float(team_stats.get('team_nivelFoco', 0)),
            "avg_stress": float(team_stats.get('team_nivelEstresse', 0)),
            "members_at_risk": at_risk,
            "risk_count": len(at_risk)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comprehensive-analysis/{user_id}")
async def comprehensive_analysis(user_id: str):
    """
    Análise completa do colaborador - todos os modelos.

    Returns:
        Todos os insights agregados
    """
    try:
        user_features = dp.prepare_user_features()
        user_data = user_features[user_features['id'] == user_id]

        if len(user_data) == 0:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")

        # Executar todos os modelos
        analysis = {
            "user_id": user_id,
            "burnout": burnout_model.predict(user_data),
            "performance": perf_predictor.predict(user_data),
            "profile": clusterer.predict(user_data),
            "schedule": scheduler.recommend_schedule(user_id),
            "anomaly": anomaly_detector.predict(user_data),
            "wellbeing": {
                "insights": wellbeing_analyzer.get_insights(user_data)
            },
            "courses": recommender.recommend(user_id, n=3)
        }

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Exportar router
__all__ = ['router']
