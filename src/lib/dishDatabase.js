/**
 * Menu DNA — Dish Ingredient Database
 * Common restaurant dishes with ingredients and estimated food costs (INR).
 * Used for auto-suggesting ingredients and cost when a restaurant owner
 * enters a dish name manually.
 */

const DISH_DATABASE = [
  // ── Starters ──────────────────────────────────────────────────────
  {
    name: 'Paneer Tikka',
    category: 'Starters',
    ingredients: ['Paneer', 'Yogurt', 'Red chili powder', 'Garam masala', 'Ginger-garlic paste', 'Lemon juice', 'Capsicum', 'Onion', 'Oil'],
    estimatedCost: 95,
  },
  {
    name: 'Chicken Tikka',
    category: 'Starters',
    ingredients: ['Chicken breast', 'Yogurt', 'Red chili powder', 'Turmeric', 'Ginger-garlic paste', 'Lemon juice', 'Kashmiri chili', 'Oil'],
    estimatedCost: 110,
  },
  {
    name: 'Fish Amritsari',
    category: 'Starters',
    ingredients: ['Fish fillets', 'Gram flour', 'Rice flour', 'Ajwain', 'Red chili powder', 'Ginger-garlic paste', 'Lemon juice', 'Oil for frying'],
    estimatedCost: 140,
  },
  {
    name: 'Veg Spring Roll',
    category: 'Starters',
    ingredients: ['Spring roll sheets', 'Cabbage', 'Carrot', 'Capsicum', 'Spring onion', 'Soy sauce', 'Vinegar', 'Oil'],
    estimatedCost: 55,
  },
  {
    name: 'Chicken Wings',
    category: 'Starters',
    ingredients: ['Chicken wings', 'Hot sauce', 'Butter', 'Garlic powder', 'Paprika', 'Salt', 'Pepper', 'Oil'],
    estimatedCost: 120,
  },
  {
    name: 'Hara Bhara Kebab',
    category: 'Starters',
    ingredients: ['Spinach', 'Green peas', 'Potato', 'Green chili', 'Ginger', 'Cumin', 'Breadcrumbs', 'Oil'],
    estimatedCost: 60,
  },
  {
    name: 'Seekh Kebab',
    category: 'Starters',
    ingredients: ['Minced mutton', 'Onion', 'Green chili', 'Ginger-garlic paste', 'Garam masala', 'Coriander leaves', 'Egg', 'Oil'],
    estimatedCost: 150,
  },
  {
    name: 'Crispy Corn',
    category: 'Starters',
    ingredients: ['Sweet corn', 'Cornflour', 'Maida', 'Red chili flakes', 'Garlic', 'Spring onion', 'Soy sauce', 'Oil'],
    estimatedCost: 50,
  },
  {
    name: 'Tandoori Mushroom',
    category: 'Starters',
    ingredients: ['Button mushrooms', 'Yogurt', 'Tandoori masala', 'Ginger-garlic paste', 'Lemon juice', 'Capsicum', 'Oil'],
    estimatedCost: 70,
  },
  {
    name: 'Prawn Koliwada',
    category: 'Starters',
    ingredients: ['Prawns', 'Gram flour', 'Rice flour', 'Red chili powder', 'Turmeric', 'Ginger-garlic paste', 'Lemon', 'Oil'],
    estimatedCost: 160,
  },

  // ── Mains (Indian) ────────────────────────────────────────────────
  {
    name: 'Butter Chicken',
    category: 'Mains',
    ingredients: ['Chicken', 'Tomato puree', 'Butter', 'Cream', 'Cashew paste', 'Ginger-garlic paste', 'Garam masala', 'Kashmiri chili', 'Fenugreek leaves'],
    estimatedCost: 145,
  },
  {
    name: 'Grilled Chicken',
    category: 'Mains',
    ingredients: ['Chicken breast', 'Olive oil', 'Garlic', 'Lemon', 'Mixed herbs', 'Salt', 'Pepper', 'Butter'],
    estimatedCost: 130,
  },
  {
    name: 'Dal Makhani',
    category: 'Mains',
    ingredients: ['Black urad dal', 'Rajma', 'Butter', 'Cream', 'Tomato puree', 'Ginger-garlic paste', 'Cumin', 'Garam masala'],
    estimatedCost: 65,
  },
  {
    name: 'Palak Paneer',
    category: 'Mains',
    ingredients: ['Paneer', 'Spinach', 'Onion', 'Tomato', 'Green chili', 'Ginger-garlic paste', 'Cream', 'Cumin'],
    estimatedCost: 90,
  },
  {
    name: 'Chicken Biryani',
    category: 'Mains',
    ingredients: ['Basmati rice', 'Chicken', 'Yogurt', 'Onion', 'Tomato', 'Biryani masala', 'Saffron', 'Mint', 'Ghee', 'Oil'],
    estimatedCost: 140,
  },
  {
    name: 'Lamb Rogan Josh',
    category: 'Mains',
    ingredients: ['Lamb', 'Yogurt', 'Onion', 'Tomato', 'Kashmiri chili', 'Ginger-garlic paste', 'Fennel powder', 'Garam masala', 'Oil'],
    estimatedCost: 200,
  },
  {
    name: 'Paneer Butter Masala',
    category: 'Mains',
    ingredients: ['Paneer', 'Tomato puree', 'Butter', 'Cream', 'Cashew paste', 'Ginger-garlic paste', 'Kashmiri chili', 'Fenugreek leaves'],
    estimatedCost: 100,
  },
  {
    name: 'Mixed Veg Handi',
    category: 'Mains',
    ingredients: ['Mixed vegetables', 'Onion', 'Tomato', 'Cream', 'Cashew paste', 'Ginger-garlic paste', 'Garam masala', 'Oil'],
    estimatedCost: 75,
  },
  {
    name: 'Prawn Masala',
    category: 'Mains',
    ingredients: ['Prawns', 'Onion', 'Tomato', 'Coconut milk', 'Green chili', 'Ginger-garlic paste', 'Turmeric', 'Curry leaves', 'Oil'],
    estimatedCost: 180,
  },
  {
    name: 'Chole Bhature',
    category: 'Mains',
    ingredients: ['Chickpeas', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Chole masala', 'Maida', 'Yogurt', 'Oil for frying'],
    estimatedCost: 55,
  },
  {
    name: 'Kadai Paneer',
    category: 'Mains',
    ingredients: ['Paneer', 'Capsicum', 'Onion', 'Tomato', 'Kadai masala', 'Coriander', 'Ginger', 'Oil'],
    estimatedCost: 95,
  },
  {
    name: 'Mutton Keema',
    category: 'Mains',
    ingredients: ['Minced mutton', 'Onion', 'Tomato', 'Green peas', 'Ginger-garlic paste', 'Garam masala', 'Green chili', 'Oil'],
    estimatedCost: 170,
  },
  {
    name: 'Egg Curry',
    category: 'Mains',
    ingredients: ['Eggs', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Turmeric', 'Red chili powder', 'Garam masala', 'Oil'],
    estimatedCost: 50,
  },
  {
    name: 'Mushroom Masala',
    category: 'Mains',
    ingredients: ['Mushrooms', 'Onion', 'Tomato', 'Capsicum', 'Ginger-garlic paste', 'Garam masala', 'Cream', 'Oil'],
    estimatedCost: 80,
  },
  {
    name: 'Fish Curry',
    category: 'Mains',
    ingredients: ['Fish', 'Onion', 'Tomato', 'Coconut milk', 'Tamarind', 'Curry leaves', 'Mustard seeds', 'Turmeric', 'Oil'],
    estimatedCost: 150,
  },
  {
    name: 'Rajma Chawal',
    category: 'Mains',
    ingredients: ['Rajma', 'Basmati rice', 'Onion', 'Tomato', 'Ginger-garlic paste', 'Cumin', 'Garam masala', 'Oil'],
    estimatedCost: 50,
  },
  {
    name: 'Chicken Korma',
    category: 'Mains',
    ingredients: ['Chicken', 'Yogurt', 'Onion', 'Cashew paste', 'Cream', 'Ginger-garlic paste', 'Cardamom', 'Saffron', 'Ghee'],
    estimatedCost: 155,
  },
  {
    name: 'Mushroom Risotto',
    category: 'Mains',
    ingredients: ['Arborio rice', 'Mushrooms', 'Onion', 'Garlic', 'White wine', 'Parmesan', 'Butter', 'Vegetable stock', 'Olive oil'],
    estimatedCost: 130,
  },

  // ── Burgers & Sandwiches ──────────────────────────────────────────
  {
    name: 'Burger',
    category: 'Snacks',
    ingredients: ['Burger bun', 'Chicken/Veg patty', 'Lettuce', 'Tomato', 'Onion', 'Cheese slice', 'Mayonnaise', 'Ketchup', 'Pickles'],
    estimatedCost: 75,
  },
  {
    name: 'Chicken Burger',
    category: 'Snacks',
    ingredients: ['Burger bun', 'Chicken patty', 'Lettuce', 'Tomato', 'Onion', 'Cheese slice', 'Mayonnaise', 'Ketchup'],
    estimatedCost: 85,
  },
  {
    name: 'Veg Burger',
    category: 'Snacks',
    ingredients: ['Burger bun', 'Potato-peas patty', 'Lettuce', 'Tomato', 'Onion', 'Cheese slice', 'Mayonnaise', 'Ketchup'],
    estimatedCost: 55,
  },
  {
    name: 'Club Sandwich',
    category: 'Snacks',
    ingredients: ['Bread slices', 'Chicken/Paneer', 'Lettuce', 'Tomato', 'Cucumber', 'Cheese', 'Mayonnaise', 'Butter'],
    estimatedCost: 80,
  },
  {
    name: 'Grilled Sandwich',
    category: 'Snacks',
    ingredients: ['Bread', 'Capsicum', 'Onion', 'Tomato', 'Corn', 'Cheese', 'Butter', 'Chutney'],
    estimatedCost: 50,
  },
  {
    name: 'Wrap',
    category: 'Snacks',
    ingredients: ['Tortilla/Roti', 'Chicken/Paneer', 'Lettuce', 'Onion', 'Capsicum', 'Mayonnaise', 'Hot sauce'],
    estimatedCost: 70,
  },
  {
    name: 'French Fries',
    category: 'Snacks',
    ingredients: ['Potatoes', 'Salt', 'Paprika', 'Oil for frying'],
    estimatedCost: 30,
  },

  // ── Pizza & Pasta ─────────────────────────────────────────────────
  {
    name: 'Margherita Pizza',
    category: 'Pizza',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Fresh basil', 'Olive oil', 'Salt'],
    estimatedCost: 90,
  },
  {
    name: 'Chicken Pizza',
    category: 'Pizza',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Grilled chicken', 'Capsicum', 'Onion', 'Olives', 'Oregano'],
    estimatedCost: 120,
  },
  {
    name: 'Paneer Pizza',
    category: 'Pizza',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Paneer', 'Capsicum', 'Onion', 'Corn', 'Oregano'],
    estimatedCost: 105,
  },
  {
    name: 'Pasta Alfredo',
    category: 'Pasta',
    ingredients: ['Penne/Fettuccine', 'Butter', 'Cream', 'Parmesan', 'Garlic', 'Mushrooms', 'Salt', 'Pepper'],
    estimatedCost: 85,
  },
  {
    name: 'Pasta Arrabiata',
    category: 'Pasta',
    ingredients: ['Penne', 'Tomato sauce', 'Garlic', 'Red chili flakes', 'Olive oil', 'Basil', 'Parmesan'],
    estimatedCost: 70,
  },
  {
    name: 'Spaghetti Bolognese',
    category: 'Pasta',
    ingredients: ['Spaghetti', 'Minced chicken/mutton', 'Tomato puree', 'Onion', 'Garlic', 'Carrot', 'Celery', 'Olive oil', 'Parmesan'],
    estimatedCost: 110,
  },

  // ── Rice ──────────────────────────────────────────────────────────
  {
    name: 'Veg Biryani',
    category: 'Rice',
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Yogurt', 'Onion', 'Biryani masala', 'Saffron', 'Mint', 'Ghee', 'Oil'],
    estimatedCost: 80,
  },
  {
    name: 'Mutton Biryani',
    category: 'Rice',
    ingredients: ['Basmati rice', 'Mutton', 'Yogurt', 'Onion', 'Biryani masala', 'Saffron', 'Mint', 'Rose water', 'Ghee'],
    estimatedCost: 210,
  },
  {
    name: 'Egg Fried Rice',
    category: 'Rice',
    ingredients: ['Rice', 'Eggs', 'Spring onion', 'Carrot', 'Capsicum', 'Soy sauce', 'Vinegar', 'Oil'],
    estimatedCost: 50,
  },
  {
    name: 'Jeera Rice',
    category: 'Rice',
    ingredients: ['Basmati rice', 'Cumin seeds', 'Ghee', 'Bay leaf', 'Salt'],
    estimatedCost: 35,
  },
  {
    name: 'Pulao',
    category: 'Rice',
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Whole spices', 'Ghee', 'Onion', 'Ginger', 'Salt'],
    estimatedCost: 45,
  },

  // ── Breads ────────────────────────────────────────────────────────
  {
    name: 'Butter Naan',
    category: 'Breads',
    ingredients: ['Maida', 'Yogurt', 'Baking powder', 'Sugar', 'Butter', 'Salt'],
    estimatedCost: 12,
  },
  {
    name: 'Garlic Naan',
    category: 'Breads',
    ingredients: ['Maida', 'Yogurt', 'Garlic', 'Coriander', 'Butter', 'Salt'],
    estimatedCost: 15,
  },
  {
    name: 'Tandoori Roti',
    category: 'Breads',
    ingredients: ['Whole wheat flour', 'Salt', 'Water'],
    estimatedCost: 8,
  },
  {
    name: 'Cheese Naan',
    category: 'Breads',
    ingredients: ['Maida', 'Yogurt', 'Mozzarella', 'Butter', 'Sugar', 'Salt'],
    estimatedCost: 25,
  },
  {
    name: 'Laccha Paratha',
    category: 'Breads',
    ingredients: ['Maida', 'Ghee', 'Salt', 'Water'],
    estimatedCost: 15,
  },
  {
    name: 'Kulcha',
    category: 'Breads',
    ingredients: ['Maida', 'Yogurt', 'Baking powder', 'Onion', 'Coriander', 'Butter'],
    estimatedCost: 18,
  },

  // ── Salads ────────────────────────────────────────────────────────
  {
    name: 'Caesar Salad',
    category: 'Salads',
    ingredients: ['Romaine lettuce', 'Parmesan', 'Croutons', 'Caesar dressing', 'Lemon juice', 'Olive oil', 'Garlic'],
    estimatedCost: 85,
  },
  {
    name: 'Greek Salad',
    category: 'Salads',
    ingredients: ['Cucumber', 'Tomato', 'Red onion', 'Olives', 'Feta cheese', 'Olive oil', 'Oregano', 'Lemon'],
    estimatedCost: 90,
  },
  {
    name: 'Garden Salad',
    category: 'Salads',
    ingredients: ['Mixed greens', 'Cucumber', 'Tomato', 'Carrot', 'Onion', 'Lemon dressing'],
    estimatedCost: 45,
  },

  // ── Beverages ─────────────────────────────────────────────────────
  {
    name: 'Masala Chai',
    category: 'Beverages',
    ingredients: ['Tea leaves', 'Milk', 'Sugar', 'Ginger', 'Cardamom', 'Cinnamon'],
    estimatedCost: 15,
  },
  {
    name: 'Mango Lassi',
    category: 'Beverages',
    ingredients: ['Yogurt', 'Mango pulp', 'Sugar', 'Cardamom', 'Ice'],
    estimatedCost: 35,
  },
  {
    name: 'Fresh Lime Soda',
    category: 'Beverages',
    ingredients: ['Lemon', 'Sugar/Salt', 'Soda water', 'Mint', 'Ice'],
    estimatedCost: 15,
  },
  {
    name: 'Cold Coffee',
    category: 'Beverages',
    ingredients: ['Coffee', 'Milk', 'Sugar', 'Ice cream', 'Ice', 'Chocolate syrup'],
    estimatedCost: 40,
  },
  {
    name: 'Buttermilk',
    category: 'Beverages',
    ingredients: ['Yogurt', 'Water', 'Cumin', 'Mint', 'Coriander', 'Salt', 'Green chili'],
    estimatedCost: 12,
  },
  {
    name: 'Mojito',
    category: 'Beverages',
    ingredients: ['Lime', 'Mint', 'Sugar', 'Soda water', 'Ice', 'Sprite'],
    estimatedCost: 25,
  },

  // ── Desserts ──────────────────────────────────────────────────────
  {
    name: 'Chocolate Lava Cake',
    category: 'Desserts',
    ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Sugar', 'Maida', 'Vanilla extract', 'Cocoa powder'],
    estimatedCost: 65,
  },
  {
    name: 'Gulab Jamun',
    category: 'Desserts',
    ingredients: ['Khoya', 'Maida', 'Cardamom', 'Sugar', 'Rose water', 'Ghee for frying'],
    estimatedCost: 30,
  },
  {
    name: 'Rasmalai',
    category: 'Desserts',
    ingredients: ['Paneer/Chenna', 'Milk', 'Sugar', 'Cardamom', 'Saffron', 'Pistachios'],
    estimatedCost: 45,
  },
  {
    name: 'Brownie',
    category: 'Desserts',
    ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Sugar', 'Maida', 'Cocoa powder', 'Walnuts'],
    estimatedCost: 55,
  },
  {
    name: 'Ice Cream Sundae',
    category: 'Desserts',
    ingredients: ['Ice cream', 'Chocolate sauce', 'Whipped cream', 'Sprinkles', 'Cherry', 'Wafer'],
    estimatedCost: 50,
  },
  {
    name: 'Kheer',
    category: 'Desserts',
    ingredients: ['Rice', 'Milk', 'Sugar', 'Cardamom', 'Almonds', 'Raisins', 'Saffron'],
    estimatedCost: 35,
  },
  {
    name: 'Rasgulla',
    category: 'Desserts',
    ingredients: ['Chenna', 'Sugar', 'Water', 'Cardamom', 'Rose water'],
    estimatedCost: 25,
  },

  // ── Chinese / Indo-Chinese ────────────────────────────────────────
  {
    name: 'Manchurian',
    category: 'Starters',
    ingredients: ['Cabbage', 'Carrot', 'Capsicum', 'Cornflour', 'Maida', 'Soy sauce', 'Chili sauce', 'Vinegar', 'Garlic', 'Spring onion', 'Oil'],
    estimatedCost: 55,
  },
  {
    name: 'Chilli Chicken',
    category: 'Starters',
    ingredients: ['Chicken', 'Capsicum', 'Onion', 'Cornflour', 'Soy sauce', 'Chili sauce', 'Vinegar', 'Garlic', 'Green chili', 'Oil'],
    estimatedCost: 115,
  },
  {
    name: 'Hakka Noodles',
    category: 'Mains',
    ingredients: ['Noodles', 'Cabbage', 'Carrot', 'Capsicum', 'Spring onion', 'Soy sauce', 'Vinegar', 'Oil'],
    estimatedCost: 55,
  },
  {
    name: 'Fried Rice',
    category: 'Rice',
    ingredients: ['Rice', 'Mixed vegetables', 'Soy sauce', 'Vinegar', 'Spring onion', 'Garlic', 'Oil'],
    estimatedCost: 50,
  },
  {
    name: 'Chilli Paneer',
    category: 'Starters',
    ingredients: ['Paneer', 'Capsicum', 'Onion', 'Cornflour', 'Soy sauce', 'Chili sauce', 'Vinegar', 'Garlic', 'Oil'],
    estimatedCost: 90,
  },
  {
    name: 'Sweet Corn Soup',
    category: 'Soups',
    ingredients: ['Sweet corn', 'Egg', 'Cornflour', 'Vegetable stock', 'Pepper', 'Soy sauce', 'Salt'],
    estimatedCost: 30,
  },
  {
    name: 'Hot & Sour Soup',
    category: 'Soups',
    ingredients: ['Mixed vegetables', 'Tofu', 'Cornflour', 'Soy sauce', 'Vinegar', 'Chili sauce', 'Pepper', 'Spring onion'],
    estimatedCost: 35,
  },
  {
    name: 'Momos',
    category: 'Starters',
    ingredients: ['Maida', 'Chicken/Vegetables', 'Onion', 'Garlic', 'Ginger', 'Soy sauce', 'Oil', 'Chutney'],
    estimatedCost: 50,
  },

  // ── South Indian ──────────────────────────────────────────────────
  {
    name: 'Masala Dosa',
    category: 'South Indian',
    ingredients: ['Rice', 'Urad dal', 'Potato', 'Onion', 'Mustard seeds', 'Curry leaves', 'Turmeric', 'Green chili', 'Oil'],
    estimatedCost: 40,
  },
  {
    name: 'Idli',
    category: 'South Indian',
    ingredients: ['Rice', 'Urad dal', 'Salt', 'Fenugreek seeds'],
    estimatedCost: 20,
  },
  {
    name: 'Vada',
    category: 'South Indian',
    ingredients: ['Urad dal', 'Onion', 'Green chili', 'Curry leaves', 'Ginger', 'Oil for frying'],
    estimatedCost: 25,
  },
  {
    name: 'Uttapam',
    category: 'South Indian',
    ingredients: ['Dosa batter', 'Onion', 'Tomato', 'Capsicum', 'Coriander', 'Oil'],
    estimatedCost: 35,
  },
  {
    name: 'Appam',
    category: 'South Indian',
    ingredients: ['Rice flour', 'Coconut milk', 'Yeast', 'Sugar', 'Salt'],
    estimatedCost: 25,
  },

  // ── Street Food / Chaat ───────────────────────────────────────────
  {
    name: 'Pav Bhaji',
    category: 'Snacks',
    ingredients: ['Mixed vegetables', 'Pav buns', 'Butter', 'Pav bhaji masala', 'Onion', 'Tomato', 'Lemon', 'Coriander'],
    estimatedCost: 45,
  },
  {
    name: 'Pani Puri',
    category: 'Snacks',
    ingredients: ['Puri shells', 'Potato', 'Chickpeas', 'Onion', 'Tamarind chutney', 'Mint water', 'Chaat masala'],
    estimatedCost: 25,
  },
  {
    name: 'Samosa',
    category: 'Snacks',
    ingredients: ['Maida', 'Potato', 'Green peas', 'Cumin', 'Garam masala', 'Green chili', 'Oil for frying'],
    estimatedCost: 15,
  },
  {
    name: 'Aloo Tikki',
    category: 'Snacks',
    ingredients: ['Potato', 'Breadcrumbs', 'Green chili', 'Coriander', 'Cumin', 'Chaat masala', 'Oil'],
    estimatedCost: 20,
  },

  // ── Continental / Western ─────────────────────────────────────────
  {
    name: 'Fish and Chips',
    category: 'Mains',
    ingredients: ['Fish fillets', 'Potatoes', 'Maida', 'Beer/Soda', 'Salt', 'Tartar sauce', 'Lemon', 'Oil'],
    estimatedCost: 150,
  },
  {
    name: 'Grilled Fish',
    category: 'Mains',
    ingredients: ['Fish fillets', 'Lemon', 'Butter', 'Garlic', 'Mixed herbs', 'Olive oil', 'Salt', 'Pepper'],
    estimatedCost: 160,
  },
  {
    name: 'Steak',
    category: 'Mains',
    ingredients: ['Beef/Chicken steak', 'Butter', 'Garlic', 'Rosemary', 'Thyme', 'Salt', 'Pepper', 'Olive oil'],
    estimatedCost: 220,
  },
  {
    name: 'Soup of the Day',
    category: 'Soups',
    ingredients: ['Mixed vegetables', 'Butter', 'Cream', 'Stock', 'Onion', 'Garlic', 'Herbs', 'Salt', 'Pepper'],
    estimatedCost: 40,
  },
];

// ── Search & Match Functions ────────────────────────────────────────────────

/**
 * Fuzzy search dishes by name. Returns top matches sorted by relevance.
 */
export function searchDishes(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/);

  const scored = DISH_DATABASE.map(dish => {
    const name = dish.name.toLowerCase();

    // Exact match
    if (name === q) return { ...dish, score: 100 };

    // Starts with query
    if (name.startsWith(q)) return { ...dish, score: 90 };

    // Contains full query
    if (name.includes(q)) return { ...dish, score: 80 };

    // All words match
    const allWordsMatch = words.every(w => name.includes(w));
    if (allWordsMatch) return { ...dish, score: 70 };

    // Any word matches
    const matchingWords = words.filter(w => name.includes(w));
    if (matchingWords.length > 0) {
      return { ...dish, score: 40 + (matchingWords.length / words.length) * 30 };
    }

    // Ingredient match (lower priority)
    const ingredientMatch = dish.ingredients.some(ing =>
      ing.toLowerCase().includes(q)
    );
    if (ingredientMatch) return { ...dish, score: 20 };

    return null;
  }).filter(Boolean);

  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
}

/**
 * Get a dish by exact name (case-insensitive).
 */
export function getDishByName(name) {
  if (!name) return null;
  const q = name.trim().toLowerCase();
  return DISH_DATABASE.find(d => d.name.toLowerCase() === q) || null;
}

/**
 * Get all unique categories from the database.
 */
export function getAllCategories() {
  return [...new Set(DISH_DATABASE.map(d => d.category))].sort();
}

/**
 * Get all dishes in a category.
 */
export function getDishesByCategory(category) {
  return DISH_DATABASE.filter(d => d.category === category);
}

export default DISH_DATABASE;
