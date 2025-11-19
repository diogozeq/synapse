import React from 'react';
import { Book, Calendar, AlertTriangle } from 'lucide-react';
import DashboardWidget from '../DashboardWidget';
import { useNavigate } from 'react-router-dom';

interface ActiveCourse {
  id: string;
  cursoId: string;
  titulo: string;
  thumbnailUrl?: string;
  progresso: number;
  status: string;
  prazo?: string;
  ultimoAcesso?: string;
  ehObrigatorio: boolean;
}

interface ActiveCoursesWidgetProps {
  courses: ActiveCourse[];
}

export default function ActiveCoursesWidget({ courses }: ActiveCoursesWidgetProps) {
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem prazo';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getDaysRemaining = (prazo?: string) => {
    if (!prazo) return null;
    const deadline = new Date(prazo);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <DashboardWidget title="Meus Cursos Ativos" subtitle="Continue de onde parou">
      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Book className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum curso em andamento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const daysRemaining = getDaysRemaining(course.prazo);
            const isOverdue = course.status === 'ATRASADO';
            const isUrgent = daysRemaining !== null && daysRemaining <= 3 && !isOverdue;

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.cursoId}`)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  isOverdue
                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : isUrgent
                    ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex gap-3">
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.titulo}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                        {course.titulo}
                      </h4>
                      {course.ehObrigatorio && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex-shrink-0">
                          Obrigatório
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>{course.progresso}% concluído</span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Atrasado
                          </span>
                        )}
                        {isUrgent && !isOverdue && (
                          <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverdue
                              ? 'bg-red-500'
                              : isUrgent
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${course.progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {course.prazo && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Prazo: {formatDate(course.prazo)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
