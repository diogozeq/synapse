import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import DashboardWidget from '../DashboardWidget';

interface RankingData {
  posicao: number;
  total: number;
  top3: Array<{
    nome: string;
    avatarUrl?: string;
    totalXp: number;
    nivel: number;
    posicao: number;
  }>;
  xpDoLider: number;
  xpParaProximo: number;
}

interface RankingWidgetProps {
  ranking: RankingData | null;
  currentXp: number;
}

export default function RankingWidget({ ranking, currentXp }: RankingWidgetProps) {
  if (!ranking) {
    return (
      <DashboardWidget title="Meu Ranking">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Você não pertence a nenhuma equipe</p>
        </div>
      </DashboardWidget>
    );
  }

  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-500';
    if (position === 2) return 'text-gray-400';
    if (position === 3) return 'text-amber-700';
    return 'text-gray-400';
  };

  const getRankColor = (position: number) => {
    if (position <= 3) return 'text-green-600 dark:text-green-400';
    if (position <= ranking.total / 2) return 'text-blue-600 dark:text-blue-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <DashboardWidget
      title="Meu Ranking"
      subtitle={`${ranking.posicao}º de ${ranking.total} colaboradores`}
    >
      {/* Minha posição */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minha Posição</p>
            <p className={`text-3xl font-bold ${getRankColor(ranking.posicao)}`}>
              #{ranking.posicao}
            </p>
          </div>
          <Trophy className={`w-12 h-12 ${getMedalColor(ranking.posicao)}`} />
        </div>

        {ranking.posicao > 1 && ranking.xpParaProximo > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Faltam <span className="font-bold">{ranking.xpParaProximo} XP</span> para subir 1 posição
            </p>
          </div>
        )}
      </div>

      {/* Top 3 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Top 3 da Equipe
        </h4>
        <div className="space-y-2">
          {ranking.top3.map((user) => (
            <div
              key={user.posicao}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Position */}
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                user.posicao === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                user.posicao === 2 ? 'bg-gray-100 dark:bg-gray-700' :
                'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <span className={`text-sm font-bold ${getMedalColor(user.posicao)}`}>
                  {user.posicao}
                </span>
              </div>

              {/* Avatar */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nome}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.nome.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {user.nome}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nível {user.nivel}
                </p>
              </div>

              {/* XP */}
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {user.totalXp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardWidget>
  );
}
