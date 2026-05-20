import 'dotenv/config';
import { prisma } from './lib/prisma';

async function main() {
  const roots = await prisma.root.findMany({
    include: {
      definitions: true
    }
  });

  const multiDefRoots = roots.filter(r => r.definitions.length > 1);
  console.log(`🔍 Found ${multiDefRoots.length} roots with multiple definitions.`);

  for (const r of multiDefRoots) {
    console.log(`\n🌱 Root: "${r.bikol}" (ID: ${r.id})`);
    for (const d of r.definitions) {
      console.log(`  - Def: "${d.english}" [Dialect: ${d.dialect}] [POS: ${r.pos}]`);
    }
  }
}

main().finally(() => prisma.$disconnect());
