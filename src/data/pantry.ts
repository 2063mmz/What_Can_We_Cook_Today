import { normalizeName } from '../lib/normalize';

/**
 * Things almost everyone already has in the cupboard.
 *
 * A recipe is never rejected because one of these is missing — nobody wants
 * "you can't make this, you didn't tick salt". Users can still list them as
 * ingredients; they simply don't count towards the match score.
 */
const RAW_STAPLES = [
  // English
  'salt', 'sea salt', 'kosher salt', 'pepper', 'black pepper', 'white pepper',
  'sugar', 'brown sugar', 'caster sugar', 'water', 'oil', 'olive oil',
  'vegetable oil', 'cooking oil', 'sunflower oil', 'sesame oil', 'butter',
  'vinegar', 'white vinegar', 'rice vinegar', 'balsamic vinegar',
  'soy sauce', 'light soy sauce', 'dark soy sauce', 'oyster sauce',
  'fish sauce', 'flour', 'plain flour', 'all purpose flour', 'cornstarch',
  'corn starch', 'cornflour', 'baking powder', 'baking soda', 'honey',
  'mustard', 'ketchup', 'stock cube', 'bouillon', 'cooking wine',
  'rice wine', 'chilli flakes', 'chili flakes', 'paprika', 'cumin',
  'oregano', 'thyme', 'bay leaf', 'msg',

  // 中文
  '盐', '食盐', '海盐', '糖', '白糖', '砂糖', '冰糖', '水', '油', '食用油',
  '植物油', '橄榄油', '菜籽油', '香油', '芝麻油', '黄油', '醋', '白醋',
  '米醋', '香醋', '陈醋', '酱油', '生抽', '老抽', '蚝油', '鱼露', '料酒',
  '黄酒', '米酒', '胡椒', '胡椒粉', '黑胡椒', '白胡椒', '淀粉', '生粉',
  '玉米淀粉', '面粉', '味精', '鸡精', '小苏打', '泡打粉', '五香粉',
  '花椒', '辣椒粉', '孜然', '蜂蜜',

  // Français
  'sel', 'gros sel', 'poivre', 'sucre', 'eau', 'huile', 'huile d olive',
  'huile de tournesol', 'beurre', 'vinaigre', 'vinaigre balsamique',
  'sauce soja', 'farine', 'maizena', 'levure', 'bicarbonate', 'miel',
  'moutarde', 'paprika', 'cumin', 'thym', 'laurier', 'origan',
] as const;

const STAPLE_SET = new Set(RAW_STAPLES.map(normalizeName));

/** True when this ingredient should never block a recommendation. */
export function isPantryStaple(name: string): boolean {
  const key = normalizeName(name);
  if (!key) return true; // an empty row is not a real requirement
  return STAPLE_SET.has(key);
}
