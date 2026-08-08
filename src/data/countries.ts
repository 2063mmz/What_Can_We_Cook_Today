import type { Lang } from '../i18n';

/**
 * An explicit whitelist of cuisines the app offers. Flags are never generated
 * from arbitrary country codes — only the entries below can ever be shown.
 */
export interface Country {
  /** ISO 3166-1 alpha-2, lower case. Used as the stored value. */
  code: string;
  flag: string;
  names: Record<Lang, string>;
}

export const COUNTRIES: readonly Country[] = [
  { code: 'ar', flag: '🇦🇷', names: { en: 'Argentina', zh: '阿根廷', fr: 'Argentine' } },
  { code: 'au', flag: '🇦🇺', names: { en: 'Australia', zh: '澳大利亚', fr: 'Australie' } },
  { code: 'at', flag: '🇦🇹', names: { en: 'Austria', zh: '奥地利', fr: 'Autriche' } },
  { code: 'be', flag: '🇧🇪', names: { en: 'Belgium', zh: '比利时', fr: 'Belgique' } },
  { code: 'br', flag: '🇧🇷', names: { en: 'Brazil', zh: '巴西', fr: 'Brésil' } },
  { code: 'ca', flag: '🇨🇦', names: { en: 'Canada', zh: '加拿大', fr: 'Canada' } },
  { code: 'cl', flag: '🇨🇱', names: { en: 'Chile', zh: '智利', fr: 'Chili' } },
  { code: 'cn', flag: '🇨🇳', names: { en: 'China', zh: '中国', fr: 'Chine' } },
  { code: 'co', flag: '🇨🇴', names: { en: 'Colombia', zh: '哥伦比亚', fr: 'Colombie' } },
  { code: 'hr', flag: '🇭🇷', names: { en: 'Croatia', zh: '克罗地亚', fr: 'Croatie' } },
  { code: 'cz', flag: '🇨🇿', names: { en: 'Czechia', zh: '捷克', fr: 'Tchéquie' } },
  { code: 'dk', flag: '🇩🇰', names: { en: 'Denmark', zh: '丹麦', fr: 'Danemark' } },
  { code: 'eg', flag: '🇪🇬', names: { en: 'Egypt', zh: '埃及', fr: 'Égypte' } },
  { code: 'et', flag: '🇪🇹', names: { en: 'Ethiopia', zh: '埃塞俄比亚', fr: 'Éthiopie' } },
  { code: 'fr', flag: '🇫🇷', names: { en: 'France', zh: '法国', fr: 'France' } },
  { code: 'de', flag: '🇩🇪', names: { en: 'Germany', zh: '德国', fr: 'Allemagne' } },
  { code: 'gr', flag: '🇬🇷', names: { en: 'Greece', zh: '希腊', fr: 'Grèce' } },
  { code: 'hu', flag: '🇭🇺', names: { en: 'Hungary', zh: '匈牙利', fr: 'Hongrie' } },
  { code: 'in', flag: '🇮🇳', names: { en: 'India', zh: '印度', fr: 'Inde' } },
  { code: 'id', flag: '🇮🇩', names: { en: 'Indonesia', zh: '印度尼西亚', fr: 'Indonésie' } },
  { code: 'ir', flag: '🇮🇷', names: { en: 'Iran', zh: '伊朗', fr: 'Iran' } },
  { code: 'ie', flag: '🇮🇪', names: { en: 'Ireland', zh: '爱尔兰', fr: 'Irlande' } },
  { code: 'il', flag: '🇮🇱', names: { en: 'Israel', zh: '以色列', fr: 'Israël' } },
  { code: 'it', flag: '🇮🇹', names: { en: 'Italy', zh: '意大利', fr: 'Italie' } },
  { code: 'jm', flag: '🇯🇲', names: { en: 'Jamaica', zh: '牙买加', fr: 'Jamaïque' } },
  { code: 'jp', flag: '🇯🇵', names: { en: 'Japan', zh: '日本', fr: 'Japon' } },
  { code: 'ke', flag: '🇰🇪', names: { en: 'Kenya', zh: '肯尼亚', fr: 'Kenya' } },
  { code: 'lb', flag: '🇱🇧', names: { en: 'Lebanon', zh: '黎巴嫩', fr: 'Liban' } },
  { code: 'my', flag: '🇲🇾', names: { en: 'Malaysia', zh: '马来西亚', fr: 'Malaisie' } },
  { code: 'mx', flag: '🇲🇽', names: { en: 'Mexico', zh: '墨西哥', fr: 'Mexique' } },
  { code: 'ma', flag: '🇲🇦', names: { en: 'Morocco', zh: '摩洛哥', fr: 'Maroc' } },
  { code: 'nl', flag: '🇳🇱', names: { en: 'Netherlands', zh: '荷兰', fr: 'Pays-Bas' } },
  { code: 'nz', flag: '🇳🇿', names: { en: 'New Zealand', zh: '新西兰', fr: 'Nouvelle-Zélande' } },
  { code: 'ng', flag: '🇳🇬', names: { en: 'Nigeria', zh: '尼日利亚', fr: 'Nigéria' } },
  { code: 'no', flag: '🇳🇴', names: { en: 'Norway', zh: '挪威', fr: 'Norvège' } },
  { code: 'pk', flag: '🇵🇰', names: { en: 'Pakistan', zh: '巴基斯坦', fr: 'Pakistan' } },
  { code: 'pe', flag: '🇵🇪', names: { en: 'Peru', zh: '秘鲁', fr: 'Pérou' } },
  { code: 'ph', flag: '🇵🇭', names: { en: 'Philippines', zh: '菲律宾', fr: 'Philippines' } },
  { code: 'pl', flag: '🇵🇱', names: { en: 'Poland', zh: '波兰', fr: 'Pologne' } },
  { code: 'pt', flag: '🇵🇹', names: { en: 'Portugal', zh: '葡萄牙', fr: 'Portugal' } },
  { code: 'ru', flag: '🇷🇺', names: { en: 'Russia', zh: '俄罗斯', fr: 'Russie' } },
  { code: 'sg', flag: '🇸🇬', names: { en: 'Singapore', zh: '新加坡', fr: 'Singapour' } },
  { code: 'za', flag: '🇿🇦', names: { en: 'South Africa', zh: '南非', fr: 'Afrique du Sud' } },
  { code: 'kr', flag: '🇰🇷', names: { en: 'South Korea', zh: '韩国', fr: 'Corée du Sud' } },
  { code: 'es', flag: '🇪🇸', names: { en: 'Spain', zh: '西班牙', fr: 'Espagne' } },
  { code: 'se', flag: '🇸🇪', names: { en: 'Sweden', zh: '瑞典', fr: 'Suède' } },
  { code: 'ch', flag: '🇨🇭', names: { en: 'Switzerland', zh: '瑞士', fr: 'Suisse' } },
  { code: 'th', flag: '🇹🇭', names: { en: 'Thailand', zh: '泰国', fr: 'Thaïlande' } },
  { code: 'tn', flag: '🇹🇳', names: { en: 'Tunisia', zh: '突尼斯', fr: 'Tunisie' } },
  { code: 'tr', flag: '🇹🇷', names: { en: 'Türkiye', zh: '土耳其', fr: 'Turquie' } },
  { code: 'ua', flag: '🇺🇦', names: { en: 'Ukraine', zh: '乌克兰', fr: 'Ukraine' } },
  { code: 'gb', flag: '🇬🇧', names: { en: 'United Kingdom', zh: '英国', fr: 'Royaume-Uni' } },
  { code: 'us', flag: '🇺🇸', names: { en: 'United States', zh: '美国', fr: 'États-Unis' } },
  { code: 'uy', flag: '🇺🇾', names: { en: 'Uruguay', zh: '乌拉圭', fr: 'Uruguay' } },
  { code: 'vn', flag: '🇻🇳', names: { en: 'Vietnam', zh: '越南', fr: 'Viêt Nam' } },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string | null | undefined): Country | undefined {
  return code ? BY_CODE.get(code.toLowerCase()) : undefined;
}

export function isSupportedCountry(code: string | null | undefined): boolean {
  return getCountry(code) !== undefined;
}

export function countryName(code: string | null | undefined, lang: Lang): string {
  return getCountry(code)?.names[lang] ?? '';
}

/** Countries sorted by their name in the current interface language. */
export function sortedCountries(lang: Lang): Country[] {
  const collator = new Intl.Collator(lang === 'zh' ? 'zh-Hans' : lang);
  return [...COUNTRIES].sort((a, b) =>
    collator.compare(a.names[lang], b.names[lang]),
  );
}

/** The symbol used for home cooking, which belongs to no country. */
export const HOME_COOKING_ICON = '🏠';
