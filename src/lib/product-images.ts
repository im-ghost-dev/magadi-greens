/**
 * Realistic high-quality Unsplash images for fresh produce listings.
 * Tailored specifically to fruits, vegetables, leafy greens, mangoes, and exotics.
 */

const KEYWORD_IMAGES: Array<{ keywords: string[]; url: string }> = [
  // Anjeer / Figs
  {
    keywords: ["anjeer", "fig"],
    url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&auto=format&fit=crop&q=80",
  },
  // Green Apples
  {
    keywords: ["green apple", "apple green"],
    url: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=80",
  },
  // Apples (Red / Gala / Shimla / Washington)
  {
    keywords: ["apple", "gala", "shimla", "washington"],
    url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80",
  },
  // Spinach / Palak
  {
    keywords: ["spinach", "palak"],
    url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
  },
  // Tomatoes
  {
    keywords: ["tomato", "nati", "country tomato"],
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
  },
  // Mangoes
  {
    keywords: [
      "mango",
      "alphonso",
      "badami",
      "banganapalli",
      "raspuri",
      "malgova",
      "chausa",
      "neelam",
      "sendura",
      "langra",
      "kalapadi",
    ],
    url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80",
  },
  // Bananas
  {
    keywords: ["banana", "yelakki", "robusta", "rasthali"],
    url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
  },
  // Onions
  {
    keywords: ["onion", "shallot", "sambar onion"],
    url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80",
  },
  // Potatoes
  {
    keywords: ["potato", "aloo"],
    url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80",
  },
  // Carrots
  {
    keywords: ["carrot", "ooty"],
    url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80",
  },
  // Beans
  {
    keywords: [
      "beans",
      "french bean",
      "long bean",
      "avarekai",
      "double bean",
      "gorikai",
      "cluster bean",
      "kothavara",
      "togarikai",
      "pigeon pea",
      "anbeans",
    ],
    url: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=80",
  },
  // Peas
  {
    keywords: ["pea", "peas", "matar"],
    url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500&auto=format&fit=crop&q=80",
  },
  // Okra / Ladies Finger
  {
    keywords: ["okra", "ladies finger", "bhindi"],
    url: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500&auto=format&fit=crop&q=80",
  },
  // Coconut & Sugar Cane
  {
    keywords: ["coconut", "sugar cane"],
    url: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=500&auto=format&fit=crop&q=80",
  },
  // Cucumber
  {
    keywords: ["cucumber", "sambar cucumber", "english cucumber"],
    url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500&auto=format&fit=crop&q=80",
  },
  // Capsicum / Peppers
  {
    keywords: ["capsicum yellow", "yellow capsicum"],
    url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["capsicum red", "red capsicum"],
    url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["capsicum", "bell pepper", "bajji chilli"],
    url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80",
  },
  // Chillies
  {
    keywords: ["chilli", "chili", "mirchi"],
    url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80",
  },
  // Cauliflower
  {
    keywords: ["cauliflower", "gobi"],
    url: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=80",
  },
  // Cabbage
  {
    keywords: ["cabbage", "red cabbage"],
    url: "https://images.unsplash.com/photo-1611105637996-ef336e9ffdf7?w=500&auto=format&fit=crop&q=80",
  },
  // Broccoli
  {
    keywords: ["broccoli"],
    url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=80",
  },
  // Brinjal / Eggplant
  {
    keywords: ["brinjal", "eggplant", "baingan", "bharta"],
    url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80",
  },
  // Ginger
  {
    keywords: ["ginger", "adrak"],
    url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&auto=format&fit=crop&q=80",
  },
  // Garlic
  {
    keywords: ["garlic", "lahsun"],
    url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=80",
  },
  // Lemon / Lime
  {
    keywords: ["lemon", "lime", "nimbu"],
    url: "https://images.unsplash.com/photo-1533082879395-3c730f6dd668?w=500&auto=format&fit=crop&q=80",
  },
  // Mushrooms
  {
    keywords: ["mushroom", "button mushroom"],
    url: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500&auto=format&fit=crop&q=80",
  },
  // Beetroot
  {
    keywords: ["beetroot", "beet"],
    url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=500&auto=format&fit=crop&q=80",
  },
  // Sweet Corn / Baby Corn
  {
    keywords: ["corn", "sweet corn", "baby corn", "maize"],
    url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&auto=format&fit=crop&q=80",
  },
  // Radish & Turnip
  {
    keywords: ["radish", "mooli", "turnip", "shalgam", "knol khol", "nookkol"],
    url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&auto=format&fit=crop&q=80",
  },
  // Gourds (Bottle, Bitter, Ridge, Snake, Chow Chow, Tindora, Ash Gourd, Pumpkin)
  {
    keywords: ["pumpkin"],
    url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: [
      "gourd",
      "lauki",
      "bottle gourd",
      "bitter gourd",
      "ridge gourd",
      "snake gourd",
      "tindora",
      "thondekai",
      "tinda",
      "parwal",
      "chow chow",
      "chayote",
      "drumstick",
      "erilikaay",
    ],
    url: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=80",
  },
  // Herbs & Greens (Coriander, Mint, Methi, Curry Leaves, Spring Onion, Lettuce)
  {
    keywords: ["coriander", "kothambari", "cilantro"],
    url: "https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["mint", "pudina"],
    url: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["curry leaves", "curry leaf"],
    url: "https://images.unsplash.com/photo-1615485500807-6f76a59966aa?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["lettuce", "litius", "satary", "leek"],
    url: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["methi", "fenugreek", "spring onion", "leaves", "leafy"],
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
  },
  // Watermelon & Muskmelon
  {
    keywords: ["watermelon", "muskmelon", "sweet melon", "melon", "kiran"],
    url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80",
  },
  // Pomegranate
  {
    keywords: ["pomegranate", "anaar"],
    url: "https://images.unsplash.com/photo-1615485290176-90f9b60b73c4?w=500&auto=format&fit=crop&q=80",
  },
  // Papaya
  {
    keywords: ["papaya", "green papaya"],
    url: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=500&auto=format&fit=crop&q=80",
  },
  // Pineapple
  {
    keywords: ["pineapple", "ananas"],
    url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&auto=format&fit=crop&q=80",
  },
  // Grapes
  {
    keywords: ["grape", "grapes", "sharad", "paneer grapes"],
    url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop&q=80",
  },
  // Citrus: Orange & Mosambi
  {
    keywords: ["orange", "mosambi", "sweet lime", "santra"],
    url: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=80",
  },
  // Kiwi
  {
    keywords: ["kiwi"],
    url: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500&auto=format&fit=crop&q=80",
  },
  // Avocado
  {
    keywords: ["avocado", "butter fruit"],
    url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80",
  },
  // Strawberry
  {
    keywords: ["strawberry", "strawberries"],
    url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80",
  },
  // Guava
  {
    keywords: ["guava", "amrud"],
    url: "https://images.unsplash.com/photo-1536511135899-70f90e9df159?w=500&auto=format&fit=crop&q=80",
  },
  // Dragon Fruit
  {
    keywords: ["dragon fruit", "pitaya"],
    url: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=500&auto=format&fit=crop&q=80",
  },
  // Dates & Tamarind
  {
    keywords: ["dates", "date", "sweet tamarind", "tamarind"],
    url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=500&auto=format&fit=crop&q=80",
  },
  // Eggs
  {
    keywords: ["egg", "eggs", "suguna", "nati eggs"],
    url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80",
  },
  // Jackfruit
  {
    keywords: ["jackfruit", "kathal"],
    url: "https://images.unsplash.com/photo-1620574387735-3624d75b2def?w=500&auto=format&fit=crop&q=80",
  },
  // Sapota / Chikoo
  {
    keywords: ["sapota", "chikoo", "chiku", "custard apple", "custard fruit", "sitaphal"],
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
  },
  // Roots (Yam, Sweet Potato, Tapioca, Colocasia, Koorka)
  {
    keywords: ["yam", "sweet potato", "tapioca", "colocasia", "aravi", "chena", "koorka", "turmeric"],
    url: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=500&auto=format&fit=crop&q=80",
  },
  // Zucchini
  {
    keywords: ["zucchini", "courgette"],
    url: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=80",
  },
  // Pears & Plums & Persimmon & Ber
  {
    keywords: ["pear", "plum", "persimmon", "ber", "jujube", "lychee", "rambutan", "star fruit"],
    url: "https://images.unsplash.com/photo-1517425816982-f54f15d2a632?w=500&auto=format&fit=crop&q=80",
  },
  // Gooseberry / Amla
  {
    keywords: ["amla", "gooseberry"],
    url: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500&auto=format&fit=crop&q=80",
  },
];

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  v: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80", // Vegetables
  Vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
  l: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80", // Leafy
  Leafy: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
  "Leafy greens": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
  f: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80", // Fruits
  Fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80",
  m: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80", // Mangoes
  Mangoes: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80",
  x: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80", // Exotic
  "Exotic & imported": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80",
  Exotics: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80",
  o: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80", // Eggs & more
  "Eggs & more": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80",
  Others: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80";

/**
 * Returns a high-quality, realistic Unsplash image URL tailored to the product name or category.
 */
export function getProductImageUrl(name: string, category?: string | null): string {
  if (!name) {
    if (category && CATEGORY_FALLBACK_IMAGES[category]) {
      return CATEGORY_FALLBACK_IMAGES[category];
    }
    return DEFAULT_IMAGE;
  }

  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Try keyword matching
  for (const entry of KEYWORD_IMAGES) {
    for (const kw of entry.keywords) {
      if (clean.includes(kw)) {
        return entry.url;
      }
    }
  }

  // 2. Category fallback
  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }

  return DEFAULT_IMAGE;
}
