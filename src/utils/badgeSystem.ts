/**
 * Badge System for Gamification
 *
 * Manages achievement badges that reward user milestones and behaviors.
 * Designed to increase motivation through variable rewards and recognition.
 */

import { Badge, UserStats, Course } from '../types';

/**
 * All available badges in the system
 * Organized by rarity to encourage progression
 */
export const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  // ===== COMMON BADGES (Getting Started) =====
  {
    id: 'first-steps',
    name: 'Primeiros Passos',
    description: 'Complete seu primeiro módulo',
    iconName: 'Footprints',
    rarity: 'common',
  },
  {
    id: 'knowledge-seeker',
    name: 'Buscador de Conhecimento',
    description: 'Complete seu primeiro curso',
    iconName: 'BookOpen',
    rarity: 'common',
  },
  {
    id: 'streak-starter',
    name: 'Início da Jornada',
    description: 'Mantenha um streak de 3 dias consecutivos',
    iconName: 'Flame',
    rarity: 'common',
  },

  // ===== RARE BADGES (Consistency) =====
  {
    id: 'week-warrior',
    name: 'Guerreiro Semanal',
    description: 'Mantenha um streak de 7 dias consecutivos',
    iconName: 'Zap',
    rarity: 'rare',
  },
  {
    id: 'course-collector',
    name: 'Colecionador de Cursos',
    description: 'Complete 5 cursos',
    iconName: 'Library',
    rarity: 'rare',
  },
  {
    id: 'perfect-score',
    name: 'Nota Perfeita',
    description: 'Alcance 100% em qualquer simulado',
    iconName: 'Star',
    rarity: 'rare',
  },
  {
    id: 'xp-climber',
    name: 'Escalador de XP',
    description: 'Alcance 5.000 pontos de XP',
    iconName: 'TrendingUp',
    rarity: 'rare',
  },

  // ===== EPIC BADGES (Mastery) =====
  {
    id: 'month-master',
    name: 'Mestre do Mês',
    description: 'Mantenha um streak de 30 dias consecutivos',
    iconName: 'Crown',
    rarity: 'epic',
  },
  {
    id: 'course-enthusiast',
    name: 'Entusiasta do Aprendizado',
    description: 'Complete 10 cursos',
    iconName: 'GraduationCap',
    rarity: 'epic',
  },
  {
    id: 'xp-champion',
    name: 'Campeão de XP',
    description: 'Alcance 15.000 pontos de XP',
    iconName: 'Trophy',
    rarity: 'epic',
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Alcance 100% em 5 simulados diferentes',
    iconName: 'Target',
    rarity: 'epic',
  },
  {
    id: 'review-master',
    name: 'Mestre das Revisões',
    description: 'Complete 50 revisões espaçadas',
    iconName: 'RefreshCw',
    rarity: 'epic',
  },

  // ===== LEGENDARY BADGES (Ultimate Achievement) =====
  {
    id: 'century-streak',
    name: 'Streak Centenário',
    description: 'Mantenha um streak de 100 dias consecutivos',
    iconName: 'Flame',
    rarity: 'legendary',
  },
  {
    id: 'knowledge-legend',
    name: 'Lenda do Conhecimento',
    description: 'Complete 25 cursos',
    iconName: 'Award',
    rarity: 'legendary',
  },
  {
    id: 'xp-titan',
    name: 'Titã de XP',
    description: 'Alcance 50.000 pontos de XP',
    iconName: 'Sparkles',
    rarity: 'legendary',
  },
  {
    id: 'ultimate-mastery',
    name: 'Maestria Suprema',
    description: 'Alcance nível 50',
    iconName: 'Gem',
    rarity: 'legendary',
  },
];

/**
 * Badge unlock conditions
 * Returns true if the badge should be unlocked
 */
type BadgeCondition = (userStats: UserStats, courses: Course[], additionalData?: any) => boolean;

