import { ArrowUpDown, ArrowUp, ArrowDown, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CollaboratorWithStats, SortConfig, SortField } from '../../types';

interface Column {
  key: SortField | 'checkbox' | 'actions';
  label: string;
  sortable: boolean;
  width?: string;
  render?: (collab: CollaboratorWithStats) => React.ReactNode;
}

interface SortableTableProps {
  data: CollaboratorWithStats[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onRowClick: (collab: CollaboratorWithStats) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  viewMode?: 'table' | 'compact';
}

export function SortableTable({
  data,
  sortConfig,
  onSort,
  onRowClick,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  viewMode = 'table',
}: SortableTableProps) {
  const isCompact = viewMode === 'compact';

  const columns: Column[] = [
    {
      key: 'checkbox',
      label: '',
      sortable: false,
      width: 'w-12',
    },
    {
      key: 'name',
      label: 'Colaborador',
      sortable: true,
      width: isCompact ? 'w-48' : 'w-64',
      render: (collab) => (
        <div className="flex items-center gap-3">
          <img
            src={collab.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(collab.name)}&background=13ecc8&color=10221f`}
            alt={collab.name}
            className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border-2 border-[#13ecc8]`}
          />
          <div className="min-w-0">
            <p className={`font-medium text-gray-900 truncate ${isCompact ? 'text-sm' : ''}`}>
              {collab.name}
            </p>
            <p className={`text-gray-500 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {collab.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Cargo',
      sortable: true,
      width: 'w-40',
      render: (collab) => (
        <span className={`text-gray-700 ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {collab.role}
        </span>
      ),
    },
    {
      key: 'team',
      label: 'Time',
      sortable: true,
      width: 'w-40',
      render: (collab) => (
        <div className="flex flex-col">
          <span className={`text-gray-700 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {collab.team?.name || '-'}
          </span>
          {collab.team?.areaName && (
            <span className={`text-gray-400 ${isCompact ? 'text-xs' : 'text-xs'}`}>
              {collab.team.areaName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Nível',
      sortable: true,
      width: 'w-20',
      render: (collab) => (
        <div className="flex items-center justify-center">
          <div className={`${isCompact ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} rounded-lg bg-gradient-to-br from-[#13ecc8] to-[#0fbda0] text-[#10221f] font-bold flex items-center justify-center`}>
            {collab.level}
          </div>
        </div>
      ),
    },
    {
      key: 'totalXP',
      label: 'XP Total',
      sortable: true,
      width: 'w-28',
      render: (collab) => (
        <span className={`font-semibold text-[#f59e0b] ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {collab.totalXP.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'streakDays',
      label: 'Sequência',
      sortable: true,
      width: 'w-28',
      render: (collab) => (
        <div className="flex items-center gap-1.5">
          <Flame className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} ${collab.streakDays > 0 ? 'text-[#fb923c]' : 'text-gray-300'}`} />
          <span className={`font-medium ${collab.streakDays > 0 ? 'text-[#fb923c]' : 'text-gray-400'} ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {collab.streakDays} {collab.streakDays === 1 ? 'dia' : 'dias'}
          </span>
        </div>
      ),
    },
    {
      key: 'completionRate',
      label: 'Taxa Conclusão',
      sortable: true,
      width: 'w-40',
      render: (collab) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {collab.completionRate.toFixed(0)}%
            </span>
            <span className={`text-gray-400 ${isCompact ? 'text-xs' : 'text-xs'}`}>
              {collab.coursesCompleted}/{collab.coursesAssigned}
            </span>
          </div>
          <div className={`${isCompact ? 'h-1' : 'h-1.5'} bg-gray-100 rounded-full overflow-hidden`}>
            <div
              className={`h-full rounded-full transition-all ${
                collab.completionRate >= 80 ? 'bg-green-500' :
                collab.completionRate >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${collab.completionRate}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'coursesLate',
      label: 'Status',
      sortable: true,
      width: 'w-32',
      render: (collab) => {
        if (collab.coursesLate === 0) {
          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Em dia
            </span>
          );
        } else if (collab.coursesLate <= 3) {
          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-700 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {collab.coursesLate} atrasado{collab.coursesLate > 1 ? 's' : ''}
            </span>
          );
        } else {
          return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Crítico ({collab.coursesLate})
            </span>
          );
        }
      },
    },
  ];

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-[#13ecc8]" />
    ) : (
      <ArrowDown className="w-4 h-4 text-[#13ecc8]" />
    );
  };

  const allSelected = data.length > 0 && data.every(collab => selectedIds.has(collab.id));
  const someSelected = data.some(collab => selectedIds.has(collab.id)) && !allSelected;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`bg-gray-50 border-b border-gray-200 ${isCompact ? 'h-10' : ''}`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.width || ''} ${isCompact ? 'px-3 py-2' : 'px-4 py-3'} text-left`}
                >
                  {column.key === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={onToggleSelectAll}
                      className="w-4 h-4 text-[#13ecc8] border-gray-300 rounded focus:ring-[#13ecc8] cursor-pointer"
                    />
                  ) : column.sortable ? (
                    <button
                      onClick={() => onSort(column.key as SortField)}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-[#13ecc8] transition-colors group"
                    >
                      {column.label}
                      <SortIcon field={column.key as SortField} />
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {column.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((collab) => (
              <tr
                key={collab.id}
                className={`${isCompact ? 'h-12' : 'h-16'} hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedIds.has(collab.id) ? 'bg-[#13ecc8]/5' : ''
                }`}
              >
                <td className={`${isCompact ? 'px-3 py-2' : 'px-4 py-3'}`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(collab.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelect(collab.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-[#13ecc8] border-gray-300 rounded focus:ring-[#13ecc8] cursor-pointer"
                  />
                </td>
                {columns.slice(1).map((column) => (
                  <td
                    key={column.key}
                    className={`${isCompact ? 'px-3 py-2' : 'px-4 py-3'}`}
                    onClick={() => onRowClick(collab)}
                  >
                    {column.render ? column.render(collab) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">Nenhum colaborador encontrado</p>
        </div>
      )}
    </div>
  );
}
