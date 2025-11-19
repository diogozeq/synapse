import { Collaborator, Team, Enrollment, EnrollmentStatus, Course, ActivityType } from '../../src/types.ts';

export const TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Atendimento N1',
    area: 'Customer Success',
    managerId: 'admin-alex',
    stats: {
      memberCount: 8,
      avgCompletionRate: 82,
      avgSimulationScore: 78
    }
  },
  {
    id: 't2',
    name: 'Comercial Inside Sales',
    area: 'Vendas',
    managerId: 'admin-alex',
    stats: {
      memberCount: 6,
      avgCompletionRate: 45,
      avgSimulationScore: 60
    }
  },
  {
    id: 't3',
    name: 'Backoffice Financeiro',
    area: 'Financeiro',
    managerId: 'admin-alex',
    stats: {
      memberCount: 6,
      avgCompletionRate: 95,
      avgSimulationScore: 88
    }
  }
];

const CARGOS = ['Analista Jr', 'Analista Pl', 'Analista Sr', 'Especialista', 'Assistente'];
const NOMES = [
  'João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa',
  'Lucas Pereira', 'Juliana Souza', 'Marcos Lima', 'Fernanda Rocha',
  'Rafael Alves', 'Beatriz Dias', 'Thiago Ribeiro', 'Camila Gomes',
  'Bruno Martins', 'Larissa Carvalho', 'Rodrigo Ferreira', 'Amanda Rodrigues',
  'Guilherme Barbosa', 'Patrícia Castro', 'Gabriel Nogueira', 'Vanessa Cardoso'
];

export const COLLABORATORS: Collaborator[] = NOMES.map((nome, i) => {
  const teamIndex = i % TEAMS.length;
  const team = TEAMS[teamIndex];
  const temAtraso = i % 4 === 0;

  return {
    id: `col-${i}`,
    name: nome,
    email: `${nome.toLowerCase().replace(/\s+/g, '.')}@synapse.com`,
    role: CARGOS[i % CARGOS.length],
    teamId: team.id,
    avatarUrl: `https://i.pravatar.cc/150?u=col-${i}`,
    totalXP: Math.floor(Math.random() * 5000),
    level: Math.floor(Math.random() * 20) + 1,
    streakDays: Math.floor(Math.random() * 30),
    coursesAssigned: 4,
    coursesCompleted: temAtraso ? 1 : 3,
    coursesLate: temAtraso ? 2 : 0
  };
});

