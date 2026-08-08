import { normalizeName } from '../lib/normalize';

/**
 * A small decorative emoji for an ingredient or a dish.
 *
 * Purely ornamental: emoji is never the only carrier of meaning, and an
 * unknown ingredient simply gets no icon rather than a wrong one.
 */
const ENTRIES: Array<[string, readonly string[]]> = [
  ['🍅', ['tomato', 'tomatoes', '番茄', '西红柿', 'tomate']],
  ['🥚', ['egg', 'eggs', '鸡蛋', '蛋', 'oeuf', 'œuf']],
  ['🥔', ['potato', 'potatoes', '土豆', '马铃薯', 'pomme de terre']],
  ['🥩', ['beef', 'steak', 'lamb', 'pork', '牛肉', '猪肉', '羊肉', 'boeuf', 'bœuf', 'porc', 'agneau']],
  ['🧅', ['onion', 'shallot', '洋葱', '葱头', 'oignon', 'echalote']],
  ['🧄', ['garlic', '大蒜', '蒜', 'ail']],
  ['🐔', ['chicken', 'chicken breast', '鸡肉', '鸡胸肉', '鸡', 'poulet']],
  ['🐟', ['fish', 'salmon', 'cod', 'tuna', '鱼', '三文鱼', '鳕鱼', 'poisson', 'saumon', 'thon']],
  ['🍤', ['shrimp', 'prawn', '虾', 'crevette']],
  ['🍚', ['rice', '米', '大米', '米饭', 'riz']],
  ['🍜', ['noodles', 'noodle', 'ramen', 'udon', '面条', '面', '拉面', 'nouilles']],
  ['🍝', ['pasta', 'spaghetti', 'penne', '意面', 'pates', 'pâtes']],
  ['🥛', ['milk', 'cream', '牛奶', '奶油', '淡奶油', 'lait', 'creme', 'crème']],
  ['🧀', ['cheese', 'parmesan', 'mozzarella', '奶酪', '芝士', 'fromage']],
  ['🥕', ['carrot', '胡萝卜', 'carotte']],
  ['🥦', ['broccoli', '西兰花', 'brocoli']],
  ['🍆', ['eggplant', 'aubergine', '茄子']],
  ['🌶️', ['chilli', 'chili', 'chile', '辣椒', 'piment']],
  ['🫑', ['pepper', 'bell pepper', 'capsicum', '青椒', '彩椒', 'poivron']],
  ['🍄', ['mushroom', 'mushrooms', '蘑菇', '香菇', 'champignon']],
  ['🥬', ['cabbage', 'lettuce', 'spinach', 'greens', '白菜', '生菜', '菠菜', '青菜', 'chou', 'laitue', 'epinard']],
  ['🥒', ['cucumber', 'zucchini', 'courgette', '黄瓜', '西葫芦', 'concombre']],
  ['🌽', ['corn', 'sweetcorn', '玉米', 'mais', 'maïs']],
  ['🫘', ['beans', 'bean', 'lentils', '豆', '豆子', '扁豆', 'haricot', 'lentille']],
  ['🍞', ['bread', 'baguette', '面包', 'pain']],
  ['🧈', ['tofu', '豆腐']],
  ['🍋', ['lemon', 'lime', '柠檬', 'citron']],
  ['🍎', ['apple', '苹果', 'pomme']],
  ['🍓', ['strawberry', '草莓', 'fraise']],
  ['🍫', ['chocolate', '巧克力', 'chocolat']],
  ['🍯', ['honey', '蜂蜜', 'miel']],
  ['🥥', ['coconut', '椰子', 'noix de coco', 'coco']],
  ['🫒', ['olive', 'olives', '橄榄']],
  ['🍲', ['soup', 'stew', '汤', '炖', 'soupe', 'ragout']],
  ['🥗', ['salad', '沙拉', 'salade']],
  ['🍰', ['cake', 'dessert', '蛋糕', '甜点', 'gateau', 'gâteau']],
  ['🍮', ['pudding', 'custard', 'flan', '布丁', 'creme caramel']],
];

const LOOKUP = new Map<string, string>();
for (const [emoji, names] of ENTRIES) {
  for (const name of names) {
    const key = normalizeName(name);
    if (key && !LOOKUP.has(key)) LOOKUP.set(key, emoji);
  }
}

/** Exact-ish icon for an ingredient chip, or undefined when unknown. */
export function ingredientEmoji(name: string): string | undefined {
  const key = normalizeName(name);
  if (!key) return undefined;
  const direct = LOOKUP.get(key);
  if (direct) return direct;

  // "chicken breast" → 🐔. Only whole-word / ideographic containment.
  for (const [candidate, emoji] of LOOKUP) {
    if (candidate.length < 3) continue;
    if (key.includes(candidate)) return emoji;
  }
  return undefined;
}

/** Fallback icons by recipe category, used when a recipe has no emoji of its own. */
export const CATEGORY_EMOJI: Record<string, string> = {
  main: '🍽️',
  appetizer: '🥟',
  salad: '🥗',
  soup: '🍲',
  dessert: '🍮',
  snack: '🍪',
  other: '🍳',
};

/** Small pixel-ish food set used for decoration around the title. */
export const DECOR_FOODS = ['🍓', '🍳', '🍅', '🍜', '🥕'] as const;
