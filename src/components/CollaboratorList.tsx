import React, { useState, useMemo } from 'react';
import { Collaborator, Team, Role, CollaboratorInput, ViewMode } from '../types';
import { CheckCircle, Clock, Users, Download, LayoutGrid, Table2, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCollaboratorFilters } from '../hooks/useCollaboratorFilters';
import { useTableSort } from '../hooks/useTableSort';
import { QuickFilters } from './filters/QuickFilters';
import { AdvancedFilters } from './filters/AdvancedFilters';
import { SortableTable } from './table/SortableTable';
import { CardsView } from './table/CardsView';
import { BulkActions } from './table/BulkActions';
import { exportCollaborators } from '../utils/exportUtils';

interface CollaboratorListProps {
  collaborators: Collaborator[];
  teams: Team[];
  roles: Role[];
  onSelectCollaborator: (id: string) => void;
  onAddCollaborator: (data: CollaboratorInput & { cpf?: string }) => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  collaborators,
  teams,
  roles,
  onSelectCollaborator,
  onAddCollaborator
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newTeamId, setNewTeamId] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Use custom hooks for filtering and sorting
  const {
    filters,
    filteredCollaborators,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    applyQuickFilter,
    totalCount,
    filteredCount,
  } = useCollaboratorFilters({ collaborators, teams, roles });

  const { sortedData, sortConfig, handleSort } = useTableSort({ data: filteredCollaborators });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Statistics
  const collaboratorsWithLate = collaborators.filter(c => c.coursesLate > 0).length;
  const avgCompletionRate = collaborators.length === 0
    ? 0
    : Math.round(
        collaborators.reduce((acc, c) => acc + (c.coursesCompleted / (c.coursesAssigned || 1)) * 100, 0) / collaborators.length
      );

  // Handle add collaborator
  const handleCreateCollaborator = async () => {
    if (!newName.trim() || !newEmail.trim() || !newCpf.trim() || newCpf.length !== 11 || !newRole.trim() || !newTeamId) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddCollaborator({
        name: newName.trim(),
        email: newEmail.trim(),
        cpf: newCpf.trim(),
        role: newRole.trim(),
        teamId: newTeamId,
        avatarUrl: newAvatarUrl || undefined
      });
      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewCpf('');
      setNewRole('');
      setNewTeamId('');
      setNewAvatarUrl('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (paginatedData.every(c => selectedIds.has(c.id))) {
      // Deselect all on current page
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        paginatedData.forEach(c => newSet.delete(c.id));
        return newSet;
      });
    } else {
      // Select all on current page
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        paginatedData.forEach(c => newSet.add(c.id));
        return newSet;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Export handlers
  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const dataToExport = selectedIds.size > 0
      ? sortedData.filter(c => selectedIds.has(c.id))
      : sortedData;

    exportCollaborators(dataToExport, {
      format,
      includeTimestamp: true,
    });
  };

  // Bulk action handlers
  const handleBulkExport = () => {
    const selectedData = sortedData.filter(c => selectedIds.has(c.id));
    exportCollaborators(selectedData, {
      format: 'xlsx',
      includeTimestamp: true,
    });
  };

  const handleReassignTeam = () => {
    // TODO: Implement team reassignment modal
    alert('Funcionalidade de reatribuição de time em desenvolvimento');
  };

  const handleSendReminder = () => {
    // TODO: Implement reminder functionality
    alert('Funcionalidade de envio de lembrete em desenvolvimento');
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Equipe</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-500">Gerencie o progresso e os treinamentos dos seus colaboradores.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background-dark shadow transition hover:-translate-y-0.5 sm:w-auto"
          >
            + Adicionar colaborador
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-500">Colaboradores Totais</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{collaboratorsWithLate}</div>
            <div className="text-sm text-gray-500">Com cursos atrasados</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{avgCompletionRate}%</div>
            <div className="text-sm text-gray-500">Taxa de Conclusão Média</div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <QuickFilters onFilterClick={applyQuickFilter} />
      </div>

      {/* Advanced Filters */}
      <div className="mb-6">
        <AdvancedFilters
          filters={filters}
          teams={teams}
          roles={roles}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Toolbar - View Toggle & Export */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{paginatedData.length}</span> de{' '}
            <span className="font-semibold">{filteredCount}</span> colaboradores
            {hasActiveFilters && totalCount !== filteredCount && (
              <span className="text-gray-400"> (filtrado de {totalCount})</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table' ? 'bg-[#13ecc8] text-[#10221f]' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Visualização em Tabela"
            >
              <Table2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 transition-colors ${
                viewMode === 'compact' ? 'bg-[#13ecc8] text-[#10221f]' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Visualização Compacta"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 transition-colors ${
                viewMode === 'cards' ? 'bg-[#13ecc8] text-[#10221f]' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#13ecc8] hover:text-[#13ecc8] transition-all">
              <Download className="w-4 h-4" />
              Baixar Relatório
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl"
              >
                Exportar como CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Exportar como Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-xl"
              >
                Exportar como PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data View */}
      {viewMode === 'cards' ? (
        <CardsView
          data={paginatedData}
          onCardClick={(collab) => onSelectCollaborator(collab.id)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
      ) : (
        <SortableTable
          data={paginatedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={(collab) => onSelectCollaborator(collab.id)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          viewMode={viewMode}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#13ecc8] text-[#10221f]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onExport={handleBulkExport}
        onReassignTeam={handleReassignTeam}
        onSendReminder={handleSendReminder}
        onClearSelection={handleClearSelection}
      />

      {/* Add Collaborator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Adicionar novo colaborador</h2>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="px-4 py-2.5 rounded-xl border border-gray-200"
                placeholder="Nome completo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                className="px-4 py-2.5 rounded-xl border border-gray-200"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <input
                className="px-4 py-2.5 rounded-xl border border-gray-200"
                placeholder="CPF (apenas números)"
                value={newCpf}
                onChange={(e) => setNewCpf(e.target.value.replace(/\D/g, ''))}
              />
              <select
                className="px-4 py-2.5 rounded-xl border border-gray-200"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="">Selecione o cargo</option>
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
              <select
                className="px-4 py-2.5 rounded-xl border border-gray-200"
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
              >
                <option value="">Selecione o time</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div>
                <label className="text-sm font-bold text-gray-600">Foto do avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setNewAvatarUrl(url);
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCollaborator}
                className="px-5 py-2 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorList;
