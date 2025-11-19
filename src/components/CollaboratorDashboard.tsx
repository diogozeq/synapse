import React, { useEffect, useState } from 'react';
import { Flame, Star, Award } from 'lucide-react';
import KPICard from './dashboard/KPICard';
import ActiveCoursesWidget from './dashboard/collaborator/ActiveCoursesWidget';
import RankingWidget from './dashboard/collaborator/RankingWidget';
import BioCheckInWidget from './dashboard/collaborator/BioCheckInWidget';
import XPEvolutionWidget from './dashboard/collaborator/XPEvolutionWidget';
import type { CollaboratorDashboardData } from '../types/dashboard';

interface CollaboratorDashboardProps {
  userId?: string;
}

export default function CollaboratorDashboard({ userId = 'col-0' }: CollaboratorDashboardProps) {
  const [data, setData] = useState<CollaboratorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/dashboard/collaborator/${userId}`);

        if (!response.ok) {
          throw new Error('Falha ao carregar dados do dashboard');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || 'Erro ao carregar dados do dashboard'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header com boas-vindas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Olá, {data.stats.nome.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Continue sua jornada de aprendizado
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Streak"
          value={`${data.stats.streak} ${data.stats.streak === 1 ? 'dia' : 'dias'}`}
          icon={<Flame className="w-5 h-5" />}
          color="red"
          subtitle="dias consecutivos"
        />

        <KPICard
          title="XP Total"
          value={data.stats.xp.toLocaleString()}
          icon={<Star className="w-5 h-5" />}
          color="yellow"
          subtitle={`Nível ${data.stats.nivel}`}
        />

        <KPICard
          title="Cursos em Andamento"
          value={data.stats.cursos.emAndamento}
          icon={<Award className="w-5 h-5" />}
          color="blue"
          subtitle={`${data.stats.cursos.progressoMedio}% de progresso médio`}
        />

        <KPICard
          title="Cursos Concluídos"
          value={data.stats.cursos.concluidos}
          icon={<Award className="w-5 h-5" />}
          color="green"
          subtitle={`de ${data.stats.cursos.total} total`}
        />
      </div>

      {/* Alerta de cursos atrasados */}
      {data.stats.cursos.atrasados > 0 && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-medium">
            ⚠️ Você tem {data.stats.cursos.atrasados} {data.stats.cursos.atrasados === 1 ? 'curso atrasado' : 'cursos atrasados'}.
            Continue estudando para colocá-los em dia!
          </p>
        </div>
      )}

      {/* Grid principal - 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Coluna esquerda - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evolução de XP */}
          <XPEvolutionWidget
            currentXp={data.stats.xp}
            nivel={data.stats.nivel}
            xpForNextLevel={data.stats.xpForNextLevel}
            xpProgressInLevel={data.stats.xpProgressInLevel}
            xpPercentageInLevel={data.stats.xpPercentageInLevel}
          />

          {/* Cursos Ativos */}
          <ActiveCoursesWidget courses={data.cursosAtivos} />
        </div>

        {/* Coluna direita - 1/3 */}
        <div className="space-y-6">
          {/* Ranking */}
          <RankingWidget ranking={data.ranking} currentXp={data.stats.xp} />

          {/* Bem-estar */}
          <BioCheckInWidget checkin={data.checkinBio} />
        </div>
      </div>

      {/* Cursos recomendados */}
      {data.cursosRecomendados.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cursos Recomendados para Você
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.cursosRecomendados.map((curso) => (
              <div
                key={curso.id}
                className="group cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {curso.thumbnailUrl && (
                  <img
                    src={curso.thumbnailUrl}
                    alt={curso.titulo}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {curso.categoria || 'Geral'}
                    </span>
                    {curso.tipoCurso === 'OBRIGATORIO' && (
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {curso.titulo}
                  </h4>
                  {curso.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {curso.descricao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