export const COURSES: Course[] = [
  {
    id: 'course-onboarding',
    title: 'Onboarding de Cultura: O Jeito Synapse',
    description: 'Mergulhe nos valores, rituais e expectativas que moldam nossa forma de trabalhar e colaborar.',
    category: 'Obrigatórios',
    tags: ['Cultura', 'RH', 'Essencial'],
    progress: 45,
    totalXP: 1200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-01-10T10:00:00.000Z',
    modules: [
      {
        id: 'onb-manifesto',
        type: ActivityType.SUMMARY,
        title: 'Manifesto de Cultura',
        description: 'Os 5 pilares da nossa empresa.',
        content: {
          markdownContent: `## Pilares Synapse

* **Transparência Radical**: Compartilhamos erros e aprendizados.
* **Cliente no Centro**: Toda decisão começa pelo impacto para o cliente.
* **Ritmo Sustentável**: Equilibramos performance e bem-estar.

## Por que importa?
Cria um ambiente seguro para inovar e garantir consistência nas decisões.`,
          correctStatements: [
            'A Transparência Radical incentiva o compartilhamento de erros e aprendizados.',
            'O cliente é o ponto de partida de todas as decisões estratégicas.',
            'Ritmo sustentável conecta performance com bem-estar.'
          ],
          distractors: [
            'A cultura prioriza competição interna acima de tudo.',
            'Clientes só são envolvidos após o lançamento.',
            'Erros devem ser ocultados para não afetar o clima.'
          ]
        },
        isCompleted: true,
        score: 95,
        xpReward: 120,
        estimatedTimeMin: 5
      },
      {
        id: 'onb-flashcards',
        type: ActivityType.FLASHCARDS,
        title: 'Vocabulário vivo',
        description: 'Pratique termos essenciais antes de colaborar.',
        content: [
          {
            id: 'fc1',
            front: "O que é uma 'Squad'?",
            back: 'Time multidisciplinar com autonomia para resolver um desafio.',
            mode: 'mcq',
            options: ['Equipe temporária', 'Time multidisciplinar com autonomia', 'Canal de chat'],
            correctOptionIndex: 1,
            sourceSnippet: 'Squads são times multidisciplinares com autonomia para resolver um objetivo.'
          },
          {
            id: 'fc2',
            front: 'Qual a duração ideal da daily?',
            back: 'No máximo 15 minutos, com foco em remover impedimentos.',
            mode: 'vf',
            vfStatement: 'A daily precisa ter 60 minutos para ser produtiva.',
            isTrue: false,
            sourceSnippet: 'Rituais enxutos mantêm o ritmo sustentável.'
          },
          {
            id: 'fc3',
            front: 'Como definimos “ritmo sustentável”?',
            back: 'Equilíbrio entre entregas de alto impacto e saúde mental dos times.',
            mode: 'classic',
            sourceSnippet: 'Ritmo sustentável equilibra performance e bem-estar.'
          }
        ],
        isCompleted: false,
        xpReward: 150,
        estimatedTimeMin: 8
      },
      {
        id: 'onb-selfx',
        type: ActivityType.SELF_EXPLANATION,
        title: 'Desafio de síntese',
        description: 'Explique com suas palavras.',
        content: {
          prompt: "Por que 'Transparência Radical' acelera a inovação?",
          sourceReference: 'Decisões transparentes reduzem silêncios e destravam colaboração horizontal.',
          minWords: 40
        },
        isCompleted: false,
        xpReward: 200,
        estimatedTimeMin: 6
      },
      {
        id: 'onb-quiz',
        type: ActivityType.QUIZ,
        title: 'Quiz de Cultura',
        description: 'Valide a retenção dos pilares.',
        content: [
          {
            question: 'Qual ação reforça o valor Cliente no Centro?',
            options: ['Começar reuniões com status financeiros', 'Abrir com insights de clientes da semana', 'Debater apenas indicadores internos'],
            correctAnswerIndex: 1,
            explanation: 'Mostrar dados reais de clientes coloca o contexto correto.',
            sourceSnippet: 'O cliente é o ponto de partida de toda decisão.'
          },
          {
            question: 'Como lidamos com falhas em projetos?',
            options: ['Apontando culpados rapidamente', 'Documentando aprendizados com transparência', 'Silenciando o tema até o próximo ciclo'],
            correctAnswerIndex: 1,
            explanation: 'Falhas viram aprendizado compartilhado.',
            sourceSnippet: 'Transparência Radical inclui dividir erros.'
          },
          {
            question: 'O que significa ritmo sustentável?',
            options: ['Trabalhar mais horas para entregar mais', 'Balancear performance e saúde', 'Eliminar férias para manter foco'],
            correctAnswerIndex: 1,
            explanation: 'Equilíbrio evita burnout e mantém entregas consistentes.',
            sourceSnippet: 'Ritmo sustentável conecta performance e bem-estar.'
          }
        ],
        isCompleted: false,
        xpReward: 250,
        estimatedTimeMin: 10
      },
      {
        id: 'onb-simulation',
        type: ActivityType.SIMULATION,
        title: 'Simulado final',
        description: 'Situações reais para decisões de cultura.',
        content: [
          {
            question: 'Um squad atrasou um lançamento crítico. Qual atitude reflete nossa cultura?',
            options: [
              'Esconder o atraso e tentar recuperar no silêncio',
              'Comunicar o atraso, compartilhar aprendizados e replanejar com o cliente',
              'Culpar publicamente o time de tecnologia'
            ],
            correctAnswerIndex: 1,
            explanation: 'Com transparência radical, comunicamos rápido e replanejamos junto.',
            sourceSnippet: 'Erros devem ser compartilhados rapidamente.'
          },
          {
            question: 'Durante uma daily, uma pessoa domina a conversa. O que fazer?',
            options: [
              'Deixar assim para não alongar a reunião',
              'Relembrar o foco de 15 minutos e estimular falas curtas de todos',
              'Acabar a reunião e enviar recado privado depois'
            ],
            correctAnswerIndex: 1,
            explanation: 'Rituais enxutos garantem espaço seguro e produtivo.',
            sourceSnippet: 'Rituais curtos mantêm ritmo sustentável.'
          }
        ],
        isCompleted: false,
        xpReward: 400,
        estimatedTimeMin: 12
      }
    ],
    isRecommended: true
  },
  {
    id: 'course-cnv',
    title: 'Comunicação Não Violenta para Líderes',
    description: 'Ferramentas para conduzir conversas difíceis e preservar relações.',
    category: 'Soft Skills',
    tags: ['Comunicação', 'Liderança', 'CNV'],
    progress: 60,
    totalXP: 950,
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-02-02T12:00:00.000Z',
    modules: [
      {
        id: 'cnv-summary',
        type: ActivityType.SUMMARY,
        title: 'Os 4 passos da CNV',
        description: 'Observação, sentimentos, necessidades e pedidos.',
        content: {
          markdownContent: `1. Observe sem julgar.\n2. Nomeie sentimentos reais.\n3. Conecte necessidades.\n4. Faça pedidos claros.`,
          correctStatements: [
            'CNV começa descrevendo fatos sem julgamentos.',
            'Pedidos devem ser claros e específicos.',
            'Reconhecer necessidades aproxima as pessoas.'
          ],
          distractors: [
            'CNV incentiva críticas diretas.',
            'Pedidos vagos são melhores para preservar relacionamentos.',
            'Julgamentos morais aceleram acordos.'
          ]
        },
        isCompleted: true,
        score: 88,
        xpReward: 80,
        estimatedTimeMin: 4
      },
      {
        id: 'cnv-casestudy',
        type: ActivityType.CASE_STUDY,
        title: 'Feedback em situação de conflito',
        description: 'Selecione a resposta alinhada à CNV.',
        content: {
          scenario: 'Um analista entregou um relatório com erros pela terceira vez. A líder precisa abordar o tema.',
          question: 'Qual abordagem segue CNV?',
          options: [
            {
              text: '“Você é sempre distraído, conserte isso.”',
              type: 'wrong',
              feedback: 'Julga a pessoa e fecha o diálogo.'
            },
            {
              text: '“Notei três erros nos últimos relatórios (observação). Fico preocupado porque isso afeta decisões (sentimento+necessidade). Podemos revisar juntos e criar um checklist (pedido)?”',
              type: 'correct',
              feedback: 'Conecta fatos, impacto e pedido claro.'
            },
            {
              text: '“Se errar de novo, terá consequências sérias.”',
              type: 'risk',
              feedback: 'Sem empatia, foca em ameaça.'
            }
          ],
          sourceSnippet: 'CNV encadeia observação, sentimento, necessidade e pedido.'
        },
        isCompleted: false,
        xpReward: 200,
        estimatedTimeMin: 7
      },
      {
        id: 'cnv-comparison',
        type: ActivityType.COMPARISON,
        title: 'Classifique frases',
        description: 'Separe julgamentos de observações.',
        content: {
          columns: [
            { id: 'obs', label: 'Observação' },
            { id: 'jul', label: 'Julgamento' }
          ],
          items: [
            { id: 'item1', text: 'Você interrompeu três colegas hoje.', correctColumnId: 'obs' },
            { id: 'item2', text: 'Você é arrogante.', correctColumnId: 'jul' },
            { id: 'item3', text: 'Recebi o relatório 2 horas depois do combinado.', correctColumnId: 'obs' },
            { id: 'item4', text: 'Seu time nunca se prepara.', correctColumnId: 'jul' }
          ]
        },
        isCompleted: false,
        xpReward: 150,
        estimatedTimeMin: 5
      },
      {
        id: 'cnv-flashcards',
        type: ActivityType.FLASHCARDS,
        title: 'Prática express',
        description: 'Treine sentimentos vs necessidades.',
        content: [
          {
            id: 'cnv-fc1',
            front: '“Estou irritado porque preciso de clareza.” Identifique sentimentos.',
            back: 'Irritado = sentimento; clareza = necessidade.',
            mode: 'classic'
          },
          {
            id: 'cnv-fc2',
            front: '“Você é irresponsável.”',
            back: 'Julgamento; reescreva como observação específica.',
            mode: 'classic'
          }
        ],
        isCompleted: false,
        xpReward: 120,
        estimatedTimeMin: 6
      },
      {
        id: 'cnv-quiz',
        type: ActivityType.QUIZ,
        title: 'Check rápido',
        description: 'Avalie conceitos básicos.',
        content: [
          {
            question: 'O que diferencia pedido de exigência?',
            options: [
              'Tom de voz utilizado',
              'Disponibilidade para ouvir “não” e negociar',
              'Complexidade do pedido'
            ],
            correctAnswerIndex: 1,
            explanation: 'Pedidos CNV aceitam negociar alternativas.',
            sourceSnippet: 'Pedidos claros e negociáveis evitam resistência.'
          },
          {
            question: 'Qual passo ocorre primeiro na CNV?',
            options: ['Nomear sentimentos', 'Observar fatos sem julgamento', 'Fazer pedidos'],
            correctAnswerIndex: 1,
            explanation: 'A observação cria terreno comum.',
            sourceSnippet: 'Passo inicial é observar.'
          }
        ],
        isCompleted: false,
        xpReward: 200,
        estimatedTimeMin: 6
      }
    ]
  },
  {
    id: 'course-ai',
    title: 'IA Generativa para Produtividade',
    description: 'Construa copilotos seguros para automatizar fluxos internos.',
    category: 'Técnico',
    tags: ['IA', 'Automação', 'Produtividade'],
    progress: 30,
    totalXP: 1500,
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-02-25T09:30:00.000Z',
    modules: [
      {
        id: 'ai-summary',
        type: ActivityType.SUMMARY,
        title: 'Playbook de copilotos',
        description: 'Diretrizes de segurança e privacidade.',
        content: {
          markdownContent: `### Regras de segurança\n- Redija prompts com filtros de PII.\n- Registre logs de auditoria em toda requisição.\n- Valide toda saída antes de publicar.`,
          correctStatements: [
            'Prompts devem incluir filtros para dados sensíveis.',
            'Logs de auditoria precisam registrar entradas e saídas.',
            'Saídas de IA devem ser validadas antes de envio.'
          ],
          distractors: [
            'É seguro enviar credenciais nos prompts.',
            'Logs só são necessários para erros.',
            'Outputs podem ser enviados direto ao cliente.'
          ]
        },
        isCompleted: true,
        score: 82,
        xpReward: 150,
        estimatedTimeMin: 5
      },
      {
        id: 'ai-mapmind',
        type: ActivityType.MAP_MIND,
        title: 'Arquitetura de copiloto',
        description: 'Mapeie componentes críticos.',
        content: {
          rootLabel: 'Copiloto Seguro',
          nodes: [
            { id: 'root-ingest', label: 'Ingestão de dados', parentId: 'root' },
            { id: 'root-guard', label: 'Guardrails', parentId: 'root' },
            { id: 'root-metrics', label: 'Telemetria', parentId: 'root' },
            { id: 'node1', label: 'Sanitização PII', parentId: 'root-ingest' },
            { id: 'node2', label: 'Classificador de risco', parentId: 'root-guard' },
            { id: 'node3', label: 'Dashboards de uso', parentId: 'root-metrics' }
          ]
        },
        isCompleted: false,
        xpReward: 220,
        estimatedTimeMin: 7
      },
      {
        id: 'ai-cloze',
        type: ActivityType.CLOZE,
        title: 'Complete as lacunas',
        description: 'Refresque boas práticas de prompts.',
        content: {
          textWithBlanks: 'Sempre ______ os dados antes de enviá-los para o modelo e adicione ______ para impedir respostas inseguras.',
          answers: ['anonimize', 'guardrails contextuais']
        },
        isCompleted: false,
        xpReward: 180,
        estimatedTimeMin: 4
      },
      {
        id: 'ai-simulation',
        type: ActivityType.SIMULATION,
        title: 'Simulado de rollout',
        description: 'Planeje um piloto em produção.',
        content: [
          {
            question: 'Como liberar um copiloto para o time comercial?',
            options: [
              'Permitir acesso aberto e monitorar depois',
              'Liberar para um grupo piloto com monitoramento e política de uso',
              'Desligar logs para reduzir custo'
            ],
            correctAnswerIndex: 1,
            explanation: 'Pilotos controlados reduzem risco e alimentam métricas.',
            sourceSnippet: 'Telemetria e rollout gradual são obrigatórios.'
          },
          {
            question: 'Qual métrica acompanhar primeiro?',
            options: ['Tempo médio de resposta', 'Número de tokens por usuário', 'Nível de adoção com satisfação'],
            correctAnswerIndex: 2,
            explanation: 'Adoção + satisfação mostram valor real.',
            sourceSnippet: 'Métricas de negócio guiam decisões de expansão.'
          }
        ],
        isCompleted: false,
        xpReward: 400,
        estimatedTimeMin: 12
      }
    ],
    isRecommended: false
  }
];

