import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Area } from '../types';
import { apiService } from '../services/apiService';

export function AreaManager() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deletingArea, setDeletingArea] = useState<Area | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAreas();
      setAreas(data);
    } catch (error) {
      showToast('Erro ao carregar áreas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return areas;
    const searchLower = search.toLowerCase();
    return areas.filter(
      (a) =>
        a.name.toLowerCase().includes(searchLower) ||
        (a.description && a.description.toLowerCase().includes(searchLower))
    );
  }, [areas, search]);

  const handleCreate = () => {
    setFormData({ name: '', description: '' });
    setIsCreating(true);
  };

  const handleEdit = (area: Area) => {
    setFormData({ name: area.name, description: area.description || '' });
    setEditingArea(area);
  };

  const handleDelete = (area: Area) => {
    setDeletingArea(area);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nome da área é obrigatório', 'error');
      return;
    }

    try {
      if (editingArea) {
        await apiService.updateArea(editingArea.id, formData);
        showToast('Área atualizada com sucesso!', 'success');
      } else {
        await apiService.createArea(formData);
        showToast('Área criada com sucesso!', 'success');
      }
      setIsCreating(false);
      setEditingArea(null);
      setFormData({ name: '', description: '' });
      await loadAreas();
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar área', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingArea) return;

    try {
      await apiService.deleteArea(deletingArea.id);
      showToast('Área excluída com sucesso!', 'success');
      setDeletingArea(null);
      await loadAreas();
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir área', 'error');
    }
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingArea(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando áreas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar áreas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#13ecc8] focus:border-transparent"
          />
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#13ecc8] text-[#10221f] rounded-xl font-medium hover:bg-[#0fbda0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Área
        </button>
      </div>

      {/* Counter */}
      {search && (
        <div className="text-sm text-gray-500">
          {filteredAreas.length} de {areas.length} {filteredAreas.length === 1 ? 'área' : 'áreas'}
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAreas.map((area) => (
          <div
            key={area.id}
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-[#13ecc8] transition-all hover:shadow-md"
          >
            {/* Icon */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#13ecc8] to-[#0fbda0] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#10221f]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">{area.name}</h3>
                {area.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{area.description}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(area)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(area)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {search ? 'Nenhuma área encontrada' : 'Nenhuma área cadastrada'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingArea) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingArea ? 'Editar Área' : 'Nova Área'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Área *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#13ecc8] focus:border-transparent"
                  placeholder="Ex: Tecnologia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#13ecc8] focus:border-transparent resize-none"
                  placeholder="Descrição da área..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#13ecc8] text-[#10221f] rounded-xl font-medium hover:bg-[#0fbda0] transition-colors"
                >
                  {editingArea ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingArea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Excluir Área</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir a área <strong>{deletingArea.name}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingArea(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
