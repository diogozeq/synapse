
import { Collaborator, Team, Enrollment, EnrollmentStatus, Course } from '../../src/types';

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
  const teamIndex = i % 3;
  const team = TEAMS[teamIndex];
  const temAtraso = i % 4 === 0; // 25% tem atraso

  return {
    id: `col-${i}`,
    name: nome,
    email: `${nome.toLowerCase().replace(' ', '.')}@synapse.com`,
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

export const generateEnrollments = (courses: Course[]): Enrollment[] => {
  const enrollments: Enrollment[] = [];

  COLLABORATORS.forEach((col) => {
    courses.forEach((course, idx) => {
      const isRequired = course.category === 'Obrigatórios' || idx === 0;

      // Variar status: 20% não iniciado, 30% em andamento, 50% concluído
      let status = EnrollmentStatus.NOT_STARTED;
      let progress = 0;
      let finalScore = undefined;
      const randomVal = Math.random();

      if (randomVal > 0.8) {
        status = EnrollmentStatus.NOT_STARTED;
      } else if (randomVal > 0.5) {
        status = EnrollmentStatus.IN_PROGRESS;
        progress = Math.floor(Math.random() * 80);
      } else {
        status = EnrollmentStatus.COMPLETED;
        progress = 100;
        finalScore = Math.floor(Math.random() * 30) + 70; // 70-100
      }

      // 10% dos concluídos reprovam no simulado
      if (status === EnrollmentStatus.COMPLETED && Math.random() > 0.9) {
        status = EnrollmentStatus.FAILED_SIMULATION;
        finalScore = 55;
      }

      // Definir prazo (15 dias no futuro, ou no passado se atrasado)
      let dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      // Se colaborador tem atraso, alguns cursos estão vencidos
      if (col.coursesLate > 0 && isRequired && status !== EnrollmentStatus.COMPLETED) {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 5); // 5 dias atrasado
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