export const generateEnrollments = (courses: Course[] = COURSES): Enrollment[] => {
  const enrollments: Enrollment[] = [];

  COLLABORATORS.forEach((col) => {
    courses.forEach((course, idx) => {
      const isRequired = course.category === 'Obrigatórios' || idx === 0;

      let status = EnrollmentStatus.NOT_STARTED;
      let progress = 0;
      let finalScore = undefined as number | undefined;
      const randomVal = Math.random();

      if (randomVal > 0.8) {
        status = EnrollmentStatus.NOT_STARTED;
      } else if (randomVal > 0.5) {
        status = EnrollmentStatus.IN_PROGRESS;
        progress = Math.floor(Math.random() * 80);
      } else {
        status = EnrollmentStatus.COMPLETED;
        progress = 100;
        finalScore = Math.floor(Math.random() * 30) + 70;
      }

      if (status === EnrollmentStatus.COMPLETED && Math.random() > 0.9) {
        status = EnrollmentStatus.FAILED_SIMULATION;
        finalScore = 55;
      }

      let dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      if (col.coursesLate > 0 && isRequired && status !== EnrollmentStatus.COMPLETED) {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 5);
        status = EnrollmentStatus.LATE;
      }

      enrollments.push({
        id: `enr-${col.id}-${course.id}`,
        courseId: course.id,
        collaboratorId: col.id,
        isRequired,
        assignedAt: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        status,
        progress,
        finalScore,
        lastAccessAt: new Date().toISOString()
      });
    });
  });

  return enrollments;
};
