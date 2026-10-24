/**
 * Seeds the Product table from the uploaded products.json file.
 * Run with: bun run db:seed
 */
import { db } from "../src/lib/db";
import raw from "../upload/products.json";

type RawItem = {
  id: number;
  name: string;
  cat: string;
  unit: string;
  price: number | null;
  mrp: number | null;
  kn: string;
  stock: boolean;
  img: string | null;
};

async function main() {
  const items = (raw as { items: RawItem[] }).items;
  console.log(`Seeding ${items.length} products...`);

  // Wipe & reseed so the script is idempotent.
  await db.product.deleteMany({});

  for (const it of items) {
    await db.product.create({
      data: {
        id: it.id,
        name: it.name,
        cat: it.cat,
        unit: it.unit,
        price: it.price,
        mrp: it.mrp,
        kn: it.kn ?? "",
        stock: it.stock !== false,
        img: it.img ?? null,
      },
    });
  }

  console.log(`✓ Seeded ${items.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
