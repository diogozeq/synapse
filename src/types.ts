
export enum View {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  CREATE_COURSE = 'CREATE_COURSE',
  LEARN = 'LEARN',
  COURSE_DETAILS = 'COURSE_DETAILS',
  TEAM_LIST = 'TEAM_LIST',
  COLLABORATOR_DETAIL = 'COLLABORATOR_DETAIL',
  TEAMS_ROLES = 'TEAMS_ROLES',
  CHECKIN = 'CHECKIN'
}

export enum UserRole {
  MANAGER = 'GESTOR',
  COLLABORATOR = 'COLABORADOR'
}

export enum EnrollmentStatus {
  NOT_STARTED = 'NAO_INICIADO',
  IN_PROGRESS = 'EM_ANDAMENTO',
  COMPLETED = 'CONCLUIDO',
  LATE = 'ATRASADO',
  FAILED_SIMULATION = 'REPROVADO_SIMULADO'
}

export enum ActivityType {
  SUMMARY = 'RESUMO',
  FLASHCARD = 'FLASHCARD',
  QUIZ = 'QUIZ',
  SIMULATION = 'SIMULADO',
  CASE_STUDY = 'ESTUDO_DE_CASO',
  MAP_MENTAL = 'MAPA_MENTAL',
  CLOZE = 'CLOZE',
  COMPARISON = 'COMPARACAO',
  SELF_EXPLANATION = 'AUTO_EXPLICACAO'
}

// --- Spaced Repetition Metadata (SM-2 Algorithm) ---
export interface SpacedRepetitionMetadata {
  easinessFactor: number; // 1.3 to 2.5 (default 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of consecutive successful reviews
  lastReviewDate: string; // ISO date string
}

// --- Badge System ---
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name
  unlockedAt?: string; // ISO date string (undefined if locked)
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// --- Active Flashcards (Now with Challenge Mode) ---
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mode: 'mcq' | 'vf' | 'classic';
  // For Active Recall
  options?: string[]; // If MCQ
  correctOptionIndex?: number;
  vfStatement?: string; // For True/False
  isTrue?: boolean;
  sourceSnippet?: string; // Layer 4: Transparency
  // Spaced Repetition
  nextReviewDate?: string; // ISO date string
  srMetadata?: SpacedRepetitionMetadata;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceSnippet?: string; // Layer 4: Transparency
}

export interface ClozeTest {
  textWithBlanks: string; // Use {{blank}} syntax
  answers: string[]; // Correct answers in order
}

export interface CaseStudy {
  scenario: string;
  question: string;
  options: {
    text: string;
    type: 'correct' | 'risk' | 'wrong';
    feedback: string
  }[];
  sourceSnippet?: string; // Layer 4: Transparency
  requiresJustification?: boolean; // If true, user must write why they chose that option
}

export interface SummaryActivity {
  markdownContent: string;
  correctStatements: string[]; // 3 True statements
  distractors: string[]; // 3 False statements
}

export interface MindMapNode {
  id: string;
  label: string;
  parentId?: string; // If null, it's a root node
}

export interface MindMapActivity {
  rootLabel: string;
  nodes: MindMapNode[]; // The correct structure
}

export interface ComparisonItem {
  id: string;
  text: string;
  correctColumnId: string;
  sourceSnippet?: string; // Layer 4: Transparency
}

export interface ComparisonActivity {
  columns: { id: string; label: string }[];
  items: ComparisonItem[];
}

export interface SelfExplanationActivity {
  prompt: string; // e.g., "Explain the password policy in your own words"
  sourceReference: string; // The original text to compare against
  minWords: number;
}

// --- AI Grading Result for Self-Explanation ---
export interface SelfExplanationResult {
  score: number; // 0-100
  feedback: string;
  missingPoints: string[];
  misconceptions: string[];
}

