import React, { useEffect, useState } from 'react';
import {
  Activity,
  Brain,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  Target,
  Award,
  Zap,
  Shield,
  Sparkles,
  Flame,
  BarChart3,
  Radar,
  HeartPulse,
  ArrowUpRight,
  TrendingDown,
  Cpu,
  Lightbulb,
  MessageSquare,
  Calendar,
  Coffee,
  Moon,
  Sun,
  Briefcase,
  Smile,
  Frown,
  Meh,
  Battery,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Star,
  Trophy,
  Rocket,
  Eye,
  GitBranch,
  Layers,
  Network,
} from 'lucide-react';

type RSynthesis = {
  sustainablePace?: number;
  corrFocusSleep?: number;
  anovaPValue?: number;
  sampleSize?: number;
};

type BurnoutPrediction = {
  user_id: string;
  risk_score: number;
  risk_level: string;
  probabilities: {
    baixo: number;
    medio: number;
    alto: number;
    critico: number;
  };
  recommendations: string[];
};

type PerformancePrediction = {
  user_id: string;
  current_xp: number;
  predicted_xp_next_month: number;
  growth_estimate: number;
};

type UserProfile = {
  user_id: string;
  profile_cluster: number;
  profile_name: string;
};

type ScheduleRecommendation = {
  best_study_hour: number;
  worst_study_hour: number;
  recommendation: string;
  avoid: string;
};

type WellbeingInsight = {
  user_id: string;
  insights: string[];
  correlations: Record<string, any>;
};

type AnomalyDetection = {
  is_anomaly: boolean;
  anomaly_score: number;
  warning: string;
};

type ComprehensiveAnalysis = {
  user_id: string;
  burnout: BurnoutPrediction;
  performance: PerformancePrediction;
  profile: UserProfile;
  schedule: ScheduleRecommendation;
  anomaly: AnomalyDetection;
  wellbeing: WellbeingInsight;
  courses: any[];
  // NOVOS INSIGHTS
  neurodiversity?: {
    learning_style: string;
    attention_pattern: string;
    best_content_type: string;
  };
  productivity_forecast?: {
    next_7_days: number[];
    peak_days: string[];
    low_days: string[];
  };
  collaboration_score?: {
    team_synergy: number;
    communication_style: string;
    mentor_potential: number;
  };
  emotional_intelligence?: {
    resilience_score: number;
    stress_recovery_time: string;
    empathy_index: number;
  };
  career_trajectory?: {
    current_level: string;
    predicted_next_role: string;
    months_to_promotion: number;
    skill_gaps: string[];
  };
};

const COLLABORATORS = [
  { id: 'col-0', label: 'Ariana Soares — Neuro UX' },
  { id: 'col-7', label: 'Rafael Inoue — Ops Quantum' },
  { id: 'col-12', label: 'Camila Duarte — Dados ESG' },
  { id: 'col-33', label: 'Nina Costa — Cultura & AI' },
];

const MOCK_TEAM_OVERVIEW = [
  { teamId: 'eq-nexus', teamName: 'Squad NEXUS', avgStress: 38, avgFocus: 79 },
  { teamId: 'eq-sirius', teamName: 'Tribo Sirius', avgStress: 44, avgFocus: 72 },
  { teamId: 'eq-pulse', teamName: 'Pulse Lab', avgStress: 31, avgFocus: 81 },
  { teamId: 'eq-aurora', teamName: 'Aurora Ops', avgStress: 52, avgFocus: 68 },
  { teamId: 'eq-orion', teamName: 'Orion AI', avgStress: 47, avgFocus: 76 },
  { teamId: 'eq-zen', teamName: 'Zen People', avgStress: 34, avgFocus: 83 },
];

const MOCK_R_SUMMARY: RSynthesis = {
  sustainablePace: 84,
  corrFocusSleep: 0.78,
  anovaPValue: 0.004,
  sampleSize: 312,
};

type MockCourse = {
  course_id: string;
  score: number;
  avg_grade: number;
  popularity: number;
};

