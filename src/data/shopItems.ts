import { ShopItem } from '../types/game';

/**
 * Cosmetic-only rewards purchasable with Nile Gems in the Sticker Book Shop.
 * All math lessons, game levels, and practice labs remain 100% free.
 */
export const NILE_GEM_SHOP_ITEMS: ShopItem[] = [
  // Guide Character Outfits (visible on Sobek & Horus)
  {
    id: 'outfit_pharaoh_cape',
    category: 'outfit',
    name: { en: 'Royal Pharaoh Cape', ar: 'عباءة الفرعون الملكية' },
    description: {
      en: 'A regal crimson & gold cape worn by Sobek and Horus as they walk!',
      ar: 'عباءة ملكية حمراء وذهبية يرتديها سوبك وحورس أثناء المشي!',
    },
    price: 45,
    accentColor: '#B91C1C',
    surfaceTint: '#FEF2F2',
  },
  {
    id: 'outfit_explorer_vest',
    category: 'outfit',
    name: { en: 'Nile Explorer Vest', ar: 'سترة مستكشف النيل' },
    description: {
      en: 'Adventure-ready desert vest with golden pocket trim.',
      ar: 'سترة مغامرات صحراوية بحواف ذهبية أنيقة.',
    },
    price: 35,
    accentColor: '#B45309',
    surfaceTint: '#FFFBEB',
  },
  {
    id: 'outfit_starlight_robe',
    category: 'outfit',
    name: { en: 'Oasis Starlight Robe', ar: 'رداء نجوم الواحة' },
    description: {
      en: 'Midnight indigo robe dotted with glowing desert stars.',
      ar: 'رداء أزرق ليلي مرصّع بنجوم الصحراء المضيئة.',
    },
    price: 60,
    accentColor: '#1D4ED8',
    surfaceTint: '#EFF6FF',
  },

  // Guide Character Accessories (visible on Sobek & Horus)
  {
    id: 'acc_explorer_goggles',
    category: 'accessory',
    name: { en: 'Desert Explorer Goggles', ar: 'نظارة مستكشف الصحراء' },
    description: {
      en: 'Brass adventure goggles perched on your guide.',
      ar: 'نظارة مغامرات نحاسية رائعة للمرشد الصغير.',
    },
    price: 30,
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
  },
  {
    id: 'acc_golden_crown',
    category: 'accessory',
    name: { en: 'Golden Sun Crown', ar: 'تاج الشمس الذهبي' },
    description: {
      en: 'A shimmering solar diadem celebrating Nile math champions.',
      ar: 'تاج شمسي متلألئ لأبطال رياضيات النيل.',
    },
    price: 55,
    accentColor: '#D97706',
    surfaceTint: '#FEFCE8',
  },
  {
    id: 'acc_turquoise_ankh',
    category: 'accessory',
    name: { en: 'Turquoise Ankh Charm', ar: 'تميمة مفتاح الحياة' },
    description: {
      en: 'A gleaming Egyptian turquoise charm carried beside your guide.',
      ar: 'تميمة مصرية فيروزية متألقة ترافق مرشدك.',
    },
    price: 40,
    accentColor: '#0284C7',
    surfaceTint: '#F0F9FF',
  },

  // Walking Sparkle Trails (emitted behind Sobek & Horus while walking)
  {
    id: 'trail_golden_sand',
    category: 'trail',
    name: { en: 'Golden Nile Sparkles', ar: 'بريق رمال النيل الذهبية' },
    description: {
      en: 'Warm golden sparkles shimmer behind your walking guide.',
      ar: 'شرارات ذهبية دافئة تتلألأ خلف مرشدك أثناء المشي.',
    },
    price: 30,
    accentColor: '#D97706',
    surfaceTint: '#FFFBEB',
  },
  {
    id: 'trail_lotus_petals',
    category: 'trail',
    name: { en: 'Turquoise Lotus Petals', ar: 'بتلات اللوتس الفيروزية' },
    description: {
      en: 'Floating Nile lotus petals drift gracefully as your guide walks.',
      ar: 'بتلات لوتس فيروزية تطفو برقة خلف مرشدك.',
    },
    price: 45,
    accentColor: '#0D9488',
    surfaceTint: '#F0FDFA',
  },
  {
    id: 'trail_starlight_comets',
    category: 'trail',
    name: { en: 'Starlight Comet Trail', ar: 'مسار نجوم الليل' },
    description: {
      en: 'Dazzling indigo & gold shooting stars trail behind your character!',
      ar: 'نجوم ذهبية وزرقاء متلألئة تنير طريق مرشدك!',
    },
    price: 65,
    accentColor: '#4338CA',
    surfaceTint: '#EEF2FF',
  },

  // Extra Collectible Stickers (displayed in Sticker Book collection)
  {
    id: 'sticker_golden_cat',
    category: 'sticker',
    name: { en: 'Bastet Golden Cat', ar: 'قطة باستت الذهبية' },
    description: {
      en: 'Bonus Egyptian sticker for your Sticker Book album!',
      ar: 'ملصق مصري إضافي مميز لألبوم الملصقات!',
    },
    price: 35,
    accentColor: '#D97706',
    surfaceTint: '#FEFCE8',
  },
  {
    id: 'sticker_nile_hippo',
    category: 'sticker',
    name: { en: 'Turquoise Nile Hippo', ar: 'فرس النهر الفيروزي' },
    description: {
      en: 'Inspired by the famous blue faience hippo of ancient Egypt!',
      ar: 'مستوحى من فرس النهر الفيروزي الشهير في مصر القديمة!',
    },
    price: 40,
    accentColor: '#0284C7',
    surfaceTint: '#F0F9FF',
  },
  {
    id: 'sticker_lotus_blossom',
    category: 'sticker',
    name: { en: 'Royal Blue Lotus', ar: 'زهرة اللوتس الملكية' },
    description: {
      en: 'A radiant Nile lotus blossom sticker for your album.',
      ar: 'ملصق زهرة اللوتس المضيئة لألبومك الخاص.',
    },
    price: 35,
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
  },
  {
    id: 'sticker_ankh_medallion',
    category: 'sticker',
    name: { en: 'Golden Ankh Medallion', ar: 'ميدالية مفتاح الحياة' },
    description: {
      en: 'A collector medallion of ancient Egyptian wisdom.',
      ar: 'ميدالية ذهبية ترمز للحكمة والمعرفة المصرية.',
    },
    price: 50,
    accentColor: '#B45309',
    surfaceTint: '#FFF7ED',
  },
];

export function getShopItemById(id: string | null | undefined): ShopItem | undefined {
  if (!id) return undefined;
  return NILE_GEM_SHOP_ITEMS.find((item) => item.id === id);
}
