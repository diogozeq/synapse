import React from 'react';
import { TrendingUp } from 'lucide-react';
import DashboardWidget from '../DashboardWidget';
import SimpleLineChart from '../charts/SimpleLineChart';
import ProgressRing from '../charts/ProgressRing';

interface XPEvolutionWidgetProps {
  currentXp: number;
  nivel: number;
  xpForNextLevel: number;
  xpProgressInLevel: number;
  xpPercentageInLevel: number;
}

export default function XPEvolutionWidget({
  currentXp,
  nivel,
  xpForNextLevel,
  xpProgressInLevel,
  xpPercentageInLevel
}: XPEvolutionWidgetProps) {
  // Simular evolução de XP (últimos 30 dias)
  // Como não temos histórico real, vamos criar uma curva de crescimento estimada
  const generateXPHistory = () => {
    const data = [];
    const days = 30;
    const xpPerDay = currentXp / days; // Crescimento linear estimado

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const estimatedXp = Math.max(0, currentXp - (xpPerDay * i));

      data.push({
        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        XP: Math.round(estimatedXp)
      });
    }

    return data;
  };

  const xpHistory = generateXPHistory();

  return (
    <DashboardWidget title="Evolução de XP" subtitle="Últimos 30 dias">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de linha */}
        <div>
          <SimpleLineChart
            data={xpHistory}
            lines={[
              { dataKey: 'XP', color: '#3b82f6', label: 'XP Total' }
            ]}
            height={200}
          />
        </div>

        {/* Progresso para próximo nível */}
        <div className="flex flex-col items-center justify-center">
          <ProgressRing
            progress={xpPercentageInLevel}
            size={140}
            color="#8b5cf6"
            showPercentage={false}
          />

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Progresso para Nível {nivel + 1}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {xpPercentageInLevel}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {xpProgressInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
            </p>
          </div>

          {/* Stats extras */}
          <div className="mt-4 w-full grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Nível Atual</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{nivel}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">XP Total</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentXp.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivação */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <p className="text-sm text-purple-800 dark:text-purple-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>
            Faltam apenas <strong>{xpForNextLevel - xpProgressInLevel} XP</strong> para alcançar o nível {nivel + 1}!
          </span>
        </p>
      </div>
    </DashboardWidget>
  );
}