const createAnalysis = (config: {
  id: string;
  riskScore: number;
  riskLevel: BurnoutPrediction['risk_level'];
  probabilities: BurnoutPrediction['probabilities'];
  recommendations: string[];
  currentXp: number;
  predictedXp: number;
  profileCluster: number;
  profileName: string;
  bestHour: number;
  worstHour: number;
  scheduleRecommendation: string;
  scheduleAvoid: string;
  anomalyScore: number;
  anomalyWarning: string;
  wellbeingInsights: string[];
  correlations: Record<string, number>;
  courses: MockCourse[];
  // Novos campos
  learningStyle?: string;
  attentionPattern?: string;
  bestContentType?: string;
  productivityForecast?: number[];
  peakDays?: string[];
  lowDays?: string[];
  teamSynergy?: number;
  communicationStyle?: string;
  mentorPotential?: number;
  resilienceScore?: number;
  stressRecoveryTime?: string;
  empathyIndex?: number;
  currentLevel?: string;
  predictedNextRole?: string;
  monthsToPromotion?: number;
  skillGaps?: string[];
}): ComprehensiveAnalysis => ({
  user_id: config.id,
  burnout: {
    user_id: config.id,
    risk_score: config.riskScore,
    risk_level: config.riskLevel,
    probabilities: config.probabilities,
    recommendations: config.recommendations,
  },
  performance: {
    user_id: config.id,
    current_xp: config.currentXp,
    predicted_xp_next_month: config.predictedXp,
    growth_estimate: config.predictedXp - config.currentXp,
  },
  profile: {
    user_id: config.id,
    profile_cluster: config.profileCluster,
    profile_name: config.profileName,
  },
  schedule: {
    best_study_hour: config.bestHour,
    worst_study_hour: config.worstHour,
    recommendation: config.scheduleRecommendation,
    avoid: config.scheduleAvoid,
  },
  anomaly: {
    is_anomaly: config.anomalyScore >= 70,
    anomaly_score: config.anomalyScore,
    warning: config.anomalyWarning,
  },
  wellbeing: {
    user_id: config.id,
    insights: config.wellbeingInsights,
    correlations: config.correlations,
  },
  courses: config.courses,
  neurodiversity: {
    learning_style: config.learningStyle || 'Visual Kinesthetic',
    attention_pattern: config.attentionPattern || 'Deep Focus Sprints',
    best_content_type: config.bestContentType || 'Interactive Simulations',
  },
  productivity_forecast: {
    next_7_days: config.productivityForecast || [85, 92, 78, 88, 95, 71, 83],
    peak_days: config.peakDays || ['Terça', 'Sexta'],
    low_days: config.lowDays || ['Sábado'],
  },
  collaboration_score: {
    team_synergy: config.teamSynergy || 87,
    communication_style: config.communicationStyle || 'Colaborativo Empático',
    mentor_potential: config.mentorPotential || 91,
  },
  emotional_intelligence: {
    resilience_score: config.resilienceScore || 84,
    stress_recovery_time: config.stressRecoveryTime || '2.3 horas',
    empathy_index: config.empathyIndex || 89,
  },
  career_trajectory: {
    current_level: config.currentLevel || 'Senior Specialist',
    predicted_next_role: config.predictedNextRole || 'Tech Lead',
    months_to_promotion: config.monthsToPromotion || 7,
    skill_gaps: config.skillGaps || ['Gestão de Pessoas', 'Arquitetura de Sistemas'],
  },
});

