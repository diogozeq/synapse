import React from 'react';
import type { ManagerDashboardData } from '../../types/dashboard';
import { Leaf, Users, Sparkles, Bot } from 'lucide-react';

interface Props {
  data?: ManagerDashboardData['socialImpact'];
}

const metricBox = (label: string, value: string, icon: React.ReactNode, accent: string) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-start gap-3">
    <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const SocialImpactPanel: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  const { esgRadar, inclusionPulse, talentEquity, botAssistants } = data;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 text-white p-6 shadow-lg">
        <p className="text-xs uppercase tracking-wide opacity-75">Radar ESG</p>
        <h3 className="text-2xl font-bold mb-4">Trabalho + humano + sustentável</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-3xl">{esgRadar.sustainablePace}%</p>
            <p>Ritmo sustentável</p>
          </div>
          <div>
            <p className="font-semibold text-3xl">{esgRadar.greenLearningHours}h</p>
            <p>Missões verdes estudadas</p>
          </div>
          <div>
            <p className="font-semibold text-3xl">{esgRadar.missionsCompleted}</p>
            <p>Missões ESG concluídas</p>
          </div>
          <div>
            <p className="font-semibold text-3xl">{esgRadar.carbonAlerts}</p>
            <p>Alertas para agir esta semana</p>
          </div>
        </div>
      </div>

      {metricBox(
        'Inclusion Pulse',
        `${inclusionPulse.belongingIndex}% pertencimento`,
        <Users className="w-5 h-5 text-emerald-600" />,
        'bg-emerald-50'
      )}
      <div className="grid grid-cols-2 gap-3">
        {metricBox(
          'Diversidade em papéis',
          `${inclusionPulse.diversityIndex}%`,
          <Sparkles className="w-5 h-5 text-pink-500" />,
          'bg-pink-50'
        )}
        {metricBox(
          'Bots Mentores ativos',
          `${botAssistants.coverage}% cobertura`,
          <Bot className="w-5 h-5 text-indigo-500" />,
          'bg-indigo-50'
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="font-semibold text-gray-900">Talent Equity Board</p>
            <p className="text-xs text-gray-500">IA acompanha oportunidades internas e viés</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{talentEquity.equityRatio}%</p>
            <p className="text-xs text-gray-500">Equidade</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{talentEquity.optionalTracks}</p>
            <p className="text-xs text-gray-500">Trilhas opcionais</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{talentEquity.fastTrackers}</p>
            <p className="text-xs text-gray-500">Fast-trackers</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Casos de uso dos bots: {botAssistants.signatureUseCases.join(' • ')}
        </p>
      </div>
    </div>
  );
};

export default SocialImpactPanel;
