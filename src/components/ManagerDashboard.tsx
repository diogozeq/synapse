import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, AlertTriangle, TrendingUp, Brain, Heart } from 'lucide-react';
import KPICard from './dashboard/KPICard';
import DashboardWidget from './dashboard/DashboardWidget';
import SimplePieChart from './dashboard/charts/SimplePieChart';
import SimpleBarChart from './dashboard/charts/SimpleBarChart';
import AlertCard from './dashboard/AlertCard';
import NeuroPredictorCard from './dashboard/NeuroPredictorCard';
import SocialImpactPanel from './dashboard/SocialImpactPanel';
import type { ManagerDashboardData } from '../types/dashboard';

export default function ManagerDashboard() {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/dashboard/manager');

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
  }, []);

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

  // Preparar dados para gráficos
  const pieData = [
    { name: 'Concluídos', value: data.distribuicaoStatus.CONCLUIDO, color: '#10b981' },
    { name: 'Em Andamento', value: data.distribuicaoStatus.EM_ANDAMENTO, color: '#3b82f6' },
    { name: 'Atrasados', value: data.distribuicaoStatus.ATRASADO, color: '#ef4444' },
    { name: 'Não Iniciados', value: data.distribuicaoStatus.NAO_INICIADO, color: '#6b7280' },
  ].filter(item => item.value > 0);

  const performanceData = [
    ...data.performance.top5.map(user => ({
      name: user.nome.split(' ')[0],
      XP: user.totalXp,
      type: 'top'
    })),
    ...data.performance.bottom5.reverse().map(user => ({
      name: user.nome.split(' ')[0],
      XP: user.totalXp,
      type: 'bottom'
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard do Gestor 📊
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral da equipe e performance
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total de Colaboradores"
          value={data.kpis.totalColaboradores}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />

        <KPICard
          title="Taxa de Conclusão"
          value={`${data.kpis.taxaConclusao}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          subtitle="de todos os cursos"
        />

        <KPICard
          title="Cursos Atrasados"
          value={data.kpis.cursosAtrasados}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={data.kpis.cursosAtrasados > 10 ? 'red' : 'yellow'}
        />

        <KPICard
          title="Progresso Médio"
          value={`${data.kpis.mediaProgresso}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          subtitle="cursos em andamento"
        />
      </div>

      {(data.neuroPredictor || data.socialImpact) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <NeuroPredictorCard data={data.neuroPredictor} />
          </div>
          <SocialImpactPanel data={data.socialImpact} />
        </div>
      )}

      {/* Alertas Críticos */}
      {(data.alertas.atrasados.length > 0 ||
        data.alertas.prazosProximos.length > 0 ||
        data.alertas.reprovados.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ⚠️ Alertas e Ações Necessárias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.alertas.atrasados.length > 0 && (
              <AlertCard
                type="error"
                title="Colaboradores Atrasados"
                description={`${data.alertas.atrasados.length} ${
                  data.alertas.atrasados.length === 1 ? 'pessoa tem' : 'pessoas têm'
                } cursos atrasados`}
                icon={<AlertTriangle className="w-5 h-5" />}
              />
            )}

            {data.alertas.prazosProximos.length > 0 && (
              <AlertCard
                type="warning"
                title="Prazos Próximos"
                description={`${data.alertas.prazosProximos.length} ${
                  data.alertas.prazosProximos.length === 1 ? 'curso vence' : 'cursos vencem'
                } em até 7 dias`}
                icon={<AlertTriangle className="w-5 h-5" />}
              />
            )}

            {data.alertas.reprovados.length > 0 && (
              <AlertCard
                type="error"
                title="Reprovações"
                description={`${data.alertas.reprovados.length} ${
                  data.alertas.reprovados.length === 1 ? 'reprovação' : 'reprovações'
                } em simulados`}
                icon={<AlertTriangle className="w-5 h-5" />}
              />
            )}
          </div>
        </div>
      )}

      {/* Grid de gráficos e informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição de Status */}
        <DashboardWidget title="Distribuição de Status" subtitle="Todos os cursos">
          {pieData.length > 0 ? (
            <SimplePieChart data={pieData} height={250} />
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
          )}
        </DashboardWidget>

        {/* Bem-estar da Equipe */}
        <DashboardWidget title="Bem-estar da Equipe" subtitle="Média dos últimos check-ins">
          <div className="space-y-6 py-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Foco Médio</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {data.bemEstar.focoMedio}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${data.bemEstar.focoMedio}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Estresse Médio</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {data.bemEstar.stressMedio}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${data.bemEstar.stressMedio}%` }}
                />
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Performance */}
      <div className="mb-8">
        <DashboardWidget
          title="Performance da Equipe"
          subtitle="Top 5 e Bottom 5 colaboradores por XP"
        >
          {performanceData.length > 0 ? (
            <SimpleBarChart
              data={performanceData}
              dataKey="XP"
              xAxisKey="name"
              color="#8b5cf6"
              height={300}
              layout="vertical"
            />
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
          )}
        </DashboardWidget>
      </div>

      {/* Comparativo de Equipes */}
      {data.equipes.length > 0 && (
        <div className="mb-8">
          <DashboardWidget title="Comparativo de Equipes">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Equipe
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Colaboradores
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Taxa Conclusão
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Atrasados
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      XP Médio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipes.map((equipe, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {equipe.nome}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        {equipe.totalColaboradores}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          equipe.taxaConclusao >= 80
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : equipe.taxaConclusao >= 50
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {equipe.taxaConclusao}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`${
                          equipe.cursosAtrasados > 0
                            ? 'text-red-600 dark:text-red-400 font-bold'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {equipe.cursosAtrasados}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        {equipe.xpMedio.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </div>
      )}

      {/* Timeline de Atividades */}
      {data.timeline.length > 0 && (
        <DashboardWidget title="Atividades Recentes" subtitle="Últimas 10 ações">
          <div className="space-y-3">
            {data.timeline.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.acao}
                  </p>
                  {item.detalhes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.detalhes}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.usuarioNome} • {new Date(item.dataHora).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
      )}
    </div>
  );
}
