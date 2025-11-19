import { Download, Users, Mail, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onReassignTeam: () => void;
  onSendReminder: () => void;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  onExport,
  onReassignTeam,
  onSendReminder,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#10221f] text-white rounded-2xl shadow-2xl border border-[#13ecc8]/20 px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Selection Count */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#13ecc8] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-[#10221f]">{selectedCount}</span>
            </div>
            <span className="text-sm font-medium">
              {selectedCount === 1 ? 'colaborador selecionado' : 'colaboradores selecionados'}
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-600" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              title="Exportar selecionados"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Exportar</span>
            </button>

            <button
              onClick={onReassignTeam}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              title="Reatribuir time"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Mudar Time</span>
            </button>

            <button
              onClick={onSendReminder}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              title="Enviar lembrete"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Enviar Lembrete</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClearSelection}
            className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
