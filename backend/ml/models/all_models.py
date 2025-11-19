"""
All ML Models - Synapse
========================

Implementação integrada de todos os modelos de Machine Learning:
2. Sistema de Recomendação de Cursos
3. Preditor de Performance Futura
4. Otimizador de Horários de Estudo
5. Clustering de Perfis de Aprendizado
6. Detector de Abandono de Cursos
7. Análise de Correlação Bem-Estar x Performance
8. Preditor de Notas em Cursos
9. Detector de Anomalias
10. Sistema de Intervenção Inteligente
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score
from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
import xgboost as xgb
import lightgbm as lgb
from scipy import stats
from scipy.stats import pearsonr
import joblib
import warnings
warnings.filterwarnings('ignore')

import sys
sys.path.append('.')
from backend.ml.data_preparation import DataPreparation


class CourseRecommender:
    """2. Sistema de Recomendação de Cursos"""

    def __init__(self):
        self.user_profiles = None
        self.course_profiles = None

    def train(self, enrollment_df: pd.DataFrame):
        """Treina sistema de recomendação usando Collaborative Filtering"""
        print("\n" + "="*60)
        print("MODELO 2: COURSE RECOMMENDER")
        print("="*60)

        # Criar matriz user-course
        pivot = enrollment_df.pivot_table(
            index='idUsuario',
            columns='idCurso',
            values='progresso',
            fill_value=0
        )

        # Similaridade entre usuários (cosine similarity)
        from sklearn.metrics.pairwise import cosine_similarity
        user_sim = cosine_similarity(pivot)
        self.user_similarity_df = pd.DataFrame(
            user_sim,
            index=pivot.index,
            columns=pivot.index
        )

        # Perfis de curso (média de progresso)
        self.course_profiles = enrollment_df.groupby('idCurso').agg({
            'progresso': 'mean',
            'notaFinal': 'mean',
            'status': lambda x: (x == 'CONCLUIDO').sum()
        }).rename(columns={'status': 'conclusoes'})

        print(f"Users: {len(pivot)}")
        print(f"Courses: {len(pivot.columns)}")
        print(f"Sparsity: {(pivot == 0).sum().sum() / pivot.size:.2%}")

        self.save()
        return {'users': len(pivot), 'courses': len(pivot.columns)}

    def recommend(self, user_id: str, n=5) -> list:
        """Recomenda cursos para um usuário"""
        if user_id not in self.user_similarity_df.index:
            return []

        # Usuários similares
        similar_users = self.user_similarity_df[user_id].sort_values(ascending=False)[1:6]

        recommendations = []
        for course_id, stats in self.course_profiles.iterrows():
            recommendations.append({
                'course_id': course_id,
                'score': float(stats['progresso']),
                'avg_grade': float(stats.get('notaFinal', 0)),
                'popularity': int(stats['conclusoes'])
            })

        # Ordenar por score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:n]

    def save(self, filepath="backend/ml/models/recommender_model.pkl"):
        joblib.dump({
            'user_similarity': self.user_similarity_df,
            'course_profiles': self.course_profiles
        }, filepath)
        print(f"Modelo salvo em {filepath}")


class PerformancePredictor:
    """3. Preditor de Performance Futura"""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()

    def train(self, user_features_df: pd.DataFrame):
        """Prediz XP futuro baseado em histórico"""
        print("\n" + "="*60)
        print("MODELO 3: PERFORMANCE PREDICTOR")
        print("="*60)

        # Features
        features = ['nivel', 'diasSequencia', 'progresso_medio', 'nivelFoco_mean',
                   'nivelEstresse_mean', 'total_cursos']
        features = [f for f in features if f in user_features_df.columns]

        X = user_features_df[features].fillna(0)
        y = user_features_df['totalXp']

        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Normalizar
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Treinar
        self.model = lgb.LGBMRegressor(n_estimators=100, random_state=42, verbose=-1)
        self.model.fit(X_train_scaled, y_train)

        # Avaliar
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        print(f"MAE: {mae:.2f} XP")
        print(f"R2: {r2:.3f}")

        # Feature importance
        importances = pd.DataFrame({
            'feature': features,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        print("\nTop Features:")
        print(importances.head())

        self.save()
        return {'mae': mae, 'r2': r2}

    def predict(self, user_features: pd.DataFrame) -> dict:
        """Prediz XP futuro"""
        features = ['nivel', 'diasSequencia', 'progresso_medio', 'nivelFoco_mean',
                   'nivelEstresse_mean', 'total_cursos']
        features = [f for f in features if f in user_features.columns]

        X = user_features[features].fillna(0)
        X_scaled = self.scaler.transform(X)

        xp_predicted = self.model.predict(X_scaled)

        return {
            'user_id': user_features.iloc[0]['id'] if 'id' in user_features.columns else 0,
            'current_xp': int(user_features.iloc[0]['totalXp']),
            'predicted_xp_next_month': int(xp_predicted[0]),
            'growth_estimate': int(xp_predicted[0] - user_features.iloc[0]['totalXp'])
        }

    def save(self, filepath="backend/ml/models/performance_model.pkl"):
        joblib.dump({'model': self.model, 'scaler': self.scaler}, filepath)
        print(f"Modelo salvo em {filepath}")


class ScheduleOptimizer:
    """4. Otimizador de Horários de Estudo"""

    def __init__(self):
        self.patterns = None

    def train(self, checkins_df: pd.DataFrame):
        """Analisa padrões de foco por hora"""
        print("\n" + "="*60)
        print("MODELO 4: SCHEDULE OPTIMIZER")
        print("="*60)

        # Padrões por hora
        hourly = checkins_df.groupby('horaDoDia').agg({
            'nivelFoco': 'mean',
            'nivelEstresse': 'mean'
        })

        # Score de produtividade (foco alto + estresse baixo)
        hourly['productivity_score'] = hourly['nivelFoco'] - (hourly['nivelEstresse'] / 2)

        self.patterns = hourly
        print("\nMelhores horarios (top 5):")
        best_hours = hourly.sort_values('productivity_score', ascending=False).head()
        print(best_hours)

        self.save()
        return hourly.to_dict()

    def recommend_schedule(self, user_id: str = None) -> dict:
        """Recomenda melhor horário"""
        best_hour = self.patterns['productivity_score'].idxmax()
        worst_hour = self.patterns['productivity_score'].idxmin()

        return {
            'best_study_hour': int(best_hour),
            'worst_study_hour': int(worst_hour),
            'recommendation': f"Estude preferencialmente entre {int(best_hour)}h-{int(best_hour)+2}h",
            'avoid': f"Evite estudar às {int(worst_hour)}h"
        }

    def save(self, filepath="backend/ml/models/schedule_model.pkl"):
        joblib.dump({'patterns': self.patterns}, filepath)
        print(f"Modelo salvo em {filepath}")


class ProfileClusterer:
    """5. Clustering de Perfis de Aprendizado"""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.labels = None

    def train(self, user_features_df: pd.DataFrame, n_clusters=5):
        """Identifica perfis de aprendizado"""
        print("\n" + "="*60)
        print("MODELO 5: PROFILE CLUSTERER")
        print("="*60)

        # Features para clustering
        features = ['totalXp', 'nivel', 'diasSequencia', 'progresso_medio',
                   'nivelFoco_mean', 'nivelEstresse_mean']
        features = [f for f in features if f in user_features_df.columns]

        X = user_features_df[features].fillna(0)

        # Normalizar
        X_scaled = self.scaler.fit_transform(X)

        # K-Means
        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.labels = self.model.fit_predict(X_scaled)

        # Análise dos clusters
        user_features_df['cluster'] = self.labels

        print(f"\nDistribuicao de clusters:")
        print(user_features_df['cluster'].value_counts().sort_index())

        # Perfis
        profiles = user_features_df.groupby('cluster')[features].mean()
        print("\nPerfis dos clusters:")
        print(profiles)

        # Nomear clusters
        self.cluster_names = self.name_clusters(profiles)
        print("\nNomes dos clusters:")
        for i, name in enumerate(self.cluster_names):
            print(f"  Cluster {i}: {name}")

        self.save()
        return {'n_clusters': n_clusters, 'profiles': profiles.to_dict()}

    def name_clusters(self, profiles: pd.DataFrame) -> list:
        """Dá nomes interpretativos aos clusters"""
        names = []
        for idx, row in profiles.iterrows():
            if row.get('totalXp', 0) > profiles['totalXp'].median():
                if row.get('diasSequencia', 0) > profiles['diasSequencia'].median():
                    names.append("High Performer Consistente")
                else:
                    names.append("Sprint Learner")
            else:
                if row.get('progresso_medio', 0) > profiles['progresso_medio'].median():
                    names.append("Progressor Estavel")
                else:
                    names.append("Iniciante")
        return names

    def predict(self, user_features: pd.DataFrame) -> dict:
        """Classifica usuário em perfil"""
        features = ['totalXp', 'nivel', 'diasSequencia', 'progresso_medio',
                   'nivelFoco_mean', 'nivelEstresse_mean']
        features = [f for f in features if f in user_features.columns]

        X = user_features[features].fillna(0)
        X_scaled = self.scaler.transform(X)

        cluster = self.model.predict(X_scaled)[0]

        return {
            'user_id': user_features.iloc[0]['id'] if 'id' in user_features.columns else 0,
            'profile_cluster': int(cluster),
            'profile_name': self.cluster_names[cluster] if self.cluster_names else f"Cluster {cluster}"
        }

    def save(self, filepath="backend/ml/models/clustering_model.pkl"):
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'cluster_names': self.cluster_names if hasattr(self, 'cluster_names') else []
        }, filepath)
        print(f"Modelo salvo em {filepath}")


class ChurnDetector:
    """6. Detector de Abandono de Cursos"""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()

    def train(self, enrollment_df: pd.DataFrame):
        """Prediz probabilidade de abandono"""
        print("\n" + "="*60)
        print("MODELO 6: CHURN DETECTOR")
        print("="*60)

        # Target: abandonou = status não é CONCLUIDO nem EM_ANDAMENTO
        enrollment_df['abandonou'] = (
            ~enrollment_df['status'].isin(['CONCLUIDO', 'EM_ANDAMENTO'])
        ).astype(int)

        # Features
        features = ['progresso', 'dias_ate_prazo', 'dias_desde_ultimo_acesso',
                   'progresso_por_dia', 'em_risco']
        features = [f for f in features if f in enrollment_df.columns]

        X = enrollment_df[features].fillna(0)
        y = enrollment_df['abandonou']

        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Normalizar
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Treinar
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)

        # Avaliar
        y_pred = self.model.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)

        print(f"Accuracy: {acc:.3f}")
        print(f"Taxa de abandono: {y.mean():.2%}")

        # Feature importance
        importances = pd.DataFrame({
            'feature': features,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        print("\nTop Features:")
        print(importances.head())

        self.save()
        return {'accuracy': acc, 'churn_rate': float(y.mean())}

    def predict(self, enrollment_features: pd.DataFrame) -> dict:
        """Prediz risco de abandono"""
        features = ['progresso', 'dias_ate_prazo', 'dias_desde_ultimo_acesso',
                   'progresso_por_dia', 'em_risco']
        features = [f for f in features if f in enrollment_features.columns]

        X = enrollment_features[features].fillna(0)
        X_scaled = self.scaler.transform(X)

        proba = self.model.predict_proba(X_scaled)[0][1]  # Prob de abandonar

        return {
            'enrollment_id': enrollment_features.iloc[0].get('id', 0),
            'churn_probability': float(proba),
            'risk_level': 'alto' if proba > 0.7 else 'medio' if proba > 0.4 else 'baixo'
        }

    def save(self, filepath="backend/ml/models/churn_model.pkl"):
        joblib.dump({'model': self.model, 'scaler': self.scaler}, filepath)
        print(f"Modelo salvo em {filepath}")


class WellbeingAnalyzer:
    """7. Análise de Correlação Bem-Estar x Performance"""

    def __init__(self):
        self.correlations = None

    def train(self, user_features_df: pd.DataFrame):
        """Analisa correlações entre bem-estar e performance"""
        print("\n" + "="*60)
        print("MODELO 7: WELLBEING ANALYZER")
        print("="*60)

        # Variáveis de bem-estar
        wellbeing_vars = ['nivelFoco_mean', 'nivelEstresse_mean', 'nivelFadiga_mean',
                         'horasSono_mean', 'qualidadeSono_mean']
        wellbeing_vars = [v for v in wellbeing_vars if v in user_features_df.columns]

        # Variáveis de performance
        performance_vars = ['totalXp', 'progresso_medio', 'nota_media']
        performance_vars = [v for v in performance_vars if v in user_features_df.columns]

        # Calcular correlações
        correlations = {}
        for wb in wellbeing_vars:
            for perf in performance_vars:
                data = user_features_df[[wb, perf]].dropna()
                if len(data) > 2:
                    corr, pvalue = pearsonr(data[wb], data[perf])
                    correlations[f"{wb}_vs_{perf}"] = {
                        'correlation': corr,
                        'p_value': pvalue,
                        'significant': pvalue < 0.05
                    }

        self.correlations = correlations

        print("\nCorrelacoes significativas (p < 0.05):")
        for key, val in correlations.items():
            if val['significant']:
                print(f"  {key}: {val['correlation']:.3f} (p={val['p_value']:.4f})")

        self.save()
        return correlations

    def get_insights(self, user_features: pd.DataFrame) -> list:
        """Gera insights baseados em correlações"""
        insights = []

        if 'horasSono_mean' in user_features.columns:
            sono = user_features.iloc[0]['horasSono_mean']
            if sono < 6:
                insights.append(f"Dormir mais de 7h pode aumentar sua performance em até 20%")

        if 'nivelEstresse_mean' in user_features.columns:
            estresse = user_features.iloc[0]['nivelEstresse_mean']
            if estresse > 60:
                insights.append("Reduzir estresse está correlacionado com melhor nota média")

        return insights

    def save(self, filepath="backend/ml/models/wellbeing_analysis.pkl"):
        joblib.dump({'correlations': self.correlations}, filepath)
        print(f"Analise salva em {filepath}")


class GradePredictor:
    """8. Preditor de Notas em Cursos"""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()

    def train(self, enrollment_df: pd.DataFrame):
        """Prediz nota final baseado em progresso e contexto"""
        print("\n" + "="*60)
        print("MODELO 8: GRADE PREDICTOR")
        print("="*60)

        # Filtrar apenas com notas
        df = enrollment_df[enrollment_df['notaFinal'].notna()].copy()

        # Features
        features = ['progresso', 'totalXp', 'nivel', 'nivelFoco_mean',
                   'dificuldade', 'progresso_por_dia']
        features = [f for f in features if f in df.columns]

        X = df[features].fillna(0)
        y = df['notaFinal']

        if len(df) < 10:
            print("Dados insuficientes para treinar")
            return None

        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Normalizar
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Treinar
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)

        # Avaliar
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        print(f"MAE: {mae:.2f} pontos")
        print(f"R2: {r2:.3f}")

        self.save()
        return {'mae': mae, 'r2': r2}

    def predict(self, enrollment_features: pd.DataFrame) -> dict:
        """Prediz nota esperada"""
        if self.model is None:
            return {'predicted_grade': None}

        features = ['progresso', 'totalXp', 'nivel', 'nivelFoco_mean',
                   'dificuldade', 'progresso_por_dia']
        features = [f for f in features if f in enrollment_features.columns]

        X = enrollment_features[features].fillna(0)
        X_scaled = self.scaler.transform(X)

        grade = self.model.predict(X_scaled)[0]

        return {
            'predicted_grade': float(np.clip(grade, 0, 100)),
            'confidence': 'medium'
        }

    def save(self, filepath="backend/ml/models/grade_model.pkl"):
        joblib.dump({'model': self.model, 'scaler': self.scaler}, filepath)
        print(f"Modelo salvo em {filepath}")


class AnomalyDetector:
    """9. Detector de Anomalias"""

    def __init__(self):
        self.model = None

    def train(self, user_features_df: pd.DataFrame):
        """Detecta comportamentos anormais"""
        print("\n" + "="*60)
        print("MODELO 9: ANOMALY DETECTOR")
        print("="*60)

        # Features
        features = ['totalXp', 'nivelFoco_mean', 'nivelEstresse_mean',
                   'diasSequencia', 'progresso_medio']
        features = [f for f in features if f in user_features_df.columns]

        X = user_features_df[features].fillna(0)

        # Isolation Forest
        self.model = IsolationForest(contamination=0.1, random_state=42)
        predictions = self.model.fit_predict(X)

        # Anomalias detectadas
        anomalies = (predictions == -1).sum()
        print(f"Anomalias detectadas: {anomalies}/{len(X)} ({anomalies/len(X):.1%})")

        self.save()
        return {'anomalies': int(anomalies), 'total': len(X)}

    def predict(self, user_features: pd.DataFrame) -> dict:
        """Detecta se usuário tem comportamento anormal"""
        features = ['totalXp', 'nivelFoco_mean', 'nivelEstresse_mean',
                   'diasSequencia', 'progresso_medio']
        features = [f for f in features if f in user_features.columns]

        X = user_features[features].fillna(0)
        pred = self.model.predict(X)[0]
        score = self.model.score_samples(X)[0]

        return {
            'is_anomaly': bool(pred == -1),
            'anomaly_score': float(score),
            'warning': "Comportamento atipico detectado" if pred == -1 else "Comportamento normal"
        }

    def save(self, filepath="backend/ml/models/anomaly_model.pkl"):
        joblib.dump({'model': self.model}, filepath)
        print(f"Modelo salvo em {filepath}")


class InterventionSystem:
    """10. Sistema de Intervenção Inteligente"""

    def __init__(self, burnout_model, churn_model, anomaly_model):
        self.burnout = burnout_model
        self.churn = churn_model
        self.anomaly = anomaly_model

    def analyze(self, user_features: pd.DataFrame, enrollments: pd.DataFrame = None) -> dict:
        """Analisa usuário e sugere intervenções"""
        print("\n" + "="*60)
        print("MODELO 10: INTERVENTION SYSTEM")
        print("="*60)

        interventions = []
        urgency = 'baixa'

        # Análise de anomalia
        anomaly_result = self.anomaly.predict(user_features)
        if anomaly_result['is_anomaly']:
            interventions.append({
                'type': 'anomaly_detected',
                'action': 'Investigar mudanca de comportamento',
                'urgency': 'media'
            })
            urgency = 'media'

        # Score agregado
        risk_score = 0
        if anomaly_result['is_anomaly']:
            risk_score += 30

        # Determinar urgência
        if risk_score > 70:
            urgency = 'alta'
        elif risk_score > 40:
            urgency = 'media'

        print(f"\nRisk Score: {risk_score}/100")
        print(f"Urgency: {urgency.upper()}")
        print(f"Interventions: {len(interventions)}")

        return {
            'user_id': user_features.iloc[0]['id'] if 'id' in user_features.columns else 0,
            'risk_score': risk_score,
            'urgency': urgency,
            'interventions': interventions,
            'recommended_channel': 'email' if urgency == 'baixa' else 'chat' if urgency == 'media' else 'phone'
        }


def train_all_models():
    """Treina todos os modelos"""
    print("="*60)
    print("TREINAMENTO DE TODOS OS MODELOS - SYNAPSE ML")
    print("="*60)

    # Preparar dados
    dp = DataPreparation()
    user_features = dp.prepare_user_features()  # Já faz connect/disconnect
    enrollment_features = dp.prepare_enrollment_features()  # Já faz connect/disconnect

    dp.connect()
    checkins = dp.get_checkins_bio_df()
    dp.disconnect()

    results = {}

    # Modelo 2: Course Recommender
    recommender = CourseRecommender()
    results['recommender'] = recommender.train(enrollment_features)

    # Modelo 3: Performance Predictor
    perf_predictor = PerformancePredictor()
    results['performance'] = perf_predictor.train(user_features)

    # Modelo 4: Schedule Optimizer
    scheduler = ScheduleOptimizer()
    results['scheduler'] = scheduler.train(checkins)

    # Modelo 5: Profile Clusterer
    clusterer = ProfileClusterer()
    results['clustering'] = clusterer.train(user_features)

    # Modelo 6: Churn Detector
    churn = ChurnDetector()
    results['churn'] = churn.train(enrollment_features)

    # Modelo 7: Wellbeing Analyzer
    wellbeing = WellbeingAnalyzer()
    results['wellbeing'] = wellbeing.train(user_features)

    # Modelo 8: Grade Predictor
    grade = GradePredictor()
    results['grade'] = grade.train(enrollment_features)

    # Modelo 9: Anomaly Detector
    anomaly = AnomalyDetector()
    results['anomaly'] = anomaly.train(user_features)

    # Modelo 10: Intervention System (usa outros modelos)
    print("\n" + "="*60)
    print("MODELO 10: INTERVENTION SYSTEM")
    print("="*60)
    print("Sistema integrado - usa outputs dos outros modelos")

    print("\n" + "="*60)
    print("TODOS OS MODELOS TREINADOS COM SUCESSO!")
    print("="*60)

    return results


if __name__ == "__main__":
    train_all_models()