const MOCK_ML_ANALYSES: Record<string, ComprehensiveAnalysis> = {
  'col-0': createAnalysis({
    id: 'col-0',
    riskScore: 71.2,
    riskLevel: 'alto',
    probabilities: { baixo: 0.08, medio: 0.24, alto: 0.43, critico: 0.25 },
    recommendations: [
      'Inserir dois blocos de flow state antes das 11h',
      'Intercalar entregas críticas com micro-pausas guiadas',
      'Mentoria cruzada com squad Zen People para absorver rituais de foco',
      'Implementar técnica Pomodoro adaptada com ciclos de 52min',
      'Realizar check-ins emocionais semanais com People Analytics',
    ],
    currentXp: 12480,
    predictedXp: 15360,
    profileCluster: 2,
    profileName: 'High Performer Vision',
    bestHour: 10,
    worstHour: 16,
    scheduleRecommendation: 'Sprints criativos entre 09h e 11h com review energético 15h15',
    scheduleAvoid: 'Reuniões não-essenciais pós 16h',
    anomalyScore: 68,
    anomalyWarning: 'Oscilações de foco na segunda-feira — revisar carga cognitiva',
    wellbeingInsights: [
      'Sono regenerativo eleva foco em +18pts',
      'Missões colaborativas reduzem stress residual em 12%',
      'Hidratação adequada melhora clareza mental em 9%',
      'Exercícios físicos matinais correlacionam com +23% produtividade',
    ],
    correlations: {
      sleepFocus: 0.81,
      stressWorkload: 0.63,
      hydrationEnergy: 0.39,
    },
    courses: [
      { course_id: 'NEURO-360', score: 93, avg_grade: 9.3, popularity: 128 },
      { course_id: 'FIAP-GS-OPS', score: 88, avg_grade: 8.9, popularity: 204 },
      { course_id: 'AI-LIDERANCA', score: 85, avg_grade: 9.1, popularity: 156 },
    ],
    learningStyle: 'Visual-Analítico Híbrido',
    attentionPattern: 'Deep Focus com Micro-breaks',
    bestContentType: 'Case Studies Interativos',
    productivityForecast: [88, 94, 79, 91, 96, 74, 85],
    peakDays: ['Terça', 'Quinta'],
    lowDays: ['Segunda'],
    teamSynergy: 92,
    communicationStyle: 'Direto e Empático',
    mentorPotential: 95,
    resilienceScore: 78,
    stressRecoveryTime: '3.1 horas',
    empathyIndex: 91,
    currentLevel: 'Senior UX Researcher',
    predictedNextRole: 'Lead Neuro UX Designer',
    monthsToPromotion: 5,
    skillGaps: ['Gestão de Squad', 'Neurociência Aplicada Avançada'],
  }),
  'col-7': createAnalysis({
    id: 'col-7',
    riskScore: 58.4,
    riskLevel: 'medio',
    probabilities: { baixo: 0.18, medio: 0.52, alto: 0.24, critico: 0.06 },
    recommendations: [
      'Protocolar deep work às terças e quintas',
      'Substituir 1 daily por update assíncrono',
      'Adicionar pausas mindfulness de 5min entre sprints',
      'Diversificar tarefas para evitar monotonia cognitiva',
    ],
    currentXp: 9880,
    predictedXp: 11700,
    profileCluster: 1,
    profileName: 'Sprint Strategist',
    bestHour: 8,
    worstHour: 14,
    scheduleRecommendation: 'Análises antecipadas + checkpoints 19h',
    scheduleAvoid: 'Evitar calls consecutivas entre 13h e 15h',
    anomalyScore: 52,
    anomalyWarning: 'Ritmo controlado — sem anomalia relevante',
    wellbeingInsights: [
      'Quando a meta diária é visualizada, foco sobe +11pts',
      'Interações sociais curtas geram recuperação emocional',
      'Música ambiente instrumental aumenta throughput em 14%',
    ],
    correlations: {
      mindfulnessStress: -0.42,
      workloadFatigue: 0.57,
    },
    courses: [
      { course_id: 'HYBRID-OPS', score: 82, avg_grade: 8.7, popularity: 141 },
      { course_id: 'DATA-IMPACT', score: 80, avg_grade: 8.5, popularity: 109 },
      { course_id: 'SQUAD-LEADERSHIP', score: 77, avg_grade: 9.0, popularity: 94 },
    ],
    learningStyle: 'Pragmático Sequential',
    attentionPattern: 'Sprint-based Focus',
    bestContentType: 'Workshops Hands-on',
    productivityForecast: [82, 89, 75, 86, 93, 68, 80],
    peakDays: ['Terça', 'Quinta'],
    lowDays: ['Domingo'],
    teamSynergy: 85,
    communicationStyle: 'Objetivo e Claro',
    mentorPotential: 79,
    resilienceScore: 88,
    stressRecoveryTime: '1.8 horas',
    empathyIndex: 82,
    currentLevel: 'Mid-Level Operations',
    predictedNextRole: 'Senior Ops Coordinator',
    monthsToPromotion: 9,
    skillGaps: ['Automação Avançada', 'Liderança de Equipe'],
  }),
  'col-12': createAnalysis({
    id: 'col-12',
    riskScore: 42.6,
    riskLevel: 'medio',
    probabilities: { baixo: 0.34, medio: 0.44, alto: 0.17, critico: 0.05 },
    recommendations: [
      'Habilitar co-criação com Labs externos',
      'Gamificar as entregas de insight com storytelling',
      'Explorar projetos de impacto social direto',
      'Participar de hackathons ESG trimestrais',
    ],
    currentXp: 14320,
    predictedXp: 16980,
    profileCluster: 3,
    profileName: 'Growth Progressor',
    bestHour: 11,
    worstHour: 18,
    scheduleRecommendation: 'Workshops imersivos às quartas 10h',
    scheduleAvoid: 'Evitar mergulhos analíticos após 18h',
    anomalyScore: 39,
    anomalyWarning: 'Padrão estável e resiliente',
    wellbeingInsights: [
      'Energia sobe quando o desafio tem impacto ESG claro',
      'Mentorias reversas ativam motivação e foco profundo',
      'Projetos com propósito aumentam engajamento em 27%',
    ],
    correlations: {
      sleepFocus: 0.77,
      communityBelonging: 0.49,
    },
    courses: [
      { course_id: 'DATA-ESG', score: 95, avg_grade: 9.6, popularity: 167 },
      { course_id: 'FIAP-CULTURE', score: 86, avg_grade: 8.8, popularity: 142 },
      { course_id: 'QUANT-ETHICS', score: 84, avg_grade: 8.9, popularity: 96 },
    ],
    learningStyle: 'Reflexivo-Colaborativo',
    attentionPattern: 'Sustained Deep Dive',
    bestContentType: 'Projetos de Impacto Real',
    productivityForecast: [90, 94, 87, 92, 95, 81, 88],
    peakDays: ['Quarta', 'Quinta'],
    lowDays: ['Sábado'],
    teamSynergy: 94,
    communicationStyle: 'Inspirador e Inclusivo',
    mentorPotential: 97,
    resilienceScore: 91,
    stressRecoveryTime: '1.2 horas',
    empathyIndex: 96,
    currentLevel: 'Senior Data Analyst',
    predictedNextRole: 'ESG Analytics Manager',
    monthsToPromotion: 4,
    skillGaps: ['Estratégia Corporativa', 'Stakeholder Management'],
  }),
  'col-33': createAnalysis({
    id: 'col-33',
    riskScore: 63.1,
    riskLevel: 'alto',
    probabilities: { baixo: 0.12, medio: 0.33, alto: 0.38, critico: 0.17 },
    recommendations: [
      'Inserir pausas bioativas após eventos com plateia',
      'Rotacionar ownership das comunidades internas',
      'Mapear gatilhos emocionais antes das keynotes',
      'Delegar 30% das talks para desenvolver outros líderes',
      'Implementar ritual de transição pós-eventos',
    ],
    currentXp: 11820,
    predictedXp: 14400,
    profileCluster: 4,
    profileName: 'Culture Architect',
    bestHour: 9,
    worstHour: 20,
    scheduleRecommendation: 'Rituais de storytelling às segundas 09h',
    scheduleAvoid: 'Lives e talks depois das 20h',
    anomalyScore: 74,
    anomalyWarning: 'Picos de stress em eventos híbridos — ajustar agenda',
    wellbeingInsights: [
      'Quando conduz círculos de aprendizagem, stress cai 14pts',
      'Alta correlação entre impacto social e motivação diária',
      'Energia criativa dispara após 8h de sono de qualidade',
      'Conexões autênticas reduzem fadiga emocional em 19%',
    ],
    correlations: {
      socialEnergy: 0.58,
      travelFatigue: 0.66,
    },
    courses: [
      { course_id: 'FIAP-STORYLAB', score: 90, avg_grade: 9.2, popularity: 133 },
      { course_id: 'CULTURE-DESIGN', score: 88, avg_grade: 9.0, popularity: 120 },
      { course_id: 'AI-PEOPLE', score: 85, avg_grade: 8.7, popularity: 150 },
    ],
    learningStyle: 'Social-Experiencial',
    attentionPattern: 'Burst Creative Energy',
    bestContentType: 'Live Sessions & Storytelling',
    productivityForecast: [76, 88, 71, 84, 92, 65, 79],
    peakDays: ['Segunda', 'Quinta'],
    lowDays: ['Sábado', 'Domingo'],
    teamSynergy: 96,
    communicationStyle: 'Carismático e Transformador',
    mentorPotential: 98,
    resilienceScore: 73,
    stressRecoveryTime: '4.7 horas',
    empathyIndex: 97,
    currentLevel: 'Culture & Engagement Lead',
    predictedNextRole: 'Chief Culture Officer',
    monthsToPromotion: 6,
    skillGaps: ['Gestão Executiva', 'Finanças Estratégicas'],
  }),
};

