import React from 'react';
import { UserRole, UserStats, Course } from '../types';
import OldDashboard from './OldDashboard';
import CollaboratorDashboard from './CollaboratorDashboard';
import ManagerDashboard from './ManagerDashboard';

interface DashboardProps {
  userRole?: UserRole;
  stats?: UserStats;
  courses?: Course[];
  onContinueCourse?: (course: Course) => void;
}

/**
 * Dashboard Router Component
 *
 * Este componente roteia automaticamente entre dois dashboards diferentes
 * baseado no role do usuário:
 * - COLABORADOR: Dashboard focado em aprendizado pessoal, progresso e cursos
 * - GESTOR: Dashboard focado em gestão de equipe, métricas e analytics
 *
 * Se receber as props antigas (stats, courses, onContinueCourse), usa o OldDashboard
 */
export default function Dashboard({ userRole, stats, courses, onContinueCourse }: DashboardProps) {
  // Se receber as props antigas, usar o dashboard antigo
  if (stats && courses && onContinueCourse) {
    return <OldDashboard stats={stats} courses={courses} onContinueCourse={onContinueCourse} />;
  }

  // Novos dashboards baseados em API
  if (userRole === UserRole.MANAGER) {
    return <ManagerDashboard />;
  }

  // Default: Dashboard do colaborador
  return <CollaboratorDashboard />;
}
