import React from 'react';
import { Collaborator, Enrollment, Course, EnrollmentStatus, Team, Role } from '../types';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Trophy, Flame } from 'lucide-react';
import BioMetricsCard from './BioMetricsCard';

interface CollaboratorDetailProps {
  collaborator: Collaborator;
  team?: Team;
  teams?: Team[];
  roles?: Role[];
  enrollments: Enrollment[];
  courses: Course[];
  onBack: () => void;
  onUpdateCollaborator: (id: string, updates: { name?: string; email?: string; cpf?: string; role?: string; teamId?: string; avatarUrl?: string }) => Promise<void>;
}

const CollaboratorDetail: React.FC<CollaboratorDetailProps> = ({ collaborator, team, teams = [], roles = [], enrollments, courses, onBack, onUpdateCollaborator }) => {
  const getCourse = (id: string) => courses.find(c => c.id === id);

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.COMPLETED:
        return (
          <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Concluído
          </span>
        );
      case EnrollmentStatus.LATE:
        return (
          <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Atrasado
          </span>
        );
      case EnrollmentStatus.FAILED_SIMULATION:
        return (
          <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-100 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Reprovado
          </span>
        );
      case EnrollmentStatus.IN_PROGRESS:
        return (
          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-100">
            Em Andamento
          </span>
        );
      default:
        return (
          <span className="text-gray-400 bg-gray-50 px-2 py-1 rounded text-xs font-bold">
            Não Iniciado
          </span>
        );
    }
  };

  const completedEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED);
  const lateEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.LATE);
  const scores = enrollments.map(e => e.finalScore).filter(s => s !== undefined) as number[];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState(collaborator.name);
  const [editEmail, setEditEmail] = React.useState(collaborator.email);
  const [editCpf, setEditCpf] = React.useState(collaborator.cpf || '');
  const [editRole, setEditRole] = React.useState(collaborator.role);
  const [editTeamId, setEditTeamId] = React.useState(collaborator.teamId);
  const [editAvatarUrl, setEditAvatarUrl] = React.useState(collaborator.avatarUrl);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateCollaborator(collaborator.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        cpf: editCpf.trim(),
        role: editRole.trim(),
        teamId: editTeamId,
        avatarUrl: editAvatarUrl
      });
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar para Equipe
      </button>

      <div className="mb-8 flex flex-col items-start gap-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        <img src={collaborator.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white shadow-lg" alt={collaborator.name} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{collaborator.name}</h1>
            <span className="bg-primary/10 text-primary-dark text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              {collaborator.role}
            </span>
          </div>
          <p className="text-gray-500 mb-4">
            {collaborator.email} • {team?.name || 'Sem Time'}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="font-bold text-yellow-700 text-sm">{collaborator.totalXP} XP</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-orange-700 text-sm">{collaborator.streakDays} Dias Streak</span>
            </div>
          </div>
        </div>
        <div>
          <button onClick={() => setIsEditOpen(true)} className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-sm">Editar dados</button>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Atribuídos</div>
          <div className="text-2xl font-bold text-gray-900">{enrollments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Concluídos</div>
          <div className="text-2xl font-bold text-gray-900">{completedEnrollments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Atrasados</div>
          <div className="text-2xl font-bold text-red-600">{lateEnrollments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Nota Média</div>
          <div className="text-2xl font-bold text-primary-dark">{avgScore > 0 ? `${avgScore}%` : '-'}</div>
        </div>
      </div>

      {/* Bio Analytics Card */}
      <div className="mb-10">
        <BioMetricsCard userId={collaborator.id} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-bold text-gray-800">Histórico de Cursos</h3>
          <button className="text-xs font-bold bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
            Baixar Relatório
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
          <thead className="bg-white border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Curso</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progresso</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nota Simulado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.map(enrollment => {
              const course = getCourse(enrollment.courseId);
              return (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-sm">{course?.title || 'Curso Removido'}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      {enrollment.isRequired && (
                        <span className="text-red-500 font-bold bg-red-50 px-1 rounded">OBRIGATÓRIO</span>
                      )}
                      {course?.category}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(enrollment.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-24">
                        <div
                          className="h-1.5 bg-primary rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {enrollment.finalScore ? `${enrollment.finalScore}%` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {enrollment.dueDate ? new Date(enrollment.dueDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      {enrollments.length === 0 && (
        <div className="p-8 text-center text-gray-400 italic">Nenhum curso atribuído.</div>
      )}
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar colaborador</h2>
            <div className="grid grid-cols-1 gap-3">
              <input className="px-4 py-2.5 rounded-xl border border-gray-200" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <input className="px-4 py-2.5 rounded-xl border border-gray-200" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              <input className="px-4 py-2.5 rounded-xl border border-gray-200" placeholder="CPF" value={editCpf} onChange={(e) => setEditCpf(e.target.value.replace(/\D/g, ''))} />
              <select className="px-4 py-2.5 rounded-xl border border-gray-200" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                <option value="">Selecione o cargo</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
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
                      setEditAvatarUrl(url);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <select className="px-4 py-2.5 rounded-xl border border-gray-200" value={editTeamId} onChange={(e) => setEditTeamId(e.target.value)}>
                <option value="">Selecione o time</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setIsEditOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-600">Cancelar</button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-primary px-5 py-2 font-bold text-background-dark disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorDetail;
