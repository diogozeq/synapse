import { Mail, Briefcase, Users, Award, Flame, TrendingUp, AlertCircle } from 'lucide-react';
import { CollaboratorWithStats } from '../../types';

interface CardsViewProps {
  data: CollaboratorWithStats[];
  onCardClick: (collab: CollaboratorWithStats) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function CardsView({
  data,
  onCardClick,
  selectedIds,
  onToggleSelect,
}: CardsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((collab) => {
        const isSelected = selectedIds.has(collab.id);
        const isLate = collab.coursesLate > 0;
        const isCritical = collab.coursesLate > 3;

        return (
          <div
            key={collab.id}
            className={`relative bg-white border-2 rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
              isSelected
                ? 'border-[#13ecc8] shadow-md'
                : isCritical
                ? 'border-red-200'
                : isLate
                ? 'border-yellow-200'
                : 'border-gray-200'
            }`}
            onClick={() => onCardClick(collab)}
          >
            {/* Checkbox */}
            <div className="absolute top-4 right-4 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(collab.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 text-[#13ecc8] border-gray-300 rounded focus:ring-[#13ecc8] cursor-pointer"
              />
            </div>

            {/* Header - Avatar & Name */}
            <div className="flex flex-col items-center mb-4 pt-2">
              <div className="relative">
                <img
                  src={collab.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(collab.name)}&background=13ecc8&color=10221f`}
                  alt={collab.name}
                  className="w-20 h-20 rounded-full border-4 border-[#13ecc8] shadow-md"
                />
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-[#13ecc8] to-[#0fbda0] text-[#10221f] font-bold flex items-center justify-center text-sm shadow-md">
                  {collab.level}
                </div>
              </div>

              <h3 className="mt-3 text-lg font-bold text-gray-900 text-center line-clamp-1">
                {collab.name}
              </h3>

              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{collab.email}</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-2.5 mb-4">
              {/* Role */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Cargo</p>
                  <p className="font-medium text-gray-900 truncate">{collab.role}</p>
                </div>
              </div>

              {/* Team */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-medium text-gray-900 truncate">{collab.team?.name || '-'}</p>
                  {collab.team?.areaName && (
                    <p className="text-xs text-gray-400 truncate">{collab.team.areaName}</p>
                  )}
                </div>
              </div>

              {/* XP */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">XP Total</p>
                  <p className="font-bold text-amber-600">{collab.totalXP.toLocaleString()}</p>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Flame className={`w-4 h-4 ${collab.streakDays > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Sequência</p>
                  <p className={`font-semibold ${collab.streakDays > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {collab.streakDays} {collab.streakDays === 1 ? 'dia' : 'dias'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Taxa de Conclusão</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {collab.completionRate.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    collab.completionRate >= 80 ? 'bg-green-500' :
                    collab.completionRate >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${collab.completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {collab.coursesCompleted} de {collab.coursesAssigned} cursos
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="pt-3 border-t border-gray-100">
              {collab.coursesLate === 0 ? (
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold">Em dia</span>
                </div>
              ) : isCritical ? (
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Crítico - {collab.coursesLate} atrasados</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">{collab.coursesLate} atrasado{collab.coursesLate > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-gray-500 text-sm">Nenhum colaborador encontrado</p>
        </div>
      )}
    </div>
  );
}
