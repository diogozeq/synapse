import { PrismaClient } from '@prisma/client';
import { TEAMS, COLLABORATORS, COURSES, generateEnrollments } from '../data/seeds/mockData.ts';

const prisma = new PrismaClient();

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('🗃️  Limpando tabelas...');
  await prisma.checkinBio.deleteMany();
  await prisma.logAuditoria.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.equipe.deleteMany();
  await prisma.materialFonte.deleteMany();

  console.log('👥 Criando equipes...');
  for (const team of TEAMS) {
    await prisma.equipe.create({
      data: {
        id: team.id,
        nome: team.name,
        descricao: team.area
      }
    });
  }

  console.log('📚 Registrando cursos e módulos (JSON)...');
  for (const course of COURSES) {
    await prisma.materialFonte.create({
      data: {
        id: course.id,
        titulo: course.title,
        descricao: course.description,
        categoria: course.category,
        tags: JSON.stringify(course.tags),
        modules: JSON.stringify(course.modules),
        progress: course.progress,
        totalXp: course.totalXP,
        createdAt: new Date(course.createdAt),
        isRecommended: Boolean(course.isRecommended),
        tipoArquivo: 'AI_GENERATED',
        urlArquivo: `https://cdn.synapse/${course.id}.pdf`,
        status: course.progress >= 100 ? 'CONCLUIDO' : 'EM_ANDAMENTO',
        thumbnailUrl: course.thumbnailUrl
      }
    });
  }

  console.log('🧑‍💼 Criando colaboradores...');
  for (const collaborator of COLLABORATORS) {
    await prisma.usuario.create({
      data: {
        id: collaborator.id,
        nome: collaborator.name,
        email: collaborator.email,
        hashSenha: 'hashed_secret',
        avatarUrl: collaborator.avatarUrl,
        cargo: collaborator.role,
        papel: 'COLABORADOR',
        idEquipe: collaborator.teamId,
        totalXp: collaborator.totalXP,
        nivel: collaborator.level,
        diasSequencia: collaborator.streakDays
      }
    });
  }

  console.log('📈 Criando matrículas...');
  const enrollments = generateEnrollments(COURSES);
  for (const enrollment of enrollments) {
    await prisma.matricula.create({
      data: {
        id: enrollment.id,
        idUsuario: enrollment.collaboratorId,
        idCurso: enrollment.courseId,
        status: enrollment.status,
        progresso: enrollment.progress,
        notaFinal: enrollment.finalScore ?? null,
        prazo: new Date(enrollment.dueDate ?? new Date().toISOString()),
        atribuidoEm: new Date(enrollment.assignedAt),
        ultimoAcesso: new Date(enrollment.lastAccessAt ?? new Date().toISOString()),
        ehObrigatorio: enrollment.isRequired
      }
    });
  }

  console.log('📟 Gerando check-ins biométricos sintéticos...');
  for (const collaborator of COLLABORATORS) {
    const stressBase = collaborator.coursesLate > 0 ? randomBetween(60, 90) : randomBetween(20, 60);
    await prisma.checkinBio.create({
      data: {
        id: `${collaborator.id}-bio`,
        idUsuario: collaborator.id,
        horasSono: randomBetween(5, 9),
        qualidadeSono: randomBetween(6, 10),
        nivelFoco: randomBetween(40, 95),
        nivelFadiga: randomBetween(10, 70),
        nivelEstresse: stressBase,
        nivelMotivacao: randomBetween(50, 100),
        nivelHumor: randomBetween(4, 9),
        nivelAnsiedade: randomBetween(10, 80),
        scoreBemEstar: randomBetween(50, 95),
        origemDados: 'SIMULACAO_SEED',
        dadosBrutosSensor: JSON.stringify({ origem: 'seed', version: 'v2' }),
        dataHora: new Date(),
        diaDaSemana: new Date().getDay(),
        horaDoDia: 9
      }
    });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
