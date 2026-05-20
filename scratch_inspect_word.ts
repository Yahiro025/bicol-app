import 'dotenv/config';
import { prisma } from './lib/prisma';

async function main() {
  const root = await prisma.root.findFirst({
    where: { bikol: { equals: 'kaakboy', mode: 'insensitive' } },
    include: {
      definitions: {
        include: {
          exampleSentences: true
        }
      }
    }
  });

  console.log("Root Info:", JSON.stringify(root, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