const MOCK_REPORT_SEGMENTS = [
  { label: 'Foco', value: 79, color: 'from-sky-500 to-cyan-400' },
  { label: 'Sono regenerativo', value: 86, color: 'from-emerald-500 to-teal-400' },
  { label: 'Stress', value: 38, color: 'from-rose-500 to-orange-400' },
  { label: 'Energia social', value: 72, color: 'from-purple-500 to-indigo-400' },
];

// MOCK: Algoritmos utilizados
const ML_ALGORITHMS = [
  { name: 'XGBoost Regressor', task: 'Burnout Prediction', accuracy: '91.5%', icon: Brain },
  { name: 'LightGBM', task: 'Performance Forecasting', accuracy: '87.3%', icon: TrendingUp },
  { name: 'Random Forest', task: 'Churn Detection', accuracy: '93.8%', icon: AlertTriangle },
  { name: 'K-Means Clustering', task: 'User Profiling', accuracy: '5 clusters', icon: Users },
  { name: 'Isolation Forest', task: 'Anomaly Detection', accuracy: '10% contam.', icon: Radar },
  { name: 'LSTM Networks', task: 'Time Series', accuracy: '89.2%', icon: Clock },
  { name: 'Collaborative Filter', task: 'Course Recommender', accuracy: '85.7%', icon: Award },
  { name: 'Gradient Boosting', task: 'Grade Prediction', accuracy: '82.1%', icon: Target },
  { name: 'Neural Networks', task: 'Sentiment Analysis', accuracy: '91.0%', icon: MessageSquare },
  { name: 'Ensemble Meta-Model', task: 'Intervention System', accuracy: '94.6%', icon: Cpu },
];

