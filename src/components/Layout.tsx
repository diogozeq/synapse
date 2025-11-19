import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  BarChart2,
  Shield,
  Users,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { View, UserRole } from '../types';

interface LayoutProps {
  currentView: View;
  userRole: UserRole;
  onNavigate: (view: View) => void;
  onToggleRole: () => void;
  onToggleTheme: () => void;
  themeMode: 'light' | 'dark';
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  currentView,
  userRole,
  onNavigate,
  onToggleRole,
  onToggleTheme,
  themeMode,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const collaboratorItems = [
    { id: View.DASHBOARD, label: 'Início', icon: LayoutDashboard },
    { id: View.LEARN, label: 'Meus Cursos', icon: BookOpen },
    { id: View.CHECKIN, label: 'Check-in Diário', icon: Activity },
    { id: 'history', label: 'Histórico', icon: BarChart2, disabled: true }
  ];

  const managerItems = [
    { id: View.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
    { id: View.COURSES, label: 'Cursos', icon: BookOpen },
    { id: View.TEAM_LIST, label: 'Minha Equipe', icon: Users },
    { id: View.TEAMS_ROLES, label: 'Times e Cargos', icon: Shield },
    { id: 'reports', label: 'Relatórios', icon: BarChart2, disabled: true },
    { id: 'admin', label: 'Admin & SSO', icon: Shield, disabled: true }
  ];

  const navItems = userRole === UserRole.MANAGER ? managerItems : collaboratorItems;

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light font-sans text-gray-900 transition-colors duration-300 dark:bg-gray-900 lg:flex-row">
      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-background-light/95 px-4 py-3 shadow-sm backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-gray-950/90 lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2 shadow-[0_0_15px_rgba(19,236,200,0.35)]">
            <BrainCircuit className="h-5 w-5 text-background-dark" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Synapse</span>
        </div>
        <button
          onClick={onToggleTheme}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Alternar tema"
        >
          {themeMode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col bg-background-dark text-white shadow-2xl transition-transform duration-300 dark:bg-gray-950 lg:static lg:translate-x-0 lg:shadow-xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="rounded-lg bg-primary p-2 shadow-[0_0_15px_rgba(19,236,200,0.4)]">
            <BrainCircuit className="h-6 w-6 text-background-dark" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Synapse</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-white/80 transition hover:bg-white/10 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6 sm:px-5">
          <div>
            <h3 className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              {userRole === UserRole.MANAGER ? 'Gestão' : 'Learning'}
            </h3>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isDisabled = (item as { disabled?: boolean }).disabled;
                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && handleNavigate(item.id as View)}
                    disabled={isDisabled}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'border border-primary/20 bg-primary/10 text-primary shadow-sm'
                        : isDisabled
                          ? 'cursor-not-allowed text-gray-600 opacity-60'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : isDisabled ? 'text-gray-600' : 'text-gray-500'}`} />
                    <span className="truncate">{item.label}</span>
                    {isDisabled && (
                      <span className="absolute right-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-400 transition-colors group-hover:bg-white/20">
                        Em breve
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  window.location.href = '/analytics';
                  setIsSidebarOpen(false);
                }}
                className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-gray-200"
              >
                <BarChart2 className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                Analytics
              </button>
            </div>
          </div>
        </nav>

        <div className="border-t border-white/10 bg-black/20 px-4 py-4 dark:bg-black/40">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
            <span className="text-xs font-bold uppercase text-gray-400">Tema</span>
            <button
              onClick={onToggleTheme}
              className="rounded-lg p-2 text-primary transition hover:bg-white/10 hover:text-white"
              title={themeMode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {themeMode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
            <span className="text-xs font-bold uppercase text-gray-400">Modo de Visão</span>
            <button
              onClick={() => {
                onToggleRole();
                setIsSidebarOpen(false);
              }}
              className="rounded-lg p-2 text-primary transition hover:bg-white/10 hover:text-white"
            >
              {userRole === UserRole.MANAGER ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-gray-500" />}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">
            {userRole === UserRole.MANAGER ? 'Você está no modo Gestor' : 'Você está no modo Colaborador'}
          </p>
        </div>

        <div className="border-t border-white/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <img
              src="https://i.pravatar.cc/150?u=alex"
              alt="User"
              className="h-10 w-10 rounded-full border-2 border-primary object-cover shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Alex Morgan</p>
              <p className="truncate text-xs text-primary">
                {userRole === UserRole.MANAGER ? 'Product Manager' : 'Colaborador'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f6f8f8] pt-16 transition-colors duration-300 dark:bg-gray-900 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
