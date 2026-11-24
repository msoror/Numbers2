import React, { useRef, useState } from 'react';
import { Award, Check, Gem, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { EGYPT_LEVELS, EGYPT_STICKERS } from '../data/egyptLevels';
import { NILE_GEM_SHOP_ITEMS } from '../data/shopItems';
import { t, UI_TEXT } from '../data/i18n';
import { CosmeticCategory, PlayerProgress, ShopItem, StickerId } from '../types/game';
import { soundEngine } from '../utils/sound';
import { EgyptStickerSvg } from './EgyptSvgs';
import { useModalFocusTrap } from './GameModals';
import { SectionNavHeader } from './SectionNavHeader';

interface StickerBookScreenProps {
  progress: PlayerProgress;
  onPurchaseCosmetic: (item: ShopItem) => void;
  onToggleEquipCosmetic: (item: ShopItem) => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigatePractice: () => void;
  onNavigateExam: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

const ShopItemArtSvg: React.FC<{ itemId: string; size?: number }> = ({ itemId, size = 76 }) => {
  switch (itemId) {
    case 'outfit_pharaoh_cape':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#FEF2F2" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M26 24 L54 24 L62 60 C48 64 32 64 18 60 Z" fill="#B91C1C" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M22 54 C34 58 46 58 58 54" stroke="#FCD34D" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="40" cy="26" r="5" fill="#F59E0B" stroke="#133C3B" strokeWidth="2" />
        </svg>
      );
    case 'outfit_explorer_vest':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#FFFBEB" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M24 22 L34 22 L40 31 L46 22 L56 22 L58 60 L22 60 Z" fill="#D97706" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="40" y1="31" x2="40" y2="60" stroke="#133C3B" strokeWidth="2.2" />
          <rect x="26" y="42" width="10" height="9" rx="2" fill="#FEF3C7" stroke="#133C3B" strokeWidth="1.8" />
          <rect x="44" y="42" width="10" height="9" rx="2" fill="#FEF3C7" stroke="#133C3B" strokeWidth="1.8" />
        </svg>
      );
    case 'outfit_starlight_robe':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#EFF6FF" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M28 20 L52 20 L60 62 L20 62 Z" fill="#1E3A8A" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M40 30 L42 36 L48 38 L42 40 L40 46 L38 40 L32 38 L38 36 Z" fill="#FDE047" />
          <circle cx="31" cy="52" r="2.6" fill="#38BDF8" />
          <circle cx="50" cy="50" r="2.6" fill="#FDE047" />
        </svg>
      );
    case 'acc_explorer_goggles':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#F0FDFA" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M12 40 H68" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <circle cx="29" cy="40" r="11" fill="#38BDF8" stroke="#B45309" strokeWidth="3.5" />
          <circle cx="51" cy="40" r="11" fill="#38BDF8" stroke="#B45309" strokeWidth="3.5" />
          <path d="M24 36 L29 34 M46 36 L51 34" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'acc_golden_crown':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#FEFCE8" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M18 54 L22 26 L33 38 L40 20 L47 38 L58 26 L62 54 Z" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="40" cy="44" r="5" fill="#0EA5E9" stroke="#133C3B" strokeWidth="2" />
        </svg>
      );
    case 'acc_turquoise_ankh':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#F0F9FF" stroke="#133C3B" strokeWidth="2.5" />
          <ellipse cx="40" cy="28" rx="9" ry="11" fill="none" stroke="#0D9488" strokeWidth="5.5" />
          <path d="M40 39 V62 M26 45 H54" stroke="#0D9488" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="40" cy="28" r="3.5" fill="#FDE047" />
        </svg>
      );
    case 'trail_golden_sand':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#FFFBEB" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M46 18 L49 28 L59 31 L49 34 L46 44 L43 34 L33 31 L43 28 Z" fill="#F59E0B" stroke="#133C3B" strokeWidth="1.6" />
          <path d="M27 38 L29 45 L36 47 L29 49 L27 56 L25 49 L18 47 L25 45 Z" fill="#FCD34D" stroke="#133C3B" strokeWidth="1.5" />
          <circle cx="52" cy="54" r="4" fill="#D97706" />
        </svg>
      );
    case 'trail_lotus_petals':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#F0FDFA" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M40 16 C49 25 50 38 40 48 C30 38 31 25 40 16 Z" fill="#14B8A6" stroke="#133C3B" strokeWidth="2.2" />
          <path d="M22 36 C32 38 38 46 36 58 C25 54 19 46 22 36 Z" fill="#38BDF8" stroke="#133C3B" strokeWidth="2" />
          <path d="M58 36 C48 38 42 46 44 58 C55 54 61 46 58 36 Z" fill="#0D9488" stroke="#133C3B" strokeWidth="2" />
        </svg>
      );
    case 'trail_starlight_comets':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#EEF2FF" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M18 55 Q34 45 50 28" stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M50 16 L53 24 L62 25 L55 31 L57 39 L50 34 L43 39 L45 31 L38 25 L47 24 Z" fill="#FDE047" stroke="#133C3B" strokeWidth="1.8" />
          <circle cx="28" cy="34" r="3" fill="#4338CA" />
        </svg>
      );
    case 'sticker_golden_cat':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#FEFCE8" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M28 58 L32 34 L27 20 L37 26 L43 26 L53 20 L48 34 L52 58 Z" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="36" cy="34" r="2.3" fill="#133C3B" />
          <circle cx="44" cy="34" r="2.3" fill="#133C3B" />
          <path d="M33 44 C37 48 43 48 47 44" stroke="#0D9488" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'sticker_nile_hippo':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#F0F9FF" stroke="#133C3B" strokeWidth="2.5" />
          <ellipse cx="40" cy="45" rx="21" ry="14" fill="#38BDF8" stroke="#133C3B" strokeWidth="2.5" />
          <circle cx="53" cy="38" r="10" fill="#0EA5E9" stroke="#133C3B" strokeWidth="2.5" />
          <circle cx="50" cy="35" r="2.2" fill="#133C3B" />
          <circle cx="57" cy="40" r="1.6" fill="#133C3B" />
          <path d="M32 45 Q36 39 40 45 Q44 39 48 45" stroke="#0369A1" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'sticker_lotus_blossom':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#F0FDFA" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M40 16 C48 28 48 44 40 54 C32 44 32 28 40 16 Z" fill="#0EA5E9" stroke="#133C3B" strokeWidth="2.4" />
          <path d="M22 30 C32 32 38 42 38 54 C28 50 21 41 22 30 Z" fill="#14B8A6" stroke="#133C3B" strokeWidth="2.2" />
          <path d="M58 30 C48 32 42 42 42 54 C52 50 59 41 58 30 Z" fill="#14B8A6" stroke="#133C3B" strokeWidth="2.2" />
          <path d="M26 56 H54" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#FFF7ED" stroke="#133C3B" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="24" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.4" />
          <ellipse cx="40" cy="31" rx="6" ry="8" fill="none" stroke="#FFFDF7" strokeWidth="3.6" />
          <path d="M40 39 V55 M31 44 H49" stroke="#FFFDF7" strokeWidth="3.6" strokeLinecap="round" />
        </svg>
      );
  }
};

