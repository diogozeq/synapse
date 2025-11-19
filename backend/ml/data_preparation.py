"""
Data Preparation Module
========================

ETL e Feature Engineering para todos os modelos de ML.
Extrai dados do SQLite e prepara features prontas para uso.
"""

import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Tuple, List
import warnings
warnings.filterwarnings('ignore')


class DataPreparation:
    """Classe para preparação de dados do banco SQLite"""

    def __init__(self, db_path: str = "data/databases/real.db"):
        """
        Inicializa conexão com banco de dados.

        Args:
            db_path: Caminho para o banco SQLite
        """
        self.db_path = db_path
        self.conn = None

    def connect(self):
        """Estabelece conexão com o banco"""
        self.conn = sqlite3.connect(self.db_path)

    def disconnect(self):
        """Fecha conexão com o banco"""
        if self.conn:
            self.conn.close()

    def get_usuarios_df(self) -> pd.DataFrame:
        """Retorna DataFrame de usuários"""
        query = "SELECT * FROM usuarios"
        return pd.read_sql_query(query, self.conn)

    def get_equipes_df(self) -> pd.DataFrame:
        """Retorna DataFrame de equipes"""
        query = "SELECT * FROM equipes"
        return pd.read_sql_query(query, self.conn)

    def get_matriculas_df(self) -> pd.DataFrame:
        """Retorna DataFrame de matrículas"""
        query = "SELECT * FROM matriculas"
        df = pd.read_sql_query(query, self.conn)
        # Converter datas
        for col in ['atribuidoEm', 'prazo', 'ultimoAcesso']:
            df[col] = pd.to_datetime(df[col])
        return df

    def get_checkins_bio_df(self) -> pd.DataFrame:
        """Retorna DataFrame de check-ins biométricos"""
        query = "SELECT * FROM checkins_bio"
        df = pd.read_sql_query(query, self.conn)
        df['dataHora'] = pd.to_datetime(df['dataHora'])
        return df

    def get_materiais_fonte_df(self) -> pd.DataFrame:
        """Retorna DataFrame de materiais/cursos"""
        query = "SELECT * FROM materiais_fonte"
        return pd.read_sql_query(query, self.conn)

    def get_cargos_df(self) -> pd.DataFrame:
        """Retorna DataFrame de cargos"""
        query = "SELECT * FROM cargos"
        return pd.read_sql_query(query, self.conn)

    def prepare_user_features(self) -> pd.DataFrame:
        """
        Prepara features completas por usuário.

        Returns:
            DataFrame com features agregadas por usuário
        """
        self.connect()

        # Dados base
        usuarios = self.get_usuarios_df()
        matriculas = self.get_matriculas_df()
        checkins = self.get_checkins_bio_df()

        # Features de usuário
        user_features = usuarios[[
            'id', 'papel', 'idEquipe', 'idCargo', 'cargo',
            'totalXp', 'nivel', 'diasSequencia'
        ]].copy()

        # Features de matrículas
        matriculas_agg = matriculas.groupby('idUsuario').agg({
            'id': 'count',  # total de cursos
            'progresso': 'mean',  # progresso médio
            'notaFinal': 'mean',  # nota média
        }).rename(columns={
            'id': 'total_cursos',
            'progresso': 'progresso_medio',
            'notaFinal': 'nota_media'
        })

        # Status de matrículas
        status_counts = pd.crosstab(matriculas['idUsuario'], matriculas['status'])
        status_counts.columns = ['cursos_' + col.lower() for col in status_counts.columns]

        # Taxa de conclusão
        if 'cursos_concluido' in status_counts.columns:
            status_counts['taxa_conclusao'] = (
                status_counts['cursos_concluido'] / status_counts.sum(axis=1) * 100
            )

        # Features de check-ins biométricos
        if len(checkins) > 0:
            checkins_agg = checkins.groupby('idUsuario').agg({
                'nivelFoco': ['mean', 'std', 'min', 'max'],
                'nivelEstresse': ['mean', 'std', 'min', 'max'],
                'nivelFadiga': ['mean', 'std', 'min', 'max'],
                'horasSono': ['mean', 'std', 'min', 'max'],
                'qualidadeSono': ['mean', 'std', 'min', 'max'],
            })

            # Flatten column names
            checkins_agg.columns = ['_'.join(col).strip() for col in checkins_agg.columns.values]

            # Variabilidade (importante para detectar instabilidade)
            checkins_agg['variabilidade_foco'] = checkins_agg['nivelFoco_std'] / (checkins_agg['nivelFoco_mean'] + 1)
            checkins_agg['variabilidade_estresse'] = checkins_agg['nivelEstresse_std'] / (checkins_agg['nivelEstresse_mean'] + 1)
        else:
            checkins_agg = pd.DataFrame()

        # Merge tudo
        user_features = user_features.set_index('id')
        user_features = user_features.join(matriculas_agg, how='left')
        user_features = user_features.join(status_counts, how='left')

        if len(checkins_agg) > 0:
            user_features = user_features.join(checkins_agg, how='left')

        # Preencher NaN
        user_features = user_features.fillna(0)

        self.disconnect()

        return user_features.reset_index().rename(columns={'index': 'id'})

    def prepare_wellbeing_timeseries(self, user_id: str = None) -> pd.DataFrame:
        """
        Prepara séries temporais de bem-estar.

        Args:
            user_id: ID do usuário (None para todos)

        Returns:
            DataFrame com séries temporais
        """
        self.connect()

        if user_id:
            query = f"SELECT * FROM checkins_bio WHERE idUsuario = '{user_id}' ORDER BY dataHora"
        else:
            query = "SELECT * FROM checkins_bio ORDER BY idUsuario, dataHora"

        df = pd.read_sql_query(query, self.conn)
        df['dataHora'] = pd.to_datetime(df['dataHora'])

        self.disconnect()

        return df

    def prepare_course_features(self) -> pd.DataFrame:
        """
        Prepara features de cursos.

        Returns:
            DataFrame com estatísticas por curso
        """
        self.connect()

        materiais = self.get_materiais_fonte_df()
        matriculas = self.get_matriculas_df()

        # Estatísticas por curso
        course_stats = matriculas.groupby('idCurso').agg({
            'id': 'count',
            'progresso': 'mean',
            'notaFinal': ['mean', 'std'],
            'status': lambda x: (x == 'CONCLUIDO').sum()
        })

        course_stats.columns = ['total_matriculas', 'progresso_medio', 'nota_media', 'nota_std', 'total_concluidos']
        course_stats['taxa_conclusao'] = (course_stats['total_concluidos'] / course_stats['total_matriculas'] * 100)
        course_stats['dificuldade'] = 100 - course_stats['taxa_conclusao']  # Proxy de dificuldade

        # Merge com dados do curso
        course_features = materiais.set_index('id').join(course_stats, how='left')

        self.disconnect()

        return course_features.reset_index()

    def prepare_enrollment_features(self) -> pd.DataFrame:
        """
        Prepara features de matrículas (user + course).

        Returns:
            DataFrame com features combinadas
        """
        self.connect()

        matriculas = self.get_matriculas_df()
        user_features = self.prepare_user_features()
        course_features = self.prepare_course_features()

        # Merge
        enrollment_features = matriculas.copy()
        enrollment_features = enrollment_features.merge(
            user_features,
            left_on='idUsuario',
            right_on='id',
            how='left',
            suffixes=('', '_user')
        )
        enrollment_features = enrollment_features.merge(
            course_features[['id', 'titulo', 'categoria', 'dificuldade', 'progresso_medio', 'taxa_conclusao']],
            left_on='idCurso',
            right_on='id',
            how='left',
            suffixes=('', '_course')
        )

        # Features derivadas
        enrollment_features['dias_ate_prazo'] = (
            enrollment_features['prazo'] - datetime.now()
        ).dt.days

        enrollment_features['dias_desde_ultimo_acesso'] = (
            datetime.now() - enrollment_features['ultimoAcesso']
        ).dt.days

        enrollment_features['dias_matriculado'] = (
            datetime.now() - enrollment_features['atribuidoEm']
        ).dt.days

        enrollment_features['progresso_por_dia'] = (
            enrollment_features['progresso'] / (enrollment_features['dias_matriculado'] + 1)
        )

        enrollment_features['esta_atrasado'] = (
            (enrollment_features['dias_ate_prazo'] < 0) &
            (enrollment_features['progresso'] < 100)
        ).astype(int)

        enrollment_features['em_risco'] = (
            (enrollment_features['dias_ate_prazo'] < 7) &
            (enrollment_features['progresso'] < 70)
        ).astype(int)

        self.disconnect()

        return enrollment_features

    def prepare_team_features(self) -> pd.DataFrame:
        """
        Prepara features agregadas por equipe.

        Returns:
            DataFrame com estatísticas por equipe
        """
        self.connect()

        usuarios = self.get_usuarios_df()
        equipes = self.get_equipes_df()
        checkins = self.get_checkins_bio_df()
        matriculas = self.get_matriculas_df()

        # Merge usuários com equipes
        usuarios_equipes = usuarios.merge(equipes, left_on='idEquipe', right_on='id', suffixes=('', '_equipe'))

        # Agregações por equipe
        team_stats = usuarios_equipes.groupby('idEquipe').agg({
            'id': 'count',
            'totalXp': ['mean', 'std', 'min', 'max'],
            'nivel': ['mean', 'std'],
            'diasSequencia': ['mean', 'std'],
        })

        team_stats.columns = ['_'.join(col).strip() if col[1] else col[0] for col in team_stats.columns.values]
        team_stats = team_stats.rename(columns={'id': 'total_colaboradores'})

        # Check-ins por equipe
        checkins_team = checkins.merge(usuarios[['id', 'idEquipe']], left_on='idUsuario', right_on='id')
        checkins_agg = checkins_team.groupby('idEquipe').agg({
            'nivelFoco': 'mean',
            'nivelEstresse': 'mean',
            'nivelFadiga': 'mean',
            'horasSono': 'mean',
            'qualidadeSono': 'mean',
        })
        checkins_agg.columns = ['team_' + col for col in checkins_agg.columns]

        # Matrículas por equipe
        matriculas_team = matriculas.merge(usuarios[['id', 'idEquipe']], left_on='idUsuario', right_on='id')
        matriculas_agg = matriculas_team.groupby('idEquipe').agg({
            'progresso': 'mean',
            'notaFinal': 'mean',
        })
        matriculas_agg.columns = ['team_' + col for col in matriculas_agg.columns]

        # Merge tudo
        team_features = equipes.set_index('id')
        team_features = team_features.join(team_stats, how='left')
        team_features = team_features.join(checkins_agg, how='left')
        team_features = team_features.join(matriculas_agg, how='left')

        self.disconnect()

        return team_features.reset_index()

    def get_user_course_history(self, user_id: str) -> Dict:
        """
        Retorna histórico completo de um usuário.

        Args:
            user_id: ID do usuário

        Returns:
            Dicionário com histórico completo
        """
        self.connect()

        # Dados do usuário
        user = self.get_usuarios_df()
        user = user[user['id'] == user_id].iloc[0].to_dict() if len(user[user['id'] == user_id]) > 0 else {}

        # Matrículas
        matriculas = self.get_matriculas_df()
        user_enrollments = matriculas[matriculas['idUsuario'] == user_id]

        # Check-ins
        checkins = self.get_checkins_bio_df()
        user_checkins = checkins[checkins['idUsuario'] == user_id]

        self.disconnect()

        return {
            'user': user,
            'enrollments': user_enrollments.to_dict('records'),
            'checkins': user_checkins.to_dict('records'),
            'total_courses': len(user_enrollments),
            'completed_courses': len(user_enrollments[user_enrollments['status'] == 'CONCLUIDO']),
            'avg_progress': user_enrollments['progresso'].mean(),
            'avg_grade': user_enrollments['notaFinal'].mean(),
        }

    def get_hourly_patterns(self, user_id: str = None) -> pd.DataFrame:
        """
        Analisa padrões por hora do dia.

        Args:
            user_id: ID do usuário (None para geral)

        Returns:
            DataFrame com padrões por hora
        """
        self.connect()

        if user_id:
            checkins = pd.read_sql_query(
                f"SELECT * FROM checkins_bio WHERE idUsuario = '{user_id}'",
                self.conn
            )
        else:
            checkins = self.get_checkins_bio_df()

        hourly = checkins.groupby('horaDoDia').agg({
            'nivelFoco': ['mean', 'std'],
            'nivelEstresse': ['mean', 'std'],
            'nivelFadiga': ['mean', 'std'],
        })

        hourly.columns = ['_'.join(col).strip() for col in hourly.columns.values]

        self.disconnect()

        return hourly.reset_index()

    def get_weekly_patterns(self, user_id: str = None) -> pd.DataFrame:
        """
        Analisa padrões por dia da semana.

        Args:
            user_id: ID do usuário (None para geral)

        Returns:
            DataFrame com padrões semanais
        """
        self.connect()

        if user_id:
            checkins = pd.read_sql_query(
                f"SELECT * FROM checkins_bio WHERE idUsuario = '{user_id}'",
                self.conn
            )
        else:
            checkins = self.get_checkins_bio_df()

        weekly = checkins.groupby('diaDaSemana').agg({
            'nivelFoco': ['mean', 'std'],
            'nivelEstresse': ['mean', 'std'],
            'nivelFadiga': ['mean', 'std'],
            'horasSono': ['mean', 'std'],
        })

        weekly.columns = ['_'.join(col).strip() for col in weekly.columns.values]

        # Map dia da semana para nome
        day_names = {0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
                     4: 'Quinta', 5: 'Sexta', 6: 'Sábado'}
        weekly = weekly.reset_index()
        weekly['dia_nome'] = weekly['diaDaSemana'].map(day_names)

        self.disconnect()

        return weekly


