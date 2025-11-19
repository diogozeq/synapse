import React, { useState } from 'react';
import { UserStats, Course } from '../types';
import { Flame, Star, Trophy, PlayCircle, CheckCircle2, Lock, Zap, Code2, Award, RefreshCw, Calendar } from 'lucide-react';
import { SOURCE_CODE } from '../utils/projectSource';
import { getAllBadgesWithStatus, getBadgeRarityColor, getBadgeRarityLabel, xpForNextLevel } from '../utils/badgeSystem';
import { getReviewableModules, getReviewStats } from '../utils/spacedRepetition';
import * as LucideIcons from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  courses: Course[];
  onContinueCourse: (course: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, courses, onContinueCourse }) => {
  const [showBadges, setShowBadges] = useState(false);

  // Group courses by category
  const categories = Array.from(new Set(courses.map(c => c.category)));

  // Provide some default categories if empty
  if (categories.length === 0) categories.push("Obrigatórios", "Soft Skills", "Novidades");

  const recommendedCourse = courses.find(c => c.isRecommended) || courses[0];

  // Get all modules for review calculation
  const allModules = courses.flatMap(c => c.modules);
  const reviewableModules = getReviewableModules(allModules);
  const reviewStats = getReviewStats(allModules);

  // Get all badges with unlock status
  const allBadges = getAllBadgesWithStatus(stats);
  const unlockedBadges = stats.badges;
  const lockedBadges = allBadges.filter(b => !b.unlockedAt);

  // Calculate XP progress to next level
  const nextLevelXP = xpForNextLevel(stats.level);
  const currentLevelXP = stats.level ** 2 * 100;
  const xpProgress = ((stats.totalPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  // Streak display logic
  const getStreakIntensity = () => {
    if (stats.streakDays >= 30) return { color: 'text-red-600', size: 'text-xl', flames: 3, label: 'Incrível!' };
    if (stats.streakDays >= 7) return { color: 'text-orange-600', size: 'text-lg', flames: 2, label: 'Ótimo!' };
    return { color: 'text-accent-streak', size: 'text-base', flames: 1, label: 'Continue!' };
  };

  const streakDisplay = getStreakIntensity();

  const handleExportCode = async () => {
    try {
      await navigator.clipboard.writeText(SOURCE_CODE);
      alert("Todo o código do projeto foi copiado para a área de transferência!");
    } catch (error) {
      console.error("Erro ao copiar:", error);
      alert("Não foi possível copiar o código. Verifique as permissões do navegador.");
    }
  };

  return (
    <div className="min-h-full pb-12 dark:bg-gray-900 lg:pb-16">
      {/* Enhanced Stats Header */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-gray-950/90 sm:px-6 lg:flex-nowrap lg:px-10">

        <button
          onClick={handleExportCode}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors active:scale-95"
          title="Copiar todo o código-fonte do projeto"
        >
          <Code2 className="w-4 h-4" />
          Exportar Código
        </button>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-4 sm:gap-6">
          <div className="group flex items-center gap-2 rounded-xl px-3 py-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <img src="https://flagcdn.com/br.svg" width="24" alt="PT-BR" className="rounded-md shadow-sm opacity-80 group-hover:opacity-100" />
          </div>

          {/* Enhanced Streak Display */}
          <div className="relative group">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-2 rounded-xl cursor-pointer transition-all">
              <div className="relative">
                {[...Array(streakDisplay.flames)].map((_, i) => (
                  <Flame
                    key={i}
                    className={`w-5 h-5 ${streakDisplay.color} fill-current absolute animate-pulse-slow`}
                    style={{
                      left: `${i * -2}px`,
                      animationDelay: `${i * 200}ms`,
                      opacity: 1 - (i * 0.3)
                    }}
                  />
                ))}
                <Flame className={`w-5 h-5 ${streakDisplay.color} fill-current relative z-10`} />
              </div>
              <span className={`font-bold ${streakDisplay.color} ${streakDisplay.size}`}>{stats.streakDays}</span>
            </div>
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {stats.streakDays} dias consecutivos! {streakDisplay.label}
            </div>
          </div>

          {/* Enhanced XP Display with Level Progress */}
          <div className="relative group">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-3 py-2 rounded-xl cursor-pointer transition-colors">
              <Trophy className="w-5 h-5 text-accent-badge" />
              <div className="flex flex-col">
                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Nível {stats.level}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{stats.totalPoints} XP</span>
              </div>
            </div>
            {/* XP Progress Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <div className="mb-1">{Math.round(xpProgress)}% para o próximo nível</div>
              <div className="w-32 bg-gray-700 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${xpProgress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Badges Display */}
          <button
            onClick={() => setShowBadges(true)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-2 rounded-xl cursor-pointer transition-colors relative"
          >
            <Award className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-gray-700 dark:text-gray-200">{unlockedBadges.length}/{allBadges.length}</span>
            {unlockedBadges.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce-subtle">
                {unlockedBadges.length}
              </span>
            )}
          </button>

          {/* Review Counter */}
          {reviewStats.dueToday > 0 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-xl cursor-pointer transition-colors">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-600">{reviewStats.dueToday}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-10">
        {/* Spaced Repetition Review Section */}
        {reviewStats.dueToday > 0 && (
          <div className="mb-8 rounded-3xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 shadow-lg dark:from-blue-950 dark:to-cyan-950 dark:border-blue-700">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Revisão Programada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{reviewStats.dueToday}</span> {reviewStats.dueToday === 1 ? 'atividade pronta' : 'atividades prontas'} para revisar hoje
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-left lg:items-end">
                <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl">
                  <Calendar className="w-5 h-5" />
                  Revisar Agora
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reviewStats.dueThisWeek} itens esta semana
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section / Recommended */}
        {recommendedCourse ? (
          <div className="relative mb-10 flex min-h-[300px] flex-col items-start overflow-hidden rounded-3xl bg-background-dark shadow-2xl dark:bg-gray-950 lg:flex-row lg:items-center">
             <div className="absolute inset-0 z-0">
                <img src={recommendedCourse.thumbnailUrl} className="h-full w-full object-cover opacity-40 dark:opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/90 to-transparent dark:from-gray-950 dark:via-gray-950/90"></div>
             </div>

             <div className="relative z-10 w-full max-w-2xl p-6 text-white sm:p-8 lg:p-10">
                <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Recomendado para você
                </span>
                <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">{recommendedCourse.title}</h1>
                <p className="mb-8 line-clamp-3 text-base text-gray-300 dark:text-gray-400 sm:text-lg">{recommendedCourse.description}</p>

                <button
                  onClick={() => onContinueCourse(recommendedCourse)}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-lg font-bold text-background-dark transition-all hover:-translate-y-1 hover:bg-primary-dark hover:shadow-[0_0_30px_rgba(19,236,200,0.5)] md:w-auto"
                >
                  <PlayCircle className="w-6 h-6 fill-current" />
                  {recommendedCourse.progress > 0 ? 'Continuar' : 'Começar agora'}
                </button>
             </div>
          </div>
        ) : (
          <div className="mb-10 bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Nenhum curso disponível ainda.</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Crie seu primeiro curso para começar.</p>
          </div>
        )}

        {/* Netflix-style Horizontal Lists */}
        {categories.map((category) => {
          const categoryCourses = courses.filter(c => c.category === category);
          // Mock items if empty for UI demo
          const displayCourses = categoryCourses.length > 0 ? categoryCourses : []; 

          if (displayCourses.length === 0 && courses.length > 0) return null;

          return (
            <section key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{category}</h2>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar -mx-4 px-4 snap-x">
                {displayCourses.length > 0 ? displayCourses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => onContinueCourse(course)}
                    className="snap-start shrink-0 w-[280px] group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                      <img src={course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                      {/* Progress Overlay */}
                      <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm p-3">
                         <div className="flex justify-between items-center text-xs text-white font-medium mb-1">
                           <span>{course.progress}%</span>
                           <span>{course.totalXP} XP</span>
                         </div>
                         <div className="w-full bg-white/20 rounded-full h-1">
                            <div className="bg-primary h-1 rounded-full shadow-[0_0_10px_rgba(19,236,200,0.8)]" style={{ width: `${course.progress}%` }}></div>
                         </div>
                      </div>

                      {/* Completed Badge */}
                      {course.progress === 100 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary-dark transition-colors">{course.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{course.modules.length} atividades</p>
                  </div>
                )) : (
                  // Empty State placeholders
                  [1,2,3].map(i => (
                    <div key={i} className="shrink-0 w-[280px] opacity-40 pointer-events-none grayscale">
                      <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Badges Modal */}
      {showBadges && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowBadges(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Award className="w-10 h-10" />
                  <div>
                    <h2 className="text-3xl font-bold">Suas Conquistas</h2>
                    <p className="text-purple-100">
                      {unlockedBadges.length} de {allBadges.length} badges desbloqueados
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBadges(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Unlocked Badges */}
              {unlockedBadges.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🎉 Desbloqueados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlockedBadges.map((badge) => {
                      const IconComponent = (LucideIcons as any)[badge.iconName] || Award;
                      return (
                        <div
                          key={badge.id}
                          className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 ${getBadgeRarityColor(badge.rarity)} rounded-2xl p-4 shadow-md hover:shadow-lg transition-all`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`${badge.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : badge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gray-400'} p-3 rounded-xl shadow-lg`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  {badge.name}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getBadgeRarityColor(badge.rarity)}`}>
                                  {getBadgeRarityLabel(badge.rarity)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {badge.description}
                              </p>
                              {badge.unlockedAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Desbloqueado em{' '}
                                  {new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Locked Badges */}
              {lockedBadges.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🔒 Bloqueados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedBadges.map((badge) => {
                      const IconComponent = (LucideIcons as any)[badge.iconName] || Award;
                      return (
                        <div
                          key={badge.id}
                          className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-4 opacity-60"
                        >
                          <div className="flex items-start gap-4">
                            <div className="bg-gray-400 p-3 rounded-xl">
                              <IconComponent className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-700 dark:text-gray-300">
                                  {badge.name}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                  {getBadgeRarityLabel(badge.rarity)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
