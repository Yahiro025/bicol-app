import { Prisma } from '@prisma/client';

interface BrowseFilters {
  letter?: string | null;
  category?: string | null;
  q?: string | null;
  sort?: string | null;
}

export function buildBrowseConditions(filters: BrowseFilters): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (filters.letter) {
    conditions.push(Prisma.sql`LOWER("bikol") LIKE LOWER(${filters.letter + '%'})`);
  }
  if (filters.category) {
    conditions.push(Prisma.sql`LOWER("category") = LOWER(${filters.category})`);
  }
  if (filters.q) {
    conditions.push(Prisma.sql`(
      LOWER("bikol") LIKE LOWER(${'%' + filters.q + '%'}) OR
      LOWER("english") LIKE LOWER(${'%' + filters.q + '%'}) OR
      LOWER("tagalog") LIKE LOWER(${'%' + filters.q + '%'})
    )`);
  }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
    : Prisma.empty;
}

export function buildBrowseOrderBy(sort?: string | null): Prisma.Sql {
  return sort === 'frequency'
    ? Prisma.sql`ORDER BY "frequency_rank" ASC NULLS LAST, LOWER("bikol") ASC`
    : Prisma.sql`ORDER BY LOWER("bikol") ASC`;
}