export const StickerBookScreen: React.FC<StickerBookScreenProps> = ({
  progress,
  onPurchaseCosmetic,
  onToggleEquipCosmetic,
  onNavigateHome,
  onNavigateGame,
  onNavigatePractice,
  onNavigateExam,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'shop'>('stickers');
  const [shopFilter, setShopFilter] = useState<CosmeticCategory | 'all'>('all');
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);

  const confirmDialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(confirmDialogRef, confirmItem !== null, () => setConfirmItem(null));

  const lang = progress.language;
  const stickerList = Object.values(EGYPT_STICKERS);
  const bonusStickers = NILE_GEM_SHOP_ITEMS.filter((item) => item.category === 'sticker');
  const ownedBonusStickers = bonusStickers.filter((item) =>
    progress.purchasedCosmetics.includes(item.id)
  );

  const filteredShopItems =
    shopFilter === 'all'
      ? NILE_GEM_SHOP_ITEMS
      : NILE_GEM_SHOP_ITEMS.filter((item) => item.category === shopFilter);

  const handleStickerClick = (id: StickerId | string, unlocked: boolean) => {
    if (!unlocked) {
      soundEngine.playGentleMiss();
      return;
    }
    soundEngine.playStickerUnlock();
    setPoppedId(id);
    setTimeout(() => setPoppedId(null), 450);
  };

  const isEquipped = (item: ShopItem): boolean => {
    if (item.category === 'outfit') return progress.equippedCosmetics.outfitId === item.id;
    if (item.category === 'accessory') return progress.equippedCosmetics.accessoryId === item.id;
    if (item.category === 'trail') return progress.equippedCosmetics.trailId === item.id;
    return false;
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="w-full h-full bg-[#FCF9F0] flex flex-col overflow-y-auto select-none"
    >
      <SectionNavHeader
        activeSection="stickers"
        lang={lang}
        muted={progress.muted}
        musicEnabled={progress.musicEnabled}
        onNavigateHome={onNavigateHome}
        onNavigateGame={onNavigateGame}
        onNavigatePractice={onNavigatePractice}
        onNavigateExam={onNavigateExam}
        onNavigateStickers={() => {}}
        onToggleLang={onToggleLang}
        onToggleMute={onToggleMute}
        onToggleMusic={onToggleMusic}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-7 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#133C3B]/12">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#133C3B]">
              {activeTab === 'stickers' ? t(UI_TEXT.stickerBook, lang) : t(UI_TEXT.gemShopTab, lang)}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#475569]">
              {t(UI_TEXT.shopSubtitle, lang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm font-bold text-[#133C3B] tabular-nums shrink-0">
            <span className="inline-flex items-center gap-1.5 text-[#0F766E]">
              <Gem className="w-4 h-4 text-[#0D9488]" />
              <span>
                {progress.totalGems} {t(UI_TEXT.nileGems, lang)}
              </span>
            </span>
            <span className="text-[#94A3B8]" aria-hidden="true">
              ·
            </span>
            <span>
              {t(UI_TEXT.stickers, lang)} {progress.unlockedStickers.length}/12
            </span>
            <span className="text-[#94A3B8]" aria-hidden="true">
              ·
            </span>
            <span>
              {t(UI_TEXT.stars, lang)} {progress.totalStars}/{EGYPT_LEVELS.length * 3}
            </span>
          </div>
        </div>

        {/* Primary Tab Switcher: My Stickers vs Gem Shop */}
        <div
          role="tablist"
          aria-label={lang === 'ar' ? 'أقسام ألبوم الملصقات' : 'Sticker Book sections'}
          className="flex items-center gap-1.5 p-1.5 bg-[#F1EDE1] rounded-2xl w-fit"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stickers'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('stickers');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'stickers'
                ? 'bg-white text-[#133C3B] shadow-xs'
                : 'text-[#475569] hover:text-[#133C3B]'
            }`}
          >
            <Award className="w-4 h-4 text-[#D97706]" />
            <span>{t(UI_TEXT.myStickersTab, lang)}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'shop'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('shop');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'shop'
                ? 'bg-white text-[#133C3B] shadow-xs'
                : 'text-[#475569] hover:text-[#133C3B]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#0D9488]" />
            <span>{t(UI_TEXT.gemShopTab, lang)}</span>
          </button>
        </div>

        {activeTab === 'stickers' ? (
          <div className="flex flex-col gap-6 pb-36">
            {/* 12 Curriculum Egyptian Stickers */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stickerList.map((sticker) => {
                const unlocked = progress.unlockedStickers.includes(sticker.id);
                const isPopped = poppedId === sticker.id;

                return (
                  <button
                    key={sticker.id}
                    type="button"
                    onClick={() => handleStickerClick(sticker.id, unlocked)}
                    className={`rounded-3xl p-4 border-2 flex flex-col items-center text-center gap-2.5 transition-transform duration-150 cursor-pointer ${
                      unlocked
                        ? 'bg-[#FEFCE8] border-[#133C3B] border-b-4 hover:-translate-y-0.5'
                        : 'bg-[#F8FAFC] border-[#CBD5E1]'
                    } ${isPopped ? 'scale-105' : ''}`}
                  >
                    <div className="relative">
                      <EgyptStickerSvg stickerId={sticker.id} unlocked={unlocked} size={84} />
                      {!unlocked && (
                        <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-[#94A3B8] flex items-center justify-center text-[#64748B]">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-display text-base font-bold text-[#133C3B]">
                        {unlocked ? t(sticker.name, lang) : t(UI_TEXT.mysterySticker, lang)}
                      </div>
                      <div className="text-xs font-semibold text-[#64748B] mt-0.5">
                        {unlocked ? t(UI_TEXT.tapCelebrate, lang) : t(sticker.unlockHint, lang)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Extra Shop Stickers Shelf */}
            <section className="flex flex-col gap-3 pt-4 border-t border-[#133C3B]/12">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-[#133C3B] tabular-nums">
                  {t(UI_TEXT.catExtraStickers, lang)} ({ownedBonusStickers.length}/
                  {bonusStickers.length})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setShopFilter('sticker');
                    setActiveTab('shop');
                  }}
                  className="text-xs sm:text-sm font-bold text-[#0F766E] hover:underline cursor-pointer whitespace-nowrap"
                >
                  {t(UI_TEXT.gemShopTab, lang)} →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {bonusStickers.map((item) => {
                  const owned = progress.purchasedCosmetics.includes(item.id);
                  const isPopped = poppedId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (owned) {
                          handleStickerClick(item.id, true);
                        } else {
                          soundEngine.playClick();
                          setShopFilter('sticker');
                          setActiveTab('shop');
                        }
                      }}
                      className={`rounded-3xl p-4 border-2 flex flex-col items-center text-center gap-2.5 transition-transform duration-150 cursor-pointer ${
                        owned
                          ? 'bg-[#FFFDF7] border-[#133C3B] border-b-4 hover:-translate-y-0.5'
                          : 'bg-[#F8FAFC] border-dashed border-[#CBD5E1] opacity-85'
                      } ${isPopped ? 'scale-105' : ''}`}
                    >
                      <div className={owned ? '' : 'grayscale opacity-55'}>
                        <ShopItemArtSvg itemId={item.id} size={76} />
                      </div>
                      <div className="font-display text-base font-bold text-[#133C3B]">
                        {t(item.name, lang)}
                      </div>
                      <div className="text-xs font-semibold text-[#64748B] tabular-nums">
                        {owned
                          ? t(UI_TEXT.tapCelebrate, lang)
                          : `${item.price} ${t(UI_TEXT.gems, lang)}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-36">
            {/* Cosmetic Category Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: { en: 'All Cosmetics', ar: 'كل المقتنيات' } },
                  { id: 'outfit', label: UI_TEXT.catOutfits },
                  { id: 'accessory', label: UI_TEXT.catAccessories },
                  { id: 'trail', label: UI_TEXT.catTrails },
                  { id: 'sticker', label: UI_TEXT.catExtraStickers },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setShopFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-colors cursor-pointer whitespace-nowrap ${
                    shopFilter === cat.id
                      ? 'bg-[#133C3B] border-[#133C3B] text-white'
                      : 'bg-white border-[#CBD5E1] text-[#133C3B] hover:border-[#133C3B]'
                  }`}
                >
                  {t(cat.label, lang)}
                </button>
              ))}
            </div>

            {/* Cosmetic Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShopItems.map((item) => {
                const owned = progress.purchasedCosmetics.includes(item.id);
                const equipped = isEquipped(item);
                const canAfford = progress.totalGems >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl p-4 sm:p-5 border-2 flex flex-col justify-between gap-4 bg-white ${
                      equipped
                        ? 'border-[#D97706] shadow-sm'
                        : owned
                        ? 'border-[#0D9488]'
                        : 'border-[#133C3B]/25'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="rounded-2xl p-1.5 border border-[#133C3B]/10 shrink-0"
                        style={{ backgroundColor: item.surfaceTint }}
                      >
                        <ShopItemArtSvg itemId={item.id} size={72} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-[11px] font-bold"
                          style={{ color: item.accentColor }}
                        >
                          {item.category === 'outfit'
                            ? t(UI_TEXT.catOutfits, lang)
                            : item.category === 'accessory'
                            ? t(UI_TEXT.catAccessories, lang)
                            : item.category === 'trail'
                            ? t(UI_TEXT.catTrails, lang)
                            : t(UI_TEXT.catExtraStickers, lang)}
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#133C3B] leading-snug mt-0.5">
                          {t(item.name, lang)}
                        </h3>
                        <p className="text-xs font-medium text-[#475569] mt-1 leading-relaxed">
                          {t(item.description, lang)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#133C3B]/10">
                      <div className="text-sm font-bold text-[#133C3B] tabular-nums flex items-center gap-1.5">
                        {owned ? (
                          <span className="inline-flex items-center gap-1 text-[#0F766E]">
                            <Check className="w-4 h-4" />
                            {equipped ? t(UI_TEXT.equippedLabel, lang) : t(UI_TEXT.ownedLabel, lang)}
                          </span>
                        ) : (
                          <>
                            <Gem className="w-4 h-4 text-[#0D9488]" />
                            <span>
                              {item.price} {t(UI_TEXT.gems, lang)}
                            </span>
                          </>
                        )}
                      </div>

                      {!owned ? (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => {
                            soundEngine.playClick();
                            setConfirmItem(item);
                          }}
                          className={`h-10 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap transition-transform ${
                            canAfford
                              ? 'bg-[#D97706] hover:bg-[#B45309] border-[#133C3B] border-b-[3px] text-white cursor-pointer active:translate-y-0.5'
                              : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#94A3B8] cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {canAfford ? t(UI_TEXT.buyAction, lang) : t(UI_TEXT.notEnoughGems, lang)}
                          </span>
                        </button>
                      ) : item.category !== 'sticker' ? (
                        <button
                          type="button"
                          onClick={() => onToggleEquipCosmetic(item)}
                          className={`h-10 px-4 rounded-xl border-2 border-b-[3px] font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                            equipped
                              ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] border-[#133C3B] text-[#92400E]'
                              : 'bg-[#0F766E] hover:bg-[#115E59] border-[#133C3B] text-white'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {equipped ? t(UI_TEXT.unequipAction, lang) : t(UI_TEXT.equipAction, lang)}
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#0F766E]">
                          {t(UI_TEXT.myStickersTab, lang)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Accessible Purchase Confirmation Modal */}
      {confirmItem && (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1.5px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-purchase-title"
          onClick={() => setConfirmItem(null)}
        >
          <div
            ref={confirmDialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-6 shadow-2xl animate-pop-in flex flex-col items-center text-center gap-4 outline-none"
          >
            <ShopItemArtSvg itemId={confirmItem.id} size={88} />

            <div>
              <div className="text-xs font-bold text-[#0F766E]">
                {t(UI_TEXT.confirmBuyTitle, lang)}
              </div>
              <h2
                id="confirm-purchase-title"
                className="font-display text-2xl font-bold text-[#133C3B] mt-1"
              >
                {t(confirmItem.name, lang)}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#475569] mt-1">
                {t(confirmItem.description, lang)}
              </p>
            </div>

            <div className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl px-4 py-3 text-sm font-bold text-[#133C3B] tabular-nums flex items-center justify-center gap-2">
              <Gem className="w-4 h-4 text-[#0D9488]" />
              <span>
                {confirmItem.price} {t(UI_TEXT.nileGems, lang)}
              </span>
              <span className="text-[#94A3B8]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#475569]">
                {progress.totalGems} → {Math.max(0, progress.totalGems - confirmItem.price)}
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setConfirmItem(null);
                }}
                className="h-11 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-[#133C3B] text-[#133C3B] font-bold text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133C3B]"
              >
                {t(UI_TEXT.cancelAction, lang)}
              </button>

              <button
                type="button"
                onClick={() => {
                  onPurchaseCosmetic(confirmItem);
                  setConfirmItem(null);
                }}
                className="h-11 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] border-2 border-b-4 border-[#14532D] text-white font-display text-base font-bold cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133C3B]"
              >
                {t(UI_TEXT.confirmBuyAction, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