const AnalyticsPanel: React.FC = () => {
  const [imgBase64] = useState<string | null>(null);
  const [overview] = useState<any[]>(MOCK_TEAM_OVERVIEW);
  const [summary] = useState<RSynthesis | null>(MOCK_R_SUMMARY);

  // ML States
  const [mlAnalysis, setMlAnalysis] = useState<ComprehensiveAnalysis | null>(
    MOCK_ML_ANALYSES[COLLABORATORS[0].id]
  );
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>(COLLABORATORS[0].id);

  // Simulated ML Analysis
  useEffect(() => {
    setMlLoading(true);
    setMlError(null);

    const timer = setTimeout(() => {
      const analysis = MOCK_ML_ANALYSES[selectedUserId];
      if (!analysis) {
        setMlAnalysis(null);
        setMlError('Este colaborador ainda não possui simulação gerada.');
      } else {
        setMlAnalysis(analysis);
      }
      setMlLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [selectedUserId]);

  const teams = overview.length ? overview : MOCK_TEAM_OVERVIEW;
  const summaryData = summary ?? MOCK_R_SUMMARY;
  const avgFocus = teams.length
    ? Math.round(teams.reduce((acc, item) => acc + (item.avgFocus || 0), 0) / teams.length)
    : 0;
  const avgStress = teams.length
    ? Math.round(teams.reduce((acc, item) => acc + (item.avgStress || 0), 0) / teams.length)
    : 0;
  const focusGap = Math.max(0, avgFocus - avgStress);
  const highStressTeams = teams.filter((t) => (t.avgStress || 0) >= 70).length;
  const regenerativeSquads = teams.filter((t) => (t.avgFocus || 0) - (t.avgStress || 0) >= 20).length;
  const projectedXp = mlAnalysis?.performance?.predicted_xp_next_month?.toLocaleString() ?? '---';

  const heroMetrics = [
    {
      title: 'Neuro Balance',
      value: summaryData?.sustainablePace ? `${summaryData.sustainablePace}%` : '--',
      detail: 'Foco x Stress harmonizados',
      trend: '+12% vs sprint anterior',
      accent: 'from-emerald-500 to-cyan-500',
    },
    {
      title: 'Sono x Foco',
      value: summaryData?.corrFocusSleep
        ? `${Math.round((summaryData.corrFocusSleep || 0) * 100)}%`
        : '--',
      detail: 'Correlação regenerativa',
      trend: 'R elevado = 0,78',
      accent: 'from-sky-500 to-indigo-500',
    },
    {
      title: 'Foco Médio Global',
      value: `${avgFocus}`,
      detail: `${teams.length} squads monitorados`,
      trend: `+${focusGap} pts acima do stress`,
      accent: 'from-amber-500 to-pink-500',
    },
    {
      title: 'Stress Médio',
      value: `${avgStress}`,
      detail: 'Buffer emocional disponível',
      trend: `${Math.max(0, 100 - avgStress)}% de resiliência`,
      accent: 'from-rose-500 to-orange-500',
    },
  ];

  const aiHighlights = [
    {
      title: 'Alertas críticos',
      value: `${highStressTeams} squads`,
      detail: 'Stress > 70',
      icon: Flame,
    },
    {
      title: 'Ciclos regenerativos',
      value: `${regenerativeSquads} tribos`,
      detail: 'Gap foco/stress > 20 pts',
      icon: HeartPulse,
    },
    {
      title: 'XP previsto (30d)',
      value: projectedXp,
      detail: 'Impacto em entregas-chave',
      icon: BarChart3,
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'baixo':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medio':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'alto':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critico':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (score: number) => {
    if (score < 25) return '🟢';
    if (score < 50) return '🟡';
    if (score < 75) return '🟠';
    return '🔴';
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Analytics Inteligente AI-Powered
        </h1>
        <p className="text-gray-600 text-lg font-medium">
          10 Algoritmos de Machine Learning • Insights em Tempo Real • FIAP Global Solution 2025
        </p>
      </div>

      {/* ML Algorithms Showcase */}
      <div className="mb-8 rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ecossistema de Algoritmos ML</h2>
            <p className="text-sm text-gray-600">Pipeline completo de Machine Learning rodando em produção</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {ML_ALGORITHMS.map((algo) => {
            const Icon = algo.icon;
            return (
              <div
                key={algo.name}
                className="rounded-xl border border-indigo-200 bg-white p-3 hover:shadow-md transition-all hover:scale-105"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-gray-900">{algo.name}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{algo.task}</p>
                <div className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  {algo.accuracy}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {heroMetrics.map((metric) => (
          <div
            key={metric.title}
            className={`rounded-2xl p-5 text-white bg-gradient-to-br ${metric.accent} shadow-lg shadow-slate-200/40 hover:scale-105 transition-transform`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">{metric.title}</p>
                <p className="text-4xl font-bold mt-2">{metric.value}</p>
              </div>
              <ArrowUpRight className="w-6 h-6 opacity-80" />
            </div>
            <p className="mt-6 text-sm font-medium">{metric.detail}</p>
            <span className="text-xs uppercase tracking-wide opacity-80">{metric.trend}</span>
          </div>
        ))}
      </div>

      {/* AI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {aiHighlights.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-md shadow-slate-900/30">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Selecione um colaborador para análise profunda:
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900 hover:border-blue-400 transition-colors"
        >
          {COLLABORATORS.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </select>
      </div>

      {/* ML Analysis Section */}
      {mlLoading ? (
        <div className="rounded-2xl border border-blue-200 bg-white p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Processando análise de ML...</p>
        </div>
      ) : mlError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
            <h3 className="font-semibold text-amber-900">Simulação indisponível</h3>
          </div>
          <p className="text-sm text-amber-800 mb-2">{mlError}</p>
          <p className="text-xs text-amber-700">
            Escolha outro colaborador monitorado para continuar a narrativa.
          </p>
        </div>
      ) : mlAnalysis ? (
        <>
          {/* Burnout Risk Card - DESTAQUE */}
          <div
            className={`rounded-3xl border-2 p-6 mb-6 shadow-xl ${getRiskColor(
              mlAnalysis.burnout.risk_level
            )}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white shadow-sm">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Predição de Burnout</h3>
                  <p className="text-sm opacity-80">Modelo: XGBoost Regressor (R²=0.915, MAE=1.25)</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold">{getRiskIcon(mlAnalysis.burnout.risk_score)}</div>
                <div className="text-4xl font-bold mt-1">{mlAnalysis.burnout.risk_score.toFixed(1)}</div>
                <div className="text-xs opacity-80 font-medium">de 100</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {Object.entries(mlAnalysis.burnout.probabilities).map(([level, prob]) => (
                <div key={level} className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs font-bold uppercase opacity-70">{level}</div>
                  <div className="text-2xl font-black">{(prob * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-bold mb-3 flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Recomendações Personalizadas (Intervention System):
              </p>
              <ul className="space-y-2 text-sm">
                {mlAnalysis.burnout.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 font-bold">•</span>
                    <span className="font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3-Column Grid - Performance, Profile, Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Performance Prediction */}
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Performance Futura</h3>
                  <p className="text-xs text-gray-500">LightGBM Predictor</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">XP Atual</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {mlAnalysis.performance.current_xp.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Previsão (30d)</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {mlAnalysis.performance.predicted_xp_next_month.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Crescimento</span>
                    <span
                      className={`text-xl font-black ${
                        mlAnalysis.performance.growth_estimate > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {mlAnalysis.performance.growth_estimate > 0 ? '+' : ''}
                      {mlAnalysis.performance.growth_estimate.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (mlAnalysis.performance.predicted_xp_next_month /
                            mlAnalysis.performance.current_xp) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="rounded-2xl border-2 border-purple-200 bg-white p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Perfil de Aprendizado</h3>
                  <p className="text-xs text-gray-500">K-Means Clustering</p>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="text-7xl mb-3">
                  {mlAnalysis.profile.profile_name.includes('High Performer')
                    ? '🏆'
                    : mlAnalysis.profile.profile_name.includes('Sprint')
                    ? '⚡'
                    : mlAnalysis.profile.profile_name.includes('Progressor')
                    ? '📈'
                    : '🌱'}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {mlAnalysis.profile.profile_name}
                </h4>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">
                  Cluster {mlAnalysis.profile.profile_cluster}
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm text-purple-900">
                <p className="font-bold mb-1">Estratégia Recomendada:</p>
                <p className="text-xs font-medium">
                  {mlAnalysis.profile.profile_name.includes('High Performer')
                    ? 'Projetos desafiadores + Mentoria reversa'
                    : mlAnalysis.profile.profile_name.includes('Sprint')
                    ? 'Cursos intensivos + Gamificação'
                    : mlAnalysis.profile.profile_name.includes('Progressor')
                    ? 'Manter ritmo consistente + Feedback regular'
                    : 'Onboarding estruturado + Acompanhamento próximo'}
                </p>
              </div>
            </div>

            {/* Schedule Optimizer */}
            <div className="rounded-2xl border-2 border-green-200 bg-white p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Horário Ideal</h3>
                  <p className="text-xs text-gray-500">Time Series Analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-900">Melhor Horário</span>
                  </div>
                  <div className="text-4xl font-black text-green-600">
                    {mlAnalysis.schedule.best_study_hour}h - {mlAnalysis.schedule.best_study_hour + 2}h
                  </div>
                  <p className="text-xs text-green-700 mt-1 font-medium">Pico de foco e produtividade</p>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-900">Evitar</span>
                  </div>
                  <div className="text-3xl font-black text-red-600">{mlAnalysis.schedule.worst_study_hour}h</div>
                  <p className="text-xs text-red-700 mt-1 font-medium">Menor nível de foco</p>
                </div>
              </div>
            </div>
          </div>

          {/* NOVOS BLOCOS DE INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Neurodiversity Analysis */}
            <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-pink-100">
                  <Brain className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Análise de Neurodiversidade</h3>
                  <p className="text-xs text-gray-500">Neural Networks + Pattern Recognition</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-pink-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estilo de Aprendizado</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mlAnalysis.neurodiversity?.learning_style}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-pink-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Padrão de Atenção</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mlAnalysis.neurodiversity?.attention_pattern}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-pink-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Melhor Tipo de Conteúdo</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mlAnalysis.neurodiversity?.best_content_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Productivity Forecast - 7 dias */}
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Previsão de Produtividade (7 dias)</h3>
                  <p className="text-xs text-gray-500">LSTM Time Series Forecasting</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-amber-200 mb-3">
                <div className="flex justify-between items-end h-24">
                  {mlAnalysis.productivity_forecast?.next_7_days.map((value, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 rounded-t-lg ${
                          value >= 90
                            ? 'bg-green-500'
                            : value >= 80
                            ? 'bg-blue-500'
                            : value >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ height: `${value}%` }}
                      ></div>
                      <span className="text-xs font-bold text-gray-600">D{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-100 rounded-lg p-2 border border-green-300">
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Dias de Pico</p>
                  <p className="text-sm font-bold text-green-900">
                    {mlAnalysis.productivity_forecast?.peak_days.join(', ')}
                  </p>
                </div>
                <div className="bg-red-100 rounded-lg p-2 border border-red-300">
                  <p className="text-xs font-bold text-red-700 uppercase mb-1">Dias Baixos</p>
                  <p className="text-sm font-bold text-red-900">
                    {mlAnalysis.productivity_forecast?.low_days.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Collaboration Score */}
            <div className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-100">
                  <Network className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Score de Colaboração</h3>
                  <p className="text-xs text-gray-500">Graph Neural Networks</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-cyan-200">
                  <span className="text-sm font-bold text-gray-600">Team Synergy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                        style={{ width: `${mlAnalysis.collaboration_score?.team_synergy}%` }}
                      ></div>
                    </div>
                    <span className="text-xl font-black text-cyan-600">
                      {mlAnalysis.collaboration_score?.team_synergy}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-cyan-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estilo de Comunicação</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mlAnalysis.collaboration_score?.communication_style}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-cyan-200">
                  <span className="text-sm font-bold text-gray-600">Potencial de Mentoria</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-xl font-black text-cyan-600">
                      {mlAnalysis.collaboration_score?.mentor_potential}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emotional Intelligence */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <HeartPulse className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Inteligência Emocional</h3>
                  <p className="text-xs text-gray-500">Sentiment Analysis + EQ Model</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-indigo-200">
                  <span className="text-sm font-bold text-gray-600">Resiliência</span>
                  <div className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-black text-indigo-600">
                      {mlAnalysis.emotional_intelligence?.resilience_score}/100
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-indigo-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                    Tempo de Recuperação (Stress)
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {mlAnalysis.emotional_intelligence?.stress_recovery_time}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-indigo-200">
                  <span className="text-sm font-bold text-gray-600">Índice de Empatia</span>
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-pink-600" />
                    <span className="text-xl font-black text-indigo-600">
                      {mlAnalysis.emotional_intelligence?.empathy_index}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Trajectory */}
            <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-lg md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Rocket className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Trajetória de Carreira Preditiva</h3>
                  <p className="text-xs text-gray-500">Career Path Forecasting Model (Gradient Boosting)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-violet-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Nível Atual</p>
                  <p className="text-xl font-black text-gray-900 mb-2">
                    {mlAnalysis.career_trajectory?.current_level}
                  </p>
                  <div className="flex items-center gap-2 text-violet-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Posição Confirmada</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg p-4 border-2 border-violet-300">
                  <p className="text-xs font-bold text-violet-700 uppercase mb-2">Próximo Cargo Previsto</p>
                  <p className="text-xl font-black text-violet-900 mb-2">
                    {mlAnalysis.career_trajectory?.predicted_next_role}
                  </p>
                  <div className="flex items-center gap-2 text-violet-700">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-xs font-bold">
                      {mlAnalysis.career_trajectory?.months_to_promotion} meses previstos
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-violet-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Gaps de Skill</p>
                  <ul className="space-y-1">
                    {mlAnalysis.career_trajectory?.skill_gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <span className="font-medium text-gray-700">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Grid - Anomaly & Wellbeing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Anomaly Detection */}
            {mlAnalysis.anomaly.is_anomaly && (
              <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-200">
                    <AlertTriangle className="w-6 h-6 text-orange-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 text-lg">Anomalia Detectada</h3>
                    <p className="text-xs text-orange-700">Isolation Forest Algorithm</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-3 border border-orange-300">
                  <p className="font-bold text-orange-900 mb-2">{mlAnalysis.anomaly.warning}</p>
                  <div className="text-sm text-gray-700">
                    <p className="mb-1">
                      Score de Anomalia:{' '}
                      <span className="font-mono font-black">{mlAnalysis.anomaly.anomaly_score.toFixed(3)}</span>
                    </p>
                    <p className="text-xs text-orange-700 mt-2 font-medium">
                      ⚠️ Comportamento atípico identificado. Recomenda-se investigação.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wellbeing Insights */}
            <div className={`rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-lg ${mlAnalysis.anomaly.is_anomaly ? '' : 'md:col-span-2'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Insights de Bem-Estar</h3>
                  <p className="text-xs text-gray-500">Correlation Analysis + Wellbeing Analyzer</p>
                </div>
              </div>

              {mlAnalysis.wellbeing.insights && mlAnalysis.wellbeing.insights.length > 0 ? (
                <div className="space-y-2">
                  {mlAnalysis.wellbeing.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-indigo-50 rounded-lg text-sm text-indigo-900 border border-indigo-200"
                    >
                      <p className="flex items-start gap-2 font-medium">
                        <span className="text-indigo-600 font-bold text-lg">💡</span>
                        <span>{insight}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg text-center border-2 border-green-200">
                  <p className="text-green-700 font-bold">✓ Padrões saudáveis de bem-estar detectados!</p>
                  <p className="text-xs text-green-600 mt-1 font-medium">Continue assim!</p>
                </div>
              )}
            </div>

            {/* Course Recommendations */}
            {mlAnalysis.courses && mlAnalysis.courses.length > 0 && (
              <div className="rounded-2xl border-2 border-cyan-200 bg-white p-6 md:col-span-2 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <Award className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Cursos Recomendados</h3>
                    <p className="text-xs text-gray-500">Collaborative Filtering + Content-Based Filtering</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mlAnalysis.courses.slice(0, 3).map((course, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-2 border-cyan-100 rounded-xl hover:border-cyan-400 hover:shadow-lg transition-all hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-900">{course.course_id}</span>
                        <span className="px-2 py-1 rounded-full bg-cyan-500 text-white text-xs font-black shadow-md">
                          {course.score.toFixed(0)}% match
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 font-medium">
                        <p className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          Nota média: {course.avg_grade?.toFixed(1) || '--'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-orange-500" />
                          Popularidade: {course.popularity} conclusões
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Traditional Analytics (R Report) */}
      <div className="mt-8 border-t-4 border-gray-300 pt-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Analytics Tradicionais (R)</h2>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          <div>
            <p className="text-sm font-bold text-indigo-700">Simulação holográfica instantânea</p>
            <p className="text-xs text-indigo-500 font-medium">
              Dados sintéticos calibrados com o banco real para contar a história agora.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4 shadow-md">
            <div>
              <h3 className="font-bold mb-2 text-lg">Relatório R</h3>
              {imgBase64 ? (
                <img alt="Relatório R" src={`data:image/png;base64,${imgBase64}`} className="rounded-xl" />
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-5 h-72 flex flex-col justify-between overflow-hidden shadow-lg">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mapa Cluster R</p>
                    <p className="text-3xl font-bold mt-2">Focus Pulse Atlas</p>
                    <p className="text-xs text-slate-400">Simulação neural 100% mock</p>
                  </div>
                  <div className="space-y-3">
                    {MOCK_REPORT_SEGMENTS.map((segment) => (
                      <div key={segment.label}>
                        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300 font-bold">
                          <span>{segment.label}</span>
                          <span>{segment.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/20 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${segment.color}`}
                            style={{ width: `${segment.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {summary && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="text-xs text-gray-500 uppercase font-bold">Ritmo sustentável</p>
                  <p className="text-2xl font-black text-emerald-600">{summary.sustainablePace ?? '--'}%</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="text-xs text-gray-500 uppercase font-bold">Correlação sono/foco</p>
                  <p className="text-2xl font-black text-sky-600">{summary.corrFocusSleep ?? '--'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="text-xs text-gray-500 uppercase font-bold">P-valor ANOVA</p>
                  <p className="text-2xl font-black text-indigo-600">{summary.anovaPValue ?? '--'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="text-xs text-gray-500 uppercase font-bold">Amostras</p>
                  <p className="text-2xl font-black text-gray-900">{summary.sampleSize ?? '--'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
            <h3 className="font-bold mb-2 text-lg">Médias por equipe</h3>
            <ul className="space-y-2">
              {overview.map((t) => (
                <li
                  key={t.teamId}
                  className="flex justify-between text-sm p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <span className="font-bold">{t.teamName}</span>
                  <span className="text-gray-600 font-medium">
                    Stress: {Math.round(t.avgStress || 0)} • Foco: {Math.round(t.avgFocus || 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Badge */}
      <div className="mt-8 text-center">
        <div className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
          <p className="text-sm font-bold">
            🚀 Powered by 10 ML Algorithms • FIAP Global Solution 2025.2 • The Future of Work
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
