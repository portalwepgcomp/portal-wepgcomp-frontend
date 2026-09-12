// Execute com a API irmã instalada e configurada para um PostgreSQL local.
const path = require('node:path');
const { createRequire } = require('node:module');
const apiPath = path.resolve(process.argv[2] || '../portal-wepgcomp-api');
const apiRequire = createRequire(path.join(apiPath, 'package.json'));
apiRequire('dotenv').config({ path: path.join(apiPath, '.env') });
const database = new URL(process.env.DATABASE_URL);
if (!['localhost', '127.0.0.1', '[::1]'].includes(database.hostname)) {
  throw new Error('Este seed só pode ser executado em um banco local.');
}
const prisma = new (apiRequire('@prisma/client').PrismaClient)();
const id = (kind, year) => `00000005-0000-4000-8000-${kind}${String(year).padStart(10, '0')}`;

async function seed() {
  const password = await apiRequire('bcrypt').hash('FavoritosTeste5!', 10);
  await prisma.$transaction(async (tx) => {
    const user = await tx.userAccount.upsert({
      where: { id: id('01', 0) },
      update: {},
      create: {
        id: id('01', 0), name: 'Pessoa Teste Favoritos',
        email: 'favoritos.issue5@example.test', password,
        profile: 'Listener', isVerified: true,
      },
    });
    for (const year of [2025, 2026, 2027]) {
      const startDate = new Date(`${year}-10-15T12:00:00Z`);
      await tx.eventEdition.upsert({
        where: { id: id('02', year) }, update: {},
        create: {
          id: id('02', year), name: `WEPGCOMP ${year} - Teste favoritos`,
          description: 'Dados fictícios para reproduzir a issue frontend #5.',
          callForPapersText: 'Chamada de teste', partnersText: 'Parceiros de teste',
          location: 'Sala de teste', startDate,
          endDate: new Date(`${year}-10-16T21:00:00Z`),
          submissionStartDate: new Date(`${year}-01-01T12:00:00Z`),
          submissionDeadline: new Date(`${year}-09-30T21:00:00Z`),
          isActive: year === 2026,
        },
      });
      if (year === 2027) continue;
      await tx.submission.upsert({
        where: { id: id('03', year) }, update: {},
        create: {
          id: id('03', year), eventEditionId: id('02', year),
          advisorId: user.id, mainAuthorId: user.id,
          title: `Apresentação favorita ${year}`,
          abstract: `Resumo fictício da edição ${year}.`,
          pdfFile: 'issue-5-teste.pdf', phoneNumber: '71999999999', status: 'Confirmed',
        },
      });
      await tx.presentationBlock.upsert({
        where: { id: id('04', year) }, update: {},
        create: {
          id: id('04', year), eventEditionId: id('02', year),
          type: 'Presentation', title: `Sessão de teste ${year}`, startTime: startDate, duration: 20,
        },
      });
      await tx.presentation.upsert({
        where: { id: id('05', year) }, update: {},
        create: {
          id: id('05', year), submissionId: id('03', year),
          presentationBlockId: id('04', year), positionWithinBlock: 1, status: 'ToPresent',
        },
      });
      await tx.userAccount.update({
        where: { id: user.id },
        data: { bookmarkedPresentations: { connect: { id: id('05', year) } } },
      });
    }
  });
  console.log('Seed concluído: edições 2025/2026 com um favorito cada; 2027 sem favoritos.');
  console.log('Login local: favoritos.issue5@example.test / FavoritosTeste5!');
}
seed().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