const BADGE_CONDITIONS: Record<string, BadgeCondition> = {
  // Common badges
  'first-steps': (stats, courses) => {
    return courses.some(course =>
      course.modules.some(module => module.isCompleted)
    );
  },
  'knowledge-seeker': (stats) => stats.coursesCompleted >= 1,
  'streak-starter': (stats) => stats.streakDays >= 3,

  // Rare badges
  'week-warrior': (stats) => stats.streakDays >= 7,
  'course-collector': (stats) => stats.coursesCompleted >= 5,
  'perfect-score': (stats, courses, data) => {
    // Check if additionalData contains perfectSimulations count
    return data?.perfectSimulations >= 1;
  },
  'xp-climber': (stats) => stats.totalPoints >= 5000,

  // Epic badges
  'month-master': (stats) => stats.streakDays >= 30,
  'course-enthusiast': (stats) => stats.coursesCompleted >= 10,
  'xp-champion': (stats) => stats.totalPoints >= 15000,
  'perfectionist': (stats, courses, data) => {
    return data?.perfectSimulations >= 5;
  },
  'review-master': (stats, courses, data) => {
    return data?.totalReviews >= 50;
  },

  // Legendary badges
  'century-streak': (stats) => stats.streakDays >= 100,
  'knowledge-legend': (stats) => stats.coursesCompleted >= 25,
  'xp-titan': (stats) => stats.totalPoints >= 50000,
  'ultimate-mastery': (stats) => stats.level >= 50,
};

/**
 * Check which badges should be unlocked and return new unlocks
 */
export function checkBadgeUnlocks(
  userStats: UserStats,
  courses: Course[],
  additionalData?: {
    perfectSimulations?: number; // Count of 100% simulation scores
    totalReviews?: number; // Count of spaced repetition reviews completed
  }
): Badge[] {
  const currentlyUnlockedIds = new Set(userStats.badges.map(b => b.id));
  const newlyUnlocked: Badge[] = [];

  ALL_BADGES.forEach(badgeTemplate => {
    // Skip if already unlocked
    if (currentlyUnlockedIds.has(badgeTemplate.id)) return;

    // Check condition
    const condition = BADGE_CONDITIONS[badgeTemplate.id];
    if (condition && condition(userStats, courses, additionalData)) {
      newlyUnlocked.push({
        ...badgeTemplate,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  return newlyUnlocked;
}

/**
 * Get all badges with unlock status
 */
export function getAllBadgesWithStatus(userStats: UserStats): Badge[] {
  const unlockedIds = new Set(userStats.badges.map(b => b.id));

  return ALL_BADGES.map(badgeTemplate => {
    const unlocked = userStats.badges.find(b => b.id === badgeTemplate.id);
    return unlocked || { ...badgeTemplate, unlockedAt: undefined };
  });
}

/**
 * Get rarity color for UI display
 */
export function getBadgeRarityColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 border-gray-400';
    case 'rare':
      return 'text-blue-600 border-blue-400';
    case 'epic':
      return 'text-purple-600 border-purple-400';
    case 'legendary':
      return 'text-amber-600 border-amber-400';
    default:
      return 'text-gray-600 border-gray-400';
  }
}

/**
 * Get rarity label in Portuguese
 */
export function getBadgeRarityLabel(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'Comum';
    case 'rare':
      return 'Rara';
    case 'epic':
      return 'Épica';
    case 'legendary':
      return 'Lendária';
    default:
      return 'Comum';
  }
}

/**
 * Calculate level from XP using exponential curve
 * Formula: level = floor(sqrt(XP / 100))
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) ** 2 * 100;
}

/**
 * Get rank title based on XP
 */
export function getRankTitle(xp: number): string {
  if (xp >= 50000) return 'Diamante';
  if (xp >= 25000) return 'Platina';
  if (xp >= 10000) return 'Ouro';
  if (xp >= 5000) return 'Prata';
  return 'Bronze';
}

/**
 * Calculate XP reward with bonuses
 */
export function calculateXPReward(
  baseXP: number,
  score: number,
  streakDays: number,
  isFirstToday: boolean
): number {
  let finalXP = baseXP;

  // Performance multiplier (50% to 100% based on score)
  const performanceMultiplier = Math.max(0.5, score / 100);
  finalXP *= performanceMultiplier;

  // Streak bonus (10% if streak > 7)
  if (streakDays > 7) {
    finalXP *= 1.1;
  }

  // First activity of the day bonus (50% extra)
  if (isFirstToday) {
    finalXP *= 1.5;
  }

  return Math.round(finalXP);
}
