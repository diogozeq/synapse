import React from 'react';
import { Brain, Moon, Activity, Heart } from 'lucide-react';
import DashboardWidget from '../DashboardWidget';

interface CheckInData {
  nivelFoco: number;
  nivelEstresse: number;
  horasSono: number;
  qualidadeSono: number;
  dataHora: string;
}

interface BioCheckInWidgetProps {
  checkin: CheckInData | null;
}

export default function BioCheckInWidget({ checkin }: BioCheckInWidgetProps) {
  if (!checkin) {
    return (
      <DashboardWidget title="Bem-estar">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum check-in registrado</p>
        </div>
      </DashboardWidget>
    );
  }

  const getEmoji = () => {
    const avgScore = (checkin.nivelFoco + (100 - checkin.nivelEstresse) + (checkin.qualidadeSono * 10)) / 3;
    if (avgScore >= 75) return '😊';
    if (avgScore >= 50) return '😐';
    return '😟';
  };

  const getColor = (value: number, invert = false) => {
    const threshold = invert ? value : 100 - value;
    if (threshold < 30) return 'text-green-600 dark:text-green-400';
    if (threshold < 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBarColor = (value: number, invert = false) => {
    const threshold = invert ? value : 100 - value;
    if (threshold < 30) return 'bg-green-500';
    if (threshold < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardWidget
      title="Bem-estar"
      subtitle={`Último check-in: ${formatDate(checkin.dataHora)}`}
    >
      {/* Emoji de estado geral */}
      <div className="text-center mb-6">
        <span className="text-5xl">{getEmoji()}</span>
      </div>

      <div className="space-y-4">
        {/* Nível de Foco */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className={`w-4 h-4 ${getColor(checkin.nivelFoco)}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Foco
              </span>
            </div>
            <span className={`text-sm font-bold ${getColor(checkin.nivelFoco)}`}>
              {checkin.nivelFoco}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getBarColor(checkin.nivelFoco)}`}
              style={{ width: `${checkin.nivelFoco}%` }}
            />
          </div>
        </div>

        {/* Nível de Stress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${getColor(checkin.nivelEstresse, true)}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estresse
              </span>
            </div>
            <span className={`text-sm font-bold ${getColor(checkin.nivelEstresse, true)}`}>
              {checkin.nivelEstresse}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getBarColor(checkin.nivelEstresse, true)}`}
              style={{ width: `${checkin.nivelEstresse}%` }}
            />
          </div>
        </div>

        {/* Sono */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sono
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {checkin.horasSono}h
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Qualidade: {checkin.qualidadeSono}/10
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dica baseada nos dados */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          {checkin.nivelEstresse > 70
            ? '💡 Seu nível de estresse está alto. Que tal fazer uma pausa?'
            : checkin.nivelFoco < 50
            ? '💡 Foco baixo detectado. Considere estudar em outro horário.'
            : checkin.horasSono < 6
            ? '💡 Sono insuficiente pode afetar seu desempenho. Descanse mais!'
            : '💡 Ótimas condições para aprender! Continue assim!'}
        </p>
      </div>
    </DashboardWidget>
  );
}