# Funções de utilidade
def encode_categorical_features(df: pd.DataFrame, columns: List[str]) -> Tuple[pd.DataFrame, Dict]:
    """
    Codifica features categóricas usando Label Encoding.

    Args:
        df: DataFrame
        columns: Colunas para codificar

    Returns:
        DataFrame codificado e dicionário de mapeamentos
    """
    from sklearn.preprocessing import LabelEncoder

    encoders = {}
    df_encoded = df.copy()

    for col in columns:
        if col in df.columns:
            le = LabelEncoder()
            df_encoded[col + '_encoded'] = le.fit_transform(df[col].astype(str))
            encoders[col] = le

    return df_encoded, encoders


def normalize_features(df: pd.DataFrame, columns: List[str]) -> Tuple[pd.DataFrame, object]:
    """
    Normaliza features numéricas usando StandardScaler.

    Args:
        df: DataFrame
        columns: Colunas para normalizar

    Returns:
        DataFrame normalizado e scaler fitted
    """
    from sklearn.preprocessing import StandardScaler

    scaler = StandardScaler()
    df_normalized = df.copy()

    valid_columns = [col for col in columns if col in df.columns]
    if valid_columns:
        df_normalized[valid_columns] = scaler.fit_transform(df[valid_columns])

    return df_normalized, scaler


if __name__ == "__main__":
    # Teste rápido
    print("Testando Data Preparation Module...")

    dp = DataPreparation()

    print("\nUser Features:")
    user_features = dp.prepare_user_features()
    print(user_features.head())
    print(f"Shape: {user_features.shape}")

    print("\nCourse Features:")
    course_features = dp.prepare_course_features()
    print(course_features.head())
    print(f"Shape: {course_features.shape}")

    print("\nData Preparation Module OK!")