export interface CourseModule {
  id: string;
  type: ActivityType | string;
  title: string;
  description?: string;
  // Union of all possible content types
  content: Flashcard[] | QuizQuestion[] | SummaryActivity | ClozeTest | CaseStudy | MindMapActivity | ComparisonActivity | SelfExplanationActivity | Record<string, unknown>;
  isCompleted: boolean;
  score?: number; // 0 to 100. Required for completion.
  xpReward: number;
  estimatedTimeMin: number;
  // Spaced Repetition
  nextReviewDate?: string; // ISO date string for when this module should be reviewed
  srMetadata?: SpacedRepetitionMetadata;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  content?: string; // Conteúdo do curso (texto, markdown, etc)
  modules: CourseModule[];
  progress: number;
  totalXP: number;
  thumbnailUrl?: string;
  createdAt?: string;
  tags: string[];
  isRecommended?: boolean;
  status?: string;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  streakDays: number;
  coursesCompleted: number;
  rank: string;
  avatarUrl: string;
  badges: Badge[]; // Unlocked badges
  lastAccessDate: string; // ISO date string for streak calculation
  themeMode: 'light' | 'dark'; // User preference for dark mode
}

export interface Area {
  id: string;
  name: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  area: string; // Legacy field - kept for backwards compatibility
  areaId?: string;
  areaName?: string;
  managerId: string;
  stats: {
    memberCount: number;
    avgCompletionRate: number;
    avgSimulationScore: number;
  };
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  teamId: string;
  avatarUrl: string;
  totalXP: number;
  level: number;
  streakDays: number;
  coursesAssigned: number;
  coursesCompleted: number;
  coursesLate: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  collaboratorId: string;
  isRequired: boolean;
  assignedAt: string;
  dueDate?: string;
  status: EnrollmentStatus;
  progress: number;
  finalScore?: number;
  lastAccessAt?: string;
}

export interface Role {
  id: string;
  name: string;
  teamId?: string;
  description?: string;
}

export interface CollaboratorInput {
  name: string;
  email: string;
  cpf?: string;
  role?: string;
  teamId?: string;
  avatarUrl?: string;
}

export interface TeamInput {
  name: string;
  area?: string;
  managerId?: string;
}

export interface RoleInput {
  name: string;
}

export interface EnrollmentInput {
  courseId: string;
  collaboratorId: string;
  isRequired?: boolean;
  status?: EnrollmentStatus;
  progress?: number;
  finalScore?: number;
  assignedAt?: string;
  dueDate?: string;
  lastAccessAt?: string;
}

// --- Advanced Filtering & Sorting Types ---
export type CollaboratorStatus = 'all' | 'on-track' | 'late' | 'critical' | 'inactive';

export interface CollaboratorFilters {
  search: string;
  status: CollaboratorStatus[];
  teamIds: string[];
  roleIds: string[];
  xpRange: [number, number];
  completionRateRange: [number, number];
  levels: number[];
  minStreak: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'team' | 'role' | 'totalXP' | 'level' | 'completionRate' | 'coursesLate' | 'lastAccessAt' | 'streakDays';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export type ViewMode = 'table' | 'cards' | 'compact';

export interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  filter: Partial<CollaboratorFilters>;
}

export interface CollaboratorWithStats extends Collaborator {
  team?: Team;
  roleObj?: Role;
  completionRate: number;
  avgScore: number;
  lastAccessAt?: string;
}

export interface CheckInInput {
  userId: string;
  horasSono?: number;
  qualidadeSono?: number;
  nivelFoco: number;
  nivelEstresse: number;
  nivelFadiga?: number;
  origemDados?: string;
  dadosBrutosSensor?: string;
}

export interface BioAnalytics {
  hasData: boolean;
  lastCheckin: {
    nivelFoco: number;
    nivelEstresse: number;
    horasSono: number | null;
    qualidadeSono: number | null;
    dataHora: string;
  } | null;
  weeklyAvg: {
    foco: number;
    estresse: number;
    horasSono: number | null;
    qualidadeSono: number | null;
  } | null;
  trends: {
    foco: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
    estresse: {
      direction: 'up' | 'down' | 'stable';
      percentage: number;
    };
  } | null;
  healthScore: number | null;
  alerts: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    value: number;
  }>;
  patterns: {
    bestDay: {
      day: string | null;
      avgFocus: number | null;
    };
    bestHour: {
      hour: number | null;
      avgFocus: number | null;
    };
  } | null;
  correlations: {
    completionRate: number;
    avgFocus: number;
    interpretation: string | null;
  } | null;
}
