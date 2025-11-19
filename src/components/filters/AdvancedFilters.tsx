import { useState } from 'react';
import Select from 'react-select';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { CollaboratorFilters, Team, Role, CollaboratorStatus } from '../../types';

interface AdvancedFiltersProps {
  filters: CollaboratorFilters;
  teams: Team[];
  roles: Role[];
  onFilterChange: <K extends keyof CollaboratorFilters>(
    key: K,
    value: CollaboratorFilters[K]
  ) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

const statusOptions: SelectOption[] = [
  { value: 'on-track', label: 'Em dia' },
  { value: 'late', label: 'Atrasados (1-3)' },
  { value: 'critical', label: 'Crítico (>3)' },
  { value: 'inactive', label: 'Sem atividade' },
];

const levelOptions: SelectOption[] = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Nível ${i + 1}`,
}));

export function AdvancedFilters({
  filters,
  teams,
  roles,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Transform teams and roles to select options
  const teamOptions: SelectOption[] = teams.map(team => ({
    value: team.id,
    label: team.name,
  }));

  const roleOptions: SelectOption[] = roles.map(role => ({
    value: role.id,
    label: role.name,
  }));

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#e5e7eb',
      borderRadius: '0.75rem',
      minHeight: '38px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#13ecc8',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#13ecc8',
      borderRadius: '0.5rem',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#10221f',
      fontWeight: '500',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: '#10221f',
      '&:hover': {
        backgroundColor: '#0fbda0',
        color: '#10221f',
      },
    }),
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">Filtros Avançados</h3>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#13ecc8] transition-colors"
        >
          {isExpanded ? (
            <>
              Recolher <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Expandir <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nome ou email..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#13ecc8] transition-colors text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <Select
            isMulti
            options={statusOptions}
            value={statusOptions.filter(opt => filters.status.includes(opt.value as CollaboratorStatus))}
            onChange={(selected) => onFilterChange('status', selected.map(s => s.value as CollaboratorStatus))}
            placeholder="Selecione status..."
            styles={selectStyles}
            className="text-sm"
          />
        </div>

        {/* Teams */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Times
          </label>
          <Select
            isMulti
            options={teamOptions}
            value={teamOptions.filter(opt => filters.teamIds.includes(opt.value))}
            onChange={(selected) => onFilterChange('teamIds', selected.map(s => s.value))}
            placeholder="Selecione times..."
            styles={selectStyles}
            className="text-sm"
          />
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Roles */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Cargos
              </label>
              <Select
                isMulti
                options={roleOptions}
                value={roleOptions.filter(opt => filters.roleIds.includes(opt.value))}
                onChange={(selected) => onFilterChange('roleIds', selected.map(s => s.value))}
                placeholder="Selecione cargos..."
                styles={selectStyles}
                className="text-sm"
              />
            </div>

            {/* Levels */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Níveis
              </label>
              <Select
                isMulti
                options={levelOptions}
                value={levelOptions.filter(opt => filters.levels.includes(Number(opt.value)))}
                onChange={(selected) => onFilterChange('levels', selected.map(s => Number(s.value)))}
                placeholder="Selecione níveis..."
                styles={selectStyles}
                className="text-sm"
              />
            </div>

            {/* Min Streak */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sequência Mínima (dias)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minStreak}
                onChange={(e) => onFilterChange('minStreak', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#13ecc8] transition-colors text-sm"
              />
            </div>
          </div>

          {/* Range Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* XP Range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                XP Total: {filters.xpRange[0].toLocaleString()} - {filters.xpRange[1].toLocaleString()}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={filters.xpRange[0]}
                  onChange={(e) => onFilterChange('xpRange', [Number(e.target.value), filters.xpRange[1]])}
                  className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={filters.xpRange[1]}
                  onChange={(e) => onFilterChange('xpRange', [filters.xpRange[0], Number(e.target.value)])}
                  className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Completion Rate Range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Taxa de Conclusão: {filters.completionRateRange[0]}% - {filters.completionRateRange[1]}%
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.completionRateRange[0]}
                  onChange={(e) => onFilterChange('completionRateRange', [Number(e.target.value), filters.completionRateRange[1]])}
                  className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs"
                  placeholder="Min %"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.completionRateRange[1]}
                  onChange={(e) => onFilterChange('completionRateRange', [filters.completionRateRange[0], Number(e.target.value)])}
                  className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs"
                  placeholder="Max %"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {Object.entries(filters).filter(([key, value]) => {
              if (key === 'search') return value !== '';
              if (key === 'status' || key === 'teamIds' || key === 'roleIds' || key === 'levels') {
                return (value as any[]).length > 0;
              }
              if (key === 'xpRange') return value[0] !== 0 || value[1] !== 100000;
              if (key === 'completionRateRange') return value[0] !== 0 || value[1] !== 100;
              if (key === 'minStreak') return value > 0;
              return false;
            }).length} filtro(s) ativo(s)
          </p>
        </div>
      )}
    </div>
  );
}
