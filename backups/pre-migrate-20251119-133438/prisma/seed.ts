import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEAMS_MOCK = [
  { id: 't1', name: 'Atendimento N1', area: 'Customer Success' },
  { id: 't2', name: 'Comercial Inside Sales', area: 'Vendas' },
  { id: 't3', name: 'Backoffice Financeiro', area: 'Financeiro' }
];

const CARGOS = ['Analista Jr', 'Analista Pl', 'Analista Sr', 'Especialista', 'Assistente'];
const NOMES = [
  'João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa',
  'Lucas Pereira', 'Juliana Souza', 'Marcos Lima', 'Fernanda Rocha',
  'Rafael Alves', 'Beatriz Dias', 'Thiago Ribeiro', 'Camila Gomes',
  'Bruno Martins', 'Larissa Carvalho', 'Rodrigo Ferreira', 'Amanda Rodrigues',
  'Guilherme Barbosa', 'Patrícia Castro', 'Gabriel Nogueira', 'Vanessa Cardoso'
];

const CURSOS_MOCK = [
  { id: 'c1', title: 'Onboarding de Cultura: O Jeito Synapse', category: 'Obrigatórios' },
  { id: 'c2', title: 'Segurança da Informação 2025', category: 'Obrigatórios' },
  { id: 'c3', title: 'Comunicação Não-Violenta', category: 'Soft Skills' },
  { id: 'c4', title: 'IA Generativa para Produtividade', category: 'Técnico' }
];

async function main() {
  console.log('🌱 Iniciando fusão de dados Mockados -> SQLite Real...');

  await prisma.checkinBio.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.equipe.deleteMany();
  await prisma.materialFonte.deleteMany();

  console.log('🏢 Criando Equipes...');
  for (const team of TEAMS_MOCK) {
    await prisma.equipe.create({
      data: {
        id: team.id,
        nome: team.name,
        descricao: team.area
      }
    });
  }

  console.log('📚 Criando Cursos...');
  for (const curso of CURSOS_MOCK) {
    await prisma.materialFonte.create({
      data: {
        id: curso.id,
        titulo: curso.title,
        categoria: curso.category,
        tipoArquivo: 'PDF_GERADO',
        urlArquivo: 'https://fake-url.com/doc.pdf',
        status: 'CONCLUIDO'
      }
    });
  }

  console.log('👥 Gerando Colaboradores...');
  for (let i = 0; i < NOMES.length; i++) {
    const nome = NOMES[i];
    const teamId = TEAMS_MOCK[i % TEAMS_MOCK.length].id;
    const temAtraso = i % 4 === 0;
    const cargo = CARGOS[i % CARGOS.length];

    const user = await prisma.usuario.create({
      data: {
        id: `col-${i}`,
        nome,
        email: `${nome.toLowerCase().replace(/\s+/g, '.')}@synapse.com`,
        hashSenha: 'hashed_secret',
        cargo,
        papel: 'COLABORADOR',
        idEquipe: teamId,
        totalXp: Math.floor(Math.random() * 5000),
        nivel: Math.floor(Math.random() * 20) + 1,
        diasSequencia: Math.floor(Math.random() * 30)
      }
    });

    for (const curso of CURSOS_MOCK) {
      const isRequired = curso.category === 'Obrigatórios' || curso.id === 'c1';
      let status = 'NOT_STARTED';
      let progress = 0;
      let finalScore: number | null = null;
      const rnd = Math.random();

      if (rnd > 0.8) {
        status = 'NOT_STARTED';
      } else if (rnd > 0.5) {
        status = 'IN_PROGRESS';
        progress = Math.floor(Math.random() * 80);
      } else {
        status = 'COMPLETED';
        progress = 100;
        finalScore = Math.floor(Math.random() * 30) + 70;
      }

      if (status === 'COMPLETED' && Math.random() > 0.9) {
        status = 'FAILED_SIMULATION';
        finalScore = 55;
      }

      let dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      if (temAtraso && isRequired && status !== 'COMPLETED') {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 5);
        status = 'LATE';
      }

      await prisma.matricula.create({
        data: {
          idUsuario: user.id,
          idCurso: curso.id,
          status,
          progresso: progress,
          notaFinal: finalScore,
          prazo: dueDate,
          ehObrigatorio: isRequired
        }
      });
    }

    const horasSono = Math.floor(Math.random() * (9 - 5) + 5);
    const qualidadeSono = Math.floor(Math.random() * 10);
    const nivelFoco = Math.floor(Math.random() * 100);
    const nivelFadiga = Math.floor(Math.random() * 100);
    const nivelEstresse = temAtraso ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 50);
    const nivelMotivacao = Math.floor(Math.random() * 100);
    const nivelHumor = 5;
    const nivelAnsiedade = Math.floor(Math.random() * 100);
    const scoreBemEstar = Math.round((nivelFoco + (100 - nivelEstresse) + nivelMotivacao) / 3);

    await prisma.checkinBio.create({
      data: {
        id: `${user.id}-bio`,
        idUsuario: user.id,
        horasSono,
        qualidadeSono,
        nivelFoco,
        nivelFadiga,
        nivelEstresse,
        nivelMotivacao,
        nivelHumor,
        nivelAnsiedade,
        scoreBemEstar,
        origemDados: 'SIMULACAO_SEED',
        dadosBrutosSensor: JSON.stringify({ origem: 'seed' }),
        dataHora: new Date(),
        diaDaSemana: new Date().getDay(),
        horaDoDia: 9
      }
    });
  }

  console.log('✅ Database Fusion Concluída com Sucesso! Tudo pronto para o Pódio.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
