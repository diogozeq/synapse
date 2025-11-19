"""
Burnout Risk Predictor
======================

Prediz o risco de burnout de colaboradores baseado em:
- Níveis de estresse, fadiga e foco
- Qualidade e quantidade de sono
- Carga de trabalho (cursos, prazos)
- Padrões temporais de bem-estar

Algoritmo: XGBoost Classifier
Output: Score de risco (0-100) + Classificação (Baixo/Médio/Alto/Crítico)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import warnings
warnings.filterwarnings('ignore')

import sys
sys.path.append('.')
from backend.ml.data_preparation import DataPreparation


class BurnoutPredictor:
    """Preditor de risco de burnout"""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.risk_thresholds = {
            'baixo': (0, 25),
            'medio': (25, 50),
            'alto': (50, 75),
            'critico': (75, 100)
        }

    def prepare_features(self, user_features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Prepara features para o modelo.

        Args:
            user_features_df: DataFrame com features de usuários

        Returns:
            DataFrame com features processadas
        """
        df = user_features_df.copy()

        # Selecionar features relevantes
        feature_cols = [
            # Bem-estar
            'nivelEstresse_mean', 'nivelEstresse_std', 'nivelEstresse_max',
            'nivelFadiga_mean', 'nivelFadiga_std', 'nivelFadiga_max',
            'nivelFoco_mean', 'nivelFoco_std', 'nivelFoco_min',
            'horasSono_mean', 'horasSono_std', 'horasSono_min',
            'qualidadeSono_mean', 'qualidadeSono_std', 'qualidadeSono_min',
            'variabilidade_foco', 'variabilidade_estresse',
            # Carga de trabalho
            'total_cursos', 'progresso_medio',
            # Engajamento
            'diasSequencia', 'totalXp', 'nivel',
        ]

        # Adicionar features de status se existirem
        status_cols = [col for col in df.columns if col.startswith('cursos_')]
        feature_cols.extend(status_cols)

        # Filtrar colunas que existem
        feature_cols = [col for col in feature_cols if col in df.columns]

        X = df[feature_cols].copy()

        # Preencher NaN
        X = X.fillna(0)

        self.feature_names = feature_cols

        return X

    def create_target_variable(self, user_features_df: pd.DataFrame) -> pd.Series:
        """
        Cria variável target baseada em heurísticas de risco.

        Considera:
        - Estresse alto + fadiga alta = risco alto
        - Sono ruim + estresse = risco alto
        - Muitos cursos atrasados = risco médio
        - Variabilidade alta = instabilidade = risco

        Args:
            user_features_df: DataFrame com features

        Returns:
            Série com risco calculado (0-100)
        """
        df = user_features_df.copy()

        # Inicializa score base
        risk_score = np.zeros(len(df))

        # Componente 1: Estresse (peso 30%)
        if 'nivelEstresse_mean' in df.columns:
            risk_score += (df['nivelEstresse_mean'] / 100) * 30

        # Componente 2: Fadiga (peso 25%)
        if 'nivelFadiga_mean' in df.columns:
            risk_score += (df['nivelFadiga_mean'] / 100) * 25

        # Componente 3: Sono ruim (peso 20%)
        if 'horasSono_mean' in df.columns:
            # Menos de 6h ou mais de 9h é ruim
            sono_score = np.where(df['horasSono_mean'] < 6,
                                 (6 - df['horasSono_mean']) / 6 * 100,
                                 0)
            risk_score += (sono_score / 100) * 20

        # Componente 4: Foco baixo (peso 15%)
        if 'nivelFoco_mean' in df.columns:
            foco_invertido = 100 - df['nivelFoco_mean']
            risk_score += (foco_invertido / 100) * 15

        # Componente 5: Cursos atrasados (peso 10%)
        if 'cursos_atrasado' in df.columns:
            atrasados_norm = np.clip(df['cursos_atrasado'] / 5 * 100, 0, 100)
            risk_score += (atrasados_norm / 100) * 10

        # Adicionar variabilidade (instabilidade é sinal de risco)
        if 'variabilidade_estresse' in df.columns:
            risk_score += df['variabilidade_estresse'] * 5

        # Limitar entre 0-100
        risk_score = np.clip(risk_score, 0, 100)

        return pd.Series(risk_score, index=df.index)

    def classify_risk(self, risk_score: float) -> str:
        """
        Classifica score em categoria.

        Args:
            risk_score: Score de risco (0-100)

        Returns:
            Categoria: 'baixo', 'medio', 'alto', 'critico'
        """
        if risk_score < 25:
            return 'baixo'
        elif risk_score < 50:
            return 'medio'
        elif risk_score < 75:
            return 'alto'
        else:
            return 'critico'

    def train(self, user_features_df: pd.DataFrame):
        """
        Treina o modelo.

        Args:
            user_features_df: DataFrame com features de usuários
        """
        print("Treinando Burnout Predictor...")

        # Preparar features
        X = self.prepare_features(user_features_df)
        y = self.create_target_variable(user_features_df)

        # Criar classes para classificação
        y_class = y.apply(self.classify_risk)
        y_class_encoded = y_class.map({'baixo': 0, 'medio': 1, 'alto': 2, 'critico': 3})

        # Verificar distribuição
        print(f"\nDistribuicao de risk scores:")
        print(f"  Min: {y.min():.2f}")
        print(f"  Max: {y.max():.2f}")
        print(f"  Mean: {y.mean():.2f}")
        print(f"  Std: {y.std():.2f}")

        class_counts = y_class.value_counts()
        print(f"\nDistribuicao de classes:")
        for name in ['baixo', 'medio', 'alto', 'critico']:
            count = class_counts.get(name, 0)
            print(f"  {name.capitalize()}: {count}")

        # Split - usando score contínuo (regressão)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Normalizar
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Treinar XGBoost Regressor (melhor para dados contínuos)
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            eval_metric='rmse'
        )

        self.model.fit(X_train_scaled, y_train)

        # Avaliar
        y_pred = self.model.predict(X_test_scaled)
        y_pred = np.clip(y_pred, 0, 100)  # Garantir range

        # Métricas de regressão
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        print("\nRegression Metrics:")
        print(f"  MAE: {mae:.2f}")
        print(f"  RMSE: {rmse:.2f}")
        print(f"  R2 Score: {r2:.3f}")

        # Avaliar como classificação também
        y_test_class = y_test.apply(self.classify_risk)
        y_pred_class = pd.Series(y_pred).apply(self.classify_risk)

        print("\nClassification Accuracy:")
        from sklearn.metrics import accuracy_score
        acc = accuracy_score(y_test_class, y_pred_class)
        print(f"  Accuracy: {acc:.3f}")

        # Feature importance
        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        print("\nTop 10 Features Importantes:")
        print(importance_df.head(10))

        # Retornar métricas
        return {
            'accuracy': self.model.score(X_test_scaled, y_test),
            'feature_importance': importance_df.to_dict('records')
        }

    def predict(self, user_features: pd.DataFrame) -> dict:
        """
        Prediz risco de burnout para usuário(s).

        Args:
            user_features: DataFrame com features do usuário

        Returns:
            Dicionário com predições
        """
        if self.model is None:
            raise ValueError("Modelo não treinado. Execute train() primeiro.")

        X = self.prepare_features(user_features)
        X_scaled = self.scaler.transform(X)

        # Predição (regressão - score contínuo)
        risk_scores = self.model.predict(X_scaled)
        risk_scores = np.clip(risk_scores, 0, 100)  # Garantir 0-100

        # Classificar
        risk_labels = [self.classify_risk(score) for score in risk_scores]

        # Calcular "probabilidades" baseado na proximidade dos thresholds
        results = []
        for i in range(len(user_features)):
            score = risk_scores[i]

            # Probabilidades sintéticas (suaves em torno do score)
            probas = {
                'baixo': max(0, min(1, (25 - score) / 25)) if score < 25 else 0,
                'medio': max(0, min(1, 1 - abs(score - 37.5) / 25)) if 10 < score < 65 else 0,
                'alto': max(0, min(1, 1 - abs(score - 62.5) / 25)) if 40 < score < 85 else 0,
                'critico': max(0, min(1, (score - 75) / 25)) if score > 75 else 0,
            }

            # Normalizar
            total = sum(probas.values()) or 1
            probas = {k: v/total for k, v in probas.items()}

            results.append({
                'user_id': user_features.iloc[i]['id'] if 'id' in user_features.columns else i,
                'risk_score': float(score),
                'risk_level': risk_labels[i],
                'probabilities': probas,
                'recommendations': self.generate_recommendations(
                    risk_labels[i],
                    user_features.iloc[i]
                )
            })

        return results[0] if len(results) == 1 else results

    def generate_recommendations(self, risk_level: str, user_data: pd.Series) -> list:
        """
        Gera recomendações personalizadas baseadas no risco.

        Args:
            risk_level: Nível de risco
            user_data: Dados do usuário

        Returns:
            Lista de recomendações
        """
        recommendations = []

        if risk_level in ['alto', 'critico']:
            recommendations.append("Procure conversar com seu gestor sobre sua carga de trabalho")
            recommendations.append("Considere tirar alguns dias de descanso")

            if 'nivelEstresse_mean' in user_data and user_data['nivelEstresse_mean'] > 70:
                recommendations.append("Seus níveis de estresse estão elevados. Pratique técnicas de relaxamento")

            if 'horasSono_mean' in user_data and user_data['horasSono_mean'] < 6:
                recommendations.append("Você está dormindo pouco. Tente dormir pelo menos 7-8 horas")

        elif risk_level == 'medio':
            recommendations.append("Monitore seus níveis de estresse regularmente")
            recommendations.append("Mantenha uma rotina de exercícios")

            if 'cursos_atrasado' in user_data and user_data['cursos_atrasado'] > 0:
                recommendations.append(f"Você tem {int(user_data['cursos_atrasado'])} curso(s) atrasado(s). Reorganize suas prioridades")

        else:  # baixo
            recommendations.append("Continue mantendo seu equilíbrio trabalho-vida!")
            recommendations.append("Compartilhe suas práticas de bem-estar com a equipe")

        return recommendations

    def save(self, filepath: str = "backend/ml/models/burnout_model.pkl"):
        """Salva o modelo treinado"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names
        }, filepath)
        print(f"Modelo salvo em {filepath}")

    def load(self, filepath: str = "backend/ml/models/burnout_model.pkl"):
        """Carrega modelo treinado"""
        data = joblib.load(filepath)
        self.model = data['model']
        self.scaler = data['scaler']
        self.feature_names = data['feature_names']
        print(f"Modelo carregado de {filepath}")


def main():
    """Treina e testa o modelo"""
    print("="*60)
    print("BURNOUT RISK PREDICTOR - Treinamento")
    print("="*60)

    # Preparar dados
    dp = DataPreparation()
    user_features = dp.prepare_user_features()

    print(f"\nTotal de usuarios: {len(user_features)}")
    print(f"Features disponiveis: {user_features.shape[1]}")

    # Treinar
    predictor = BurnoutPredictor()
    metrics = predictor.train(user_features)

    print(f"\nAccuracy: {metrics['accuracy']:.3f}")

    # Salvar
    predictor.save()

    # Testar predição para alguns usuários
    print("\n" + "="*60)
    print("TESTE DE PREDICOES")
    print("="*60)

    sample_users = user_features.head(5)
    predictions = predictor.predict(sample_users)

    for pred in predictions:
        print(f"\nUsuario: {pred['user_id']}")
        print(f"  Risk Score: {pred['risk_score']:.1f}/100")
        print(f"  Risk Level: {pred['risk_level'].upper()}")
        print(f"  Probabilidades:")
        for level, prob in pred['probabilities'].items():
            print(f"    {level}: {prob*100:.1f}%")
        print(f"  Recomendacoes:")
        for rec in pred['recommendations']:
            print(f"    - {rec}")

    print("\n" + "="*60)
    print("Modelo treinado com sucesso!")
    print("="*60)


if __name__ == "__main__":
    main()
