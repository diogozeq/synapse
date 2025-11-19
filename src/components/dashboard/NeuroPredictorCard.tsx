import React from 'react';
import { Brain, Activity, BarChart3 } from 'lucide-react';
import type { ManagerDashboardData } from '../../types/dashboard';

interface Props {
  data?: ManagerDashboardData['neuroPredictor'];
}

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toFixed(1) : '--';

const gaugeColor = (value: number) => {
  if (value >= 75) return 'text-red-500';
  if (value >= 50) return 'text-yellow-500';
  return 'text-emerald-500';
};

const NeuroPredictorCard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const projection = data.orgProjection ?? { stress: 0, focus: 0 };
  const topTeams = (data.teamHeatmap ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-indigo-500 font-semibold">BioDigital Twin</p>
          <h3 className="text-2xl font-bold text-gray-900">NeuroPredictor</h3>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <Brain className="w-5 h-5 text-indigo-500" />
          <span>{data.datasetSize} amostras</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Stress projetado</p>
          <p className={`text-3xl font-semibold ${gaugeColor(projection.stress)}`}>
            {formatNumber(projection.stress)}%
          </p>
          <span className="text-xs text-gray-500">Confiança {data.confidence}%</span>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Foco projetado</p>
          <p className={`text-3xl font-semibold ${gaugeColor(100 - projection.stress)}`}>
            {formatNumber(projection.focus)}%
          </p>
          <span className="text-xs text-gray-500">Modelo híbrido (sklearn + MLP)</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Principais sinais
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(data.topSignals ?? []).map((signal) => (
            <div key={signal.label} className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm font-medium text-gray-900">{signal.label}</p>
              <p className="text-2xl font-semibold text-indigo-600">{signal.impact}%</p>
              <p className="text-xs text-gray-500">{signal.action}</p>
            </div>
          ))}
        </div>
      </div>

      {topTeams.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-500" />
            Equipes em destaque
          </p>
          <div className="space-y-2">
            {topTeams.map((team) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{team.teamName}</p>
                  <p className="text-xs text-gray-500">{team.recommendation}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${gaugeColor(team.stressRisk)}`}>
                    Stress {formatNumber(team.stressRisk)}%
                  </p>
                  <p className="text-xs text-gray-500">Foco {formatNumber(team.focusScore)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Último treinamento em {data.trainedAt ? new Date(data.trainedAt).toLocaleString() : 'aguardando dataset'}
      </p>
    </div>
  );
};

export default NeuroPredictorCard;
