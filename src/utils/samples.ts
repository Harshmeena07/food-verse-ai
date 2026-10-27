// Curated sample assets for instant exploration in Food Verse AI

export interface SampleItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category?: string;
  storage?: string;
  date?: string;
  notes?: string;
}

export const FOOD_RECOGNITION_SAMPLES: SampleItem[] = [
  {
    id: 'rec_salmon_bowl',
    name: 'Grilled Salmon Power Bowl',
    description: 'Wild salmon fillet over quinoa, roasted asparagus, edamame & avocado.',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80',
    notes: 'Homemade healthy lunch with olive oil dressing.',
  },
  {
    id: 'rec_avocado_toast',
    name: 'Poached Egg Avocado Toast',
    description: 'Artisan sourdough with smashed avocado, poached eggs, radish & chili flakes.',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&auto=format&fit=crop&q=80',
    notes: 'Café brunch serving with microgreens.',
  },
  {
    id: 'rec_pasta_primavera',
    name: 'Pasta Primavera',
    description: 'Fresh fettuccine tossed with cherry tomatoes, basil, parmesan & zucchini.',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169e?w=900&auto=format&fit=crop&q=80',
    notes: 'Italian pasta dish with light olive oil sauce.',
  },
  {
    id: 'rec_fruit_parfait',
    name: 'Berry Greek Yogurt Parfait',
    description: 'Greek yogurt layered with blueberries, strawberries, chia seeds & granola.',
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&auto=format&fit=crop&q=80',
    notes: 'Breakfast parfait with raw organic honey.',
  },
];

export const FRESHNESS_SAMPLES: SampleItem[] = [
  {
    id: 'fresh_strawberries',
    name: 'Fresh Strawberries',
    description: 'Bright red firm strawberries with healthy green calyx.',
    url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=900&auto=format&fit=crop&q=80',
    category: 'Fruits',
    storage: 'Refrigerator crisper drawer, vented container',
    date: 'Purchased 2 days ago',
  },
  {
    id: 'fresh_banana',
    name: 'Ripe Bananas (Sugar Spots)',
    description: 'Yellow bananas with scattered small brown sugar spots.',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=900&auto=format&fit=crop&q=80',
    category: 'Fruits',
    storage: 'Countertop ambient room temperature (21°C)',
    date: 'Purchased 5 days ago',
  },
  {
    id: 'fresh_artisan_bread',
    name: 'Sourdough Country Loaf',
    description: 'Rustic sourdough bread with crisp crust and open crumb structure.',
    url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=900&auto=format&fit=crop&q=80',
    category: 'Bakery & Grains',
    storage: 'Cloth bread bag in dry pantry',
    date: 'Baked 3 days ago',
  },
  {
    id: 'fresh_spinach',
    name: 'Fresh Spinach & Greens',
    description: 'Crisp green leaves with slight edge softening.',
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&auto=format&fit=crop&q=80',
    category: 'Vegetables',
    storage: 'Refrigerated in produce bag',
    date: 'Purchased 6 days ago',
  },
];

export const HYGIENE_SAMPLES: SampleItem[] = [
  {
    id: 'hyg_stainless_kitchen',
    name: 'Commercial Cookline & Prep Station',
    description: 'Commercial kitchen cookline with stainless steel surfaces and range hoods.',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop&q=80',
    notes: 'Active restaurant prep station mid-service.',
  },
  {
    id: 'hyg_bakery_station',
    name: 'Artisan Bakery Workstation',
    description: 'Flour dusted wooden prep table with bread shaping boards.',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80',
    notes: 'Morning baking station before daily clean-down.',
  },
  {
    id: 'hyg_salad_counter',
    name: 'Chilled Salad & Deli Bar',
    description: 'Refrigerated ingredient inserts with sneeze guard partitions.',
    url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&auto=format&fit=crop&q=80',
    notes: 'Customer-facing assembly line during lunch hour.',
  },
];
