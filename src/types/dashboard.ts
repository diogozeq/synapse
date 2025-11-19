// Tipos para os dados do dashboard

export interface CollaboratorDashboardData {
  stats: {
    xp: number;
    nivel: number;
    streak: number;
    avatarUrl?: string;
    nome: string;
    xpForNextLevel: number;
    xpProgressInLevel: number;
    xpPercentageInLevel: number;
    cursos: {
      emAndamento: number;
      atrasados: number;
      concluidos: number;
      naoIniciados: number;
      total: number;
      progressoMedio: number;
    };
  };
  ranking: {
    posicao: number;
    total: number;
    top3: Array<{
      nome: string;
      avatarUrl?: string;
      totalXp: number;
      nivel: number;
      posicao: number;
    }>;
    xpDoLider: number;
    xpParaProximo: number;
  } | null;
  checkinBio: {
    nivelFoco: number;
    nivelEstresse: number;
    horasSono: number;
    qualidadeSono: number;
    dataHora: string;
  } | null;
  cursosAtivos: Array<{
    id: string;
    cursoId: string;
    titulo: string;
    thumbnailUrl?: string;
    progresso: number;
    status: string;
    prazo?: string;
    ultimoAcesso?: string;
    ehObrigatorio: boolean;
  }>;
  cursosRecomendados: Array<{
    id: string;
    titulo: string;
    descricao?: string;
    categoria?: string;
    thumbnailUrl?: string;
    tipoCurso?: string;
  }>;
}

export interface ManagerDashboardData {
  kpis: {
    totalColaboradores: number;
    taxaConclusao: number;
    cursosAtrasados: number;
    mediaProgresso: number;
  };
  distribuicaoStatus: {
    NAO_INICIADO: number;
    EM_ANDAMENTO: number;
    CONCLUIDO: number;
    ATRASADO: number;
    REPROVADO_SIMULADO: number;
  };
  alertas: {
    atrasados: Array<{
      id: string;
      nome: string;
      avatarUrl?: string;
      cursosAtrasados: number;
    }>;
    prazosProximos: Array<{
      nomeUsuario: string;
      tituloCurso: string;
      prazo: string;
      diasRestantes: number;
    }>;
    reprovados: Array<{
      nomeUsuario: string;
      tituloCurso: string;
      notaFinal?: number;
    }>;
  };
  performance: {
    top5: Array<{
      nome: string;
      totalXp: number;
      nivel: number;
      avatarUrl?: string;
    }>;
    bottom5: Array<{
      nome: string;
      totalXp: number;
      nivel: number;
      avatarUrl?: string;
    }>;
  };
  bemEstar: {
    focoMedio: number;
    stressMedio: number;
  };
  neuroPredictor?: {
    trainedAt: string | null;
    datasetSize: number;
    confidence: number;
    stressAverage: number;
    orgProjection: {
      stress: number;
      focus: number;
    };
    teamHeatmap: Array<{
      teamId: string;
      teamName: string;
      stressRisk: number;
      focusScore: number;
      recommendation: string;
    }>;
    topSignals: Array<{
      label: string;
      impact: number;
      action: string;
    }>;
  };
  socialImpact?: {
    esgRadar: {
      sustainablePace: number;
      greenLearningHours: number;
      missionsCompleted: number;
      carbonAlerts: number;
    };
    inclusionPulse: {
      belongingIndex: number;
      diversityIndex: number;
      agentStories: number;
    };
    talentEquity: {
      equityRatio: number;
      optionalTracks: number;
      fastTrackers: number;
    };
    botAssistants: {
      activeSessions: number;
      coverage: number;
      signatureUseCases: string[];
    };
  };
  equipes: Array<{
    nome: string;
    totalColaboradores: number;
    taxaConclusao: number;
    cursosAtrasados: number;
    xpMedio: number;
  }>;
  timeline: Array<{
    acao: string;
    detalhes?: string;
    dataHora: string;
    usuarioNome: string;
  }>;
}
