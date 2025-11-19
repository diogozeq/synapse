import React, { useState, useEffect } from 'react';
import { X, Users, Briefcase, User, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Course, Collaborator, Team, Role, Enrollment, EnrollmentInput, EnrollmentStatus } from '../types';

interface CourseAssignmentModalProps {
  course: Course;
  collaborators: Collaborator[];
  teams: Team[];
  roles: Role[];
  enrollments: Enrollment[];
  onClose: () => void;
  onCreateEnrollment: (data: EnrollmentInput) => Promise<void>;
  onDeleteEnrollment: (enrollmentId: string) => Promise<void>;
}

const CourseAssignmentModal: React.FC<CourseAssignmentModalProps> = ({
  course,
  collaborators,
  teams,
  roles,
  enrollments,
  onClose,
  onCreateEnrollment,
  onDeleteEnrollment
}) => {
  const [selectedTab, setSelectedTab] = useState<'individual' | 'team' | 'role'>('individual');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isRequired, setIsRequired] = useState(false);
  const [dueDate, setDueDate] = useState('');

  // Filtrar matrículas deste curso
  const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
  const enrolledCollaboratorIds = new Set(courseEnrollments.map(e => e.collaboratorId));

  const handleToggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleAssign = async () => {
    const promises: Promise<void>[] = [];

    if (selectedTab === 'individual') {
      // Atribuir diretamente aos colaboradores selecionados
      selectedItems.forEach(collaboratorId => {
        if (!enrolledCollaboratorIds.has(collaboratorId)) {
          promises.push(onCreateEnrollment({
            courseId: course.id,
            collaboratorId,
            isRequired,
            status: EnrollmentStatus.NOT_STARTED,
            progress: 0,
            assignedAt: new Date().toISOString(),
            dueDate: dueDate || undefined
          }));
        }
      });
    } else if (selectedTab === 'team') {
      // Atribuir a todos os membros das equipes selecionadas
      selectedItems.forEach(teamId => {
        const teamMembers = collaborators.filter(c => c.teamId === teamId);
        teamMembers.forEach(member => {
          if (!enrolledCollaboratorIds.has(member.id)) {
            promises.push(onCreateEnrollment({
              courseId: course.id,
              collaboratorId: member.id,
              isRequired,
              status: EnrollmentStatus.NOT_STARTED,
              progress: 0,
              assignedAt: new Date().toISOString(),
              dueDate: dueDate || undefined
            }));
          }
        });
      });
    } else if (selectedTab === 'role') {
      // Atribuir a todos os colaboradores com os cargos selecionados
      selectedItems.forEach(roleId => {
        const roleMembers = collaborators.filter(c => c.role === roleId);
        roleMembers.forEach(member => {
          if (!enrolledCollaboratorIds.has(member.id)) {
            promises.push(onCreateEnrollment({
              courseId: course.id,
              collaboratorId: member.id,
              isRequired,
              status: EnrollmentStatus.NOT_STARTED,
              progress: 0,
              assignedAt: new Date().toISOString(),
              dueDate: dueDate || undefined
            }));
          }
        });
      });
    }

    await Promise.all(promises);
    setSelectedItems(new Set());
    alert(`Curso atribuído com sucesso!`);
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta atribuição?')) {
      await onDeleteEnrollment(enrollmentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Atribuições</h2>
              <p className="text-sm text-gray-600 mt-1">{course.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setSelectedTab('individual')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              selectedTab === 'individual'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" /> Individual
          </button>
          <button
            onClick={() => setSelectedTab('team')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              selectedTab === 'team'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" /> Por Equipe
          </button>
          <button
            onClick={() => setSelectedTab('role')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              selectedTab === 'role'
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Por Cargo
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Configuration */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Configurações da Atribuição</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Obrigatório</span>
              </label>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-600 block mb-1">Data Limite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Selection List */}
          {selectedTab === 'individual' && (
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-3">Selecionar Colaboradores</h3>
              <div className="space-y-2">
                {collaborators.map(collab => {
                  const isEnrolled = enrolledCollaboratorIds.has(collab.id);
                  return (
                    <div
                      key={collab.id}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isEnrolled
                          ? 'bg-green-50 border-green-200'
                          : selectedItems.has(collab.id)
                          ? 'bg-blue-50 border-primary'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {!isEnrolled && (
                            <input
                              type="checkbox"
                              checked={selectedItems.has(collab.id)}
                              onChange={() => handleToggleSelection(collab.id)}
                              className="w-4 h-4"
                            />
                          )}
                          <div>
                            <p className="font-bold text-sm text-gray-900">{collab.name}</p>
                            <p className="text-xs text-gray-500">{collab.email}</p>
                          </div>
                        </div>
                        {isEnrolled && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-green-600">Atribuído</span>
                            <button
                              onClick={() => {
                                const enrollment = courseEnrollments.find(e => e.collaboratorId === collab.id);
                                if (enrollment) handleRemoveEnrollment(enrollment.id);
                              }}
                              className="ml-2 p-1 hover:bg-red-100 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'team' && (
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-3">Selecionar Equipes</h3>
              <div className="space-y-2">
                {teams.map(team => {
                  const teamMemberCount = collaborators.filter(c => c.teamId === team.id).length;
                  return (
                    <div
                      key={team.id}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedItems.has(team.id)
                          ? 'bg-blue-50 border-primary'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleSelection(team.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(team.id)}
                            onChange={() => handleToggleSelection(team.id)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-bold text-sm text-gray-900">{team.name}</p>
                            <p className="text-xs text-gray-500">{team.area} • {teamMemberCount} membros</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'role' && (
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-3">Selecionar Cargos</h3>
              <div className="space-y-2">
                {roles.map(role => {
                  const roleMemberCount = collaborators.filter(c => c.role === role.id).length;
                  return (
                    <div
                      key={role.id}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedItems.has(role.id)
                          ? 'bg-blue-50 border-primary'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleSelection(role.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(role.id)}
                            onChange={() => handleToggleSelection(role.id)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-bold text-sm text-gray-900">{role.name}</p>
                            <p className="text-xs text-gray-500">{roleMemberCount} colaboradores</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedItems.size === 0}
            className="flex-1 px-6 py-3 rounded-xl font-bold bg-primary text-background-dark hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Atribuir ({selectedItems.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseAssignmentModal;
