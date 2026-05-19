import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rootWithAccent = await prisma.root.findFirst({
    where: { bikol: { equals: 'bakál', mode: 'insensitive' } }
  });
  console.log('Root with accent (bakál):', rootWithAccent);

  const rootWithoutAccent = await prisma.root.findFirst({
    where: { bikol: { equals: 'bakal', mode: 'insensitive' } }
  });
  console.log('Root without accent (bakal):', rootWithoutAccent);

  const wordWithAccent = await prisma.word.findUnique({
    where: { bikol: 'bakál' }
  });
  console.log('Word with accent (bakál):', wordWithAccent);

  const wordWithoutAccent = await prisma.word.findUnique({
    where: { bikol: 'bakal' }
  });
  console.log('Word without accent (bakal):', wordWithoutAccent);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
