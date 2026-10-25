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

  // Upsert each product so re-running the seed is safe and never wipes photos
  // that the shopkeeper uploaded (we only set the base fields, not img, on
  // update). On first run every product is created.
  for (const it of items) {
    await db.product.upsert({
      where: { id: it.id },
      create: {
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
      update: {
        name: it.name,
        cat: it.cat,
        unit: it.unit,
        // Prices/stock/img are managed in the admin panel, so don't overwrite
        // them on re-seed. Only keep the base taxonomy in sync.
      },
    });
  }

  // Ensure the single Settings row (id = 1) exists with sensible defaults.
  await db.settings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  // Seed default Today's Special slots if none exist.
  const specialsCount = await db.special.count();
  if (specialsCount === 0) {
    await db.special.createMany({
      data: [
        {
          productId: 109,
          title: "Alphonso Mango",
          priceText: "₹280 / kg",
          label: "Fresh today",
          img: "/images/mangoes.jpg",
          sort: 0,
        },
        {
          productId: 3,
          title: "Country Tomatoes",
          priceText: "₹35 / kg",
          label: "Fresh today",
          img: "/images/tomatoes.jpg",
          sort: 1,
        },
        {
          productId: 43,
          title: "Farm Spinach Bunch",
          priceText: "₹20 / bunch",
          label: "Just harvested",
          img: "/images/spinach.jpg",
          sort: 2,
        },
      ],
    });
  }

  console.log(`✓ Seeded ${items.length} products, ensured Settings row, and Today's Special slots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
