import React, { useEffect, useState } from 'react';
import {
  Brain,
  Heart,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Info,
  Clock,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

interface BioAnalytics {
  hasData: boolean;
  lastCheckin: {
    nivelFoco: number;
    nivelEstresse: number;
    horasSono: number | null;
    qualidadeSono: number | null;
    dataHora: string;
  } | null;
  weeklyAvg: {
    foco: number;
    estresse: number;
    horasSono: number | null;
    qualidadeSono: number | null;
  } | null;
  trends: {
    foco: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
    estresse: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
  } | null;
  healthScore: number | null;
  alerts: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    value: number;
  }>;
  patterns: {
    bestDay: {
      day: string | null;
      avgFocus: number | null;
    };
    bestHour: {
      hour: number | null;
      avgFocus: number | null;
    };
  } | null;
  correlations: {
    completionRate: number;
    avgFocus: number;
    interpretation: string | null;
  } | null;
}

interface BioMetricsCardProps {
  userId: string;
}

export default function BioMetricsCard({ userId }: BioMetricsCardProps) {
  const [analytics, setAnalytics] = useState<BioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/bio-analytics`);
        if (!response.ok) {
          const text = await response.text();
          console.error('Bio analytics error:', text);
          throw new Error(`Failed to fetch analytics: ${response.status}`);
        }
        const data = await response.json();
        console.log('Bio analytics data:', data);
        setAnalytics(data);
      } catch (err) {
        console.error('Bio analytics fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !analytics || !analytics.hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analytics Biométrico
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    if (direction === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (direction === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
    return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700';
  };

  const getSeverityStyles = (severity: 'critical' | 'warning' | 'info') => {
    if (severity === 'critical')
      return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    if (severity === 'warning')
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Analytics Biométrico
      </h3>

      {/* Score de Saúde Mental */}
      {analytics.healthScore !== null && (
        <div className={`mb-6 p-4 rounded-lg border ${getHealthScoreBg(analytics.healthScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Score de Saúde Mental
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Baseado em foco, estresse e sono
              </p>
            </div>
            <div className={`text-4xl font-bold ${getHealthScoreColor(analytics.healthScore)}`}>
              {analytics.healthScore}
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {analytics.alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Alertas
          </h4>
          {analytics.alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg border text-xs ${getSeverityStyles(alert.severity)}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Médias Semanais */}
      {analytics.weeklyAvg && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Médias Semanais (últimos 7 dias)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Foco</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.weeklyAvg.foco}%
              </p>
              {analytics.trends && (
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.foco.direction)}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {analytics.trends.foco.percentage > 0 ? '+' : ''}
                    {analytics.trends.foco.percentage}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Estresse</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.weeklyAvg.estresse}%
              </p>
              {analytics.trends && (
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.trends.estresse.direction)}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {analytics.trends.estresse.percentage > 0 ? '+' : ''}
                    {analytics.trends.estresse.percentage}%
                  </span>
                </div>
              )}
            </div>

            {analytics.weeklyAvg.horasSono !== null && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sono</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {analytics.weeklyAvg.horasSono}h
                </p>
                {analytics.weeklyAvg.qualidadeSono !== null && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Qualidade: {analytics.weeklyAvg.qualidadeSono}/10
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Padrões de Comportamento */}
      {analytics.patterns && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Padrões de Produtividade
          </h4>
          <div className="space-y-2">
            {analytics.patterns.bestDay.day && (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Melhor dia</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {analytics.patterns.bestDay.day}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Foco: {analytics.patterns.bestDay.avgFocus}%
                  </p>
                </div>
              </div>
            )}

            {analytics.patterns.bestHour.hour !== null && (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Melhor horário</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {analytics.patterns.bestHour.hour}:00h
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Foco: {analytics.patterns.bestHour.avgFocus}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Correlações Performance x Bem-estar */}
      {analytics.correlations && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Performance x Bem-estar
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Taxa de Conclusão</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.correlations.completionRate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Foco Médio</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.correlations.avgFocus}%
              </p>
            </div>
          </div>
          {analytics.correlations.interpretation && (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                {analytics.correlations.interpretation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
