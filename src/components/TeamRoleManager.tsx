import React, { useState, useMemo } from 'react';
import { Team, Role, Area, TeamInput, RoleInput } from '../types';
import { Search, Edit2, Trash2, X, Check, Building2, Users, Briefcase, ChevronRight } from 'lucide-react';
import { AreaManager } from './AreaManager';

interface TeamRoleManagerProps {
  teams: Team[];
  roles: Role[];
  onAddTeam: (data: TeamInput) => Promise<void>;
  onAddRole: (data: RoleInput) => Promise<void>;
  onUpdateTeam?: (id: string, data: Partial<TeamInput>) => Promise<void>;
  onDeleteTeam?: (id: string) => Promise<void>;
  onUpdateRole?: (id: string, data: Partial<RoleInput>) => Promise<void>;
  onDeleteRole?: (id: string) => Promise<void>;
}

const TeamRoleManager: React.FC<TeamRoleManagerProps> = ({
  teams,
  roles,
  onAddTeam,
  onAddRole,
  onUpdateTeam,
  onDeleteTeam,
  onUpdateRole,
  onDeleteRole,
}) => {
  // Team state
  const [teamName, setTeamName] = useState('');
  const [teamArea, setTeamArea] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Role state
  const [roleName, setRoleName] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // View mode: 'traditional' or 'hierarchy'
  const [viewMode, setViewMode] = useState<'traditional' | 'hierarchy'>('traditional');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered teams
  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) return teams;
    const search = teamSearch.toLowerCase();
    return teams.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.area.toLowerCase().includes(search)
    );
  }, [teams, teamSearch]);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const search = roleSearch.toLowerCase();
    return roles.filter(r => r.name.toLowerCase().includes(search));
  }, [roles, roleSearch]);

  // Handle add team
  const handleAddTeam = async () => {
    if (!teamName.trim() || !teamArea.trim()) return;
    setIsSavingTeam(true);
    try {
      await onAddTeam({ name: teamName.trim(), area: teamArea.trim() });
      setTeamName('');
      setTeamArea('');
      showToast('Time cadastrado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao cadastrar time', 'error');
    } finally {
      setIsSavingTeam(false);
    }
  };

  // Handle add role
  const handleAddRole = async () => {
    if (!roleName.trim()) return;
    setIsSavingRole(true);
    try {
      await onAddRole({ name: roleName.trim() });
      setRoleName('');
      showToast('Cargo cadastrado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao cadastrar cargo', 'error');
    } finally {
      setIsSavingRole(false);
    }
  };

  // Handle update team
  const handleUpdateTeam = async () => {
    if (!editingTeam || !onUpdateTeam) return;
    setIsSavingTeam(true);
    try {
      await onUpdateTeam(editingTeam.id, {
        name: editingTeam.name,
        area: editingTeam.area,
      });
      setEditingTeam(null);
      showToast('Time atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar time', 'error');
    } finally {
      setIsSavingTeam(false);
    }
  };

  // Handle delete team
  const handleDeleteTeam = async () => {
    if (!deletingTeam || !onDeleteTeam) return;
    try {
      await onDeleteTeam(deletingTeam.id);
      setDeletingTeam(null);
      showToast('Time excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir time', 'error');
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!editingRole || !onUpdateRole) return;
    setIsSavingRole(true);
    try {
      await onUpdateRole(editingRole.id, { name: editingRole.name });
      setEditingRole(null);
      showToast('Cargo atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar cargo', 'error');
    } finally {
      setIsSavingRole(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!deletingRole || !onDeleteRole) return;
    try {
      await onDeleteRole(deletingRole.id);
      setDeletingRole(null);
      showToast('Cargo excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir cargo. Verifique se não há colaboradores com este cargo.', 'error');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestão Organizacional</h1>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setViewMode('traditional')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
              viewMode === 'traditional'
                ? 'text-[#13ecc8] border-b-2 border-[#13ecc8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Times & Cargos
          </button>
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
              viewMode === 'hierarchy'
                ? 'text-[#13ecc8] border-b-2 border-[#13ecc8]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Áreas
          </button>
        </div>
      </div>

      {/* Traditional View */}
      {viewMode === 'traditional' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* TEAMS PANEL */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastrar Time</h2>
          <div className="space-y-3">
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors"
              placeholder="Nome do time"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors"
              placeholder="Área"
              value={teamArea}
              onChange={(e) => setTeamArea(e.target.value)}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-60 hover:bg-primary-dark transition-colors"
                onClick={handleAddTeam}
                disabled={isSavingTeam || !teamName.trim() || !teamArea.trim()}
              >
                {isSavingTeam ? 'Salvando...' : 'Salvar Time'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-600">Times cadastrados</h3>
              <span className="text-xs text-gray-400">{filteredTeams.length} time(s)</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar time..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTeams.map((t) => (
                <li
                  key={t.id}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm flex items-center justify-between hover:border-primary/30 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.area}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {t.stats?.memberCount ?? 0} membros
                    </span>
                    {onUpdateTeam && (
                      <button
                        onClick={() => setEditingTeam(t)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteTeam && (
                      <button
                        onClick={() => setDeletingTeam(t)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {filteredTeams.length === 0 && (
                <li className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 text-center">
                  {teamSearch ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ROLES PANEL */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastrar Cargo</h2>
          <div className="space-y-3">
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors"
              placeholder="Nome do cargo"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-60 hover:bg-primary-dark transition-colors"
                onClick={handleAddRole}
                disabled={isSavingRole || !roleName.trim()}
              >
                {isSavingRole ? 'Salvando...' : 'Salvar Cargo'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-600">Cargos cadastrados</h3>
              <span className="text-xs text-gray-400">{filteredRoles.length} cargo(s)</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cargo..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredRoles.map((r) => (
                <li
                  key={r.id}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm flex items-center justify-between hover:border-primary/30 hover:bg-gray-50 transition-colors group"
                >
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <div className="flex items-center gap-2">
                    {onUpdateRole && (
                      <button
                        onClick={() => setEditingRole(r)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteRole && (
                      <button
                        onClick={() => setDeletingRole(r)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {filteredRoles.length === 0 && (
                <li className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 text-center">
                  {roleSearch ? 'Nenhum cargo encontrado' : 'Nenhum cargo cadastrado'}
                </li>
              )}
            </ul>
          </div>
        </div>
        </div>
      )}

      {/* Hierarchy View */}
      {viewMode === 'hierarchy' && (
        <div>
          <AreaManager />
        </div>
      )}

      {/* EDIT TEAM MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Time</h2>
            <div className="space-y-3">
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                placeholder="Nome do time"
                value={editingTeam.name}
                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                placeholder="Área"
                value={editingTeam.area}
                onChange={(e) => setEditingTeam({ ...editingTeam, area: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateTeam}
                className="px-5 py-2 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-60"
                disabled={isSavingTeam || !editingTeam.name.trim() || !editingTeam.area.trim()}
              >
                {isSavingTeam ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TEAM MODAL */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Excluir Time</h2>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o time <strong>{deletingTeam.name}</strong>?
              {deletingTeam.stats && deletingTeam.stats.memberCount > 0 && (
                <span className="block mt-2 text-sm text-red-600">
                  Atenção: Este time possui {deletingTeam.stats.memberCount} membro(s).
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingTeam(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Cargo</h2>
            <div className="space-y-3">
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
                placeholder="Nome do cargo"
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-5 py-2 rounded-xl bg-primary text-background-dark font-bold disabled:opacity-60"
                disabled={isSavingRole || !editingRole.name.trim()}
              >
                {isSavingRole ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ROLE MODAL */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Excluir Cargo</h2>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o cargo <strong>{deletingRole.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingRole(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRole}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRoleManager;
