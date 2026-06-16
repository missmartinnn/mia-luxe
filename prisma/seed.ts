// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { MOCK_PRODUCTS } from '../src/lib/mockData';

// 1. Create a connection pool using your direct URL (Port 5432) for heavy-duty seeding
const pool = new Pool({ connectionString: process.env.DIRECT_URL });

// 2. Wrap it in Prisma's Postgres adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma 7 correctly with the adapter!
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding real database...');
  
  for (const product of MOCK_PRODUCTS) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category,
        subcategory: product.subcategory,
        sizes: product.sizes,   // Passed directly as a native string array
        colors: product.colors, // Passed directly as a native string array
        stock: product.stock
      }
    });
    console.log(`Created product: ${product.name}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });