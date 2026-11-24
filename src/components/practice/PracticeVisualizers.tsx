import React, { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { t, UI_TEXT } from '../../data/i18n';
import { BilingualText, Language, ShapeKind, SubjectId } from '../../types/game';
import { soundEngine } from '../../utils/sound';
import {
  AnalogClockSvg,
  EgyptShapeSvg,
  EgyptianBanknoteSvg,
  FractionCircleSvg,
} from '../EgyptSvgs';

interface LabProps {
  lang: Language;
}

/* ============================================================================
   01. PLACE VALUE & COMPARING (H-T-O up to 999)
   ============================================================================ */
const PlaceValueLab: React.FC<LabProps> = ({ lang }) => {
  const [mode, setMode] = useState<'build' | 'compare'>('build');
  const [hundreds, setHundreds] = useState(3);
  const [tens, setTens] = useState(4);
  const [ones, setOnes] = useState(6);

  const [leftNum, setLeftNum] = useState(438);
  const [rightNum, setRightNum] = useState(483);

  const total = hundreds * 100 + tens * 10 + ones;

  const lh = Math.floor(leftNum / 100);
  const lt = Math.floor((leftNum % 100) / 10);
  const lo = leftNum % 10;
  const rh = Math.floor(rightNum / 100);
  const rt = Math.floor((rightNum % 100) / 10);
  const ro = rightNum % 10;

  const diffPlace: 'h' | 't' | 'o' | 'eq' =
    lh !== rh ? 'h' : lt !== rt ? 't' : lo !== ro ? 'o' : 'eq';
  const compareSymbol = leftNum < rightNum ? '<' : leftNum > rightNum ? '>' : '=';

  const adjust = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    min = 0,
    max = 9
  ) => {
    soundEngine.playClick();
    setter((prev) => Math.max(min, Math.min(max, prev + delta)));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 p-1 bg-[#F1EDE1] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setMode('build');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            mode === 'build' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569] hover:text-[#133C3B]'
          }`}
        >
          {lang === 'ar' ? 'بناء العدد (م-ع-آ)' : 'Build a Number (H-T-O)'}
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setMode('compare');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            mode === 'compare' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569] hover:text-[#133C3B]'
          }`}
        >
          {lang === 'ar' ? 'مقارنة عددين (< = >)' : 'Compare Two Numbers (< = >)'}
        </button>
      </div>

      {mode === 'build' ? (
        <>
          <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2 text-lg sm:text-xl font-display font-bold tabular-nums" dir="ltr">
              <span className="text-[#C2410C]">{hundreds * 100}</span>
              <span className="text-[#94A3B8]">+</span>
              <span className="text-[#0F766E]">{tens * 10}</span>
              <span className="text-[#94A3B8]">+</span>
              <span className="text-[#1D4ED8]">{ones}</span>
              <span className="text-[#94A3B8]">=</span>
              <span className="text-3xl text-[#133C3B]">{total}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setHundreds(3);
                setTens(4);
                setOnes(6);
              }}
              className="h-9 px-3 rounded-lg bg-white border border-[#133C3B]/20 text-xs font-bold text-[#133C3B] flex items-center gap-1.5 hover:bg-[#FEF3C7] cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t(UI_TEXT.resetLab, lang)}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" dir="ltr">
            <div className="bg-[#FFF7ED] border border-[#C2410C]/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#C2410C]">{t(UI_TEXT.hundreds, lang)}</span>
                <span className="font-display text-2xl font-bold text-[#C2410C] tabular-nums">{hundreds}</span>
              </div>
              <div className="min-h-[112px] flex flex-wrap content-start gap-2 py-1">
                {Array.from({ length: hundreds }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-11 h-11 rounded-md bg-[#FB923C] border-2 border-[#7C2D12] grid grid-cols-3 grid-rows-3 p-0.5 gap-0.5"
                    title="100"
                  >
                    {Array.from({ length: 9 }, (_, c) => (
                      <div key={c} className="bg-[#FFEDD5]/60 rounded-[1px]" />
                    ))}
                  </div>
                ))}
                {hundreds === 0 && (
                  <span className="text-xs font-semibold text-[#9A3412]/70 self-center">
                    {lang === 'ar' ? '٠ مئات' : '0 hundreds'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C2410C]/15">
                <button
                  type="button"
                  onClick={() => adjust(setHundreds, -1, 0, 9)}
                  aria-label={lang === 'ar' ? 'إنقاص المئات' : 'Decrease hundreds'}
                  className="flex-1 h-10 rounded-xl bg-white border border-[#C2410C]/40 text-[#C2410C] flex items-center justify-center hover:bg-[#FFEDD5] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#7C2D12] tabular-nums w-12 text-center">
                  {hundreds * 100}
                </span>
                <button
                  type="button"
                  onClick={() => adjust(setHundreds, 1, 0, 9)}
                  aria-label={lang === 'ar' ? 'زيادة المئات' : 'Increase hundreds'}
                  className="flex-1 h-10 rounded-xl bg-[#C2410C] text-white flex items-center justify-center hover:bg-[#9A3412] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#F0FDFA] border border-[#0F766E]/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0F766E]">{t(UI_TEXT.tens, lang)}</span>
                <span className="font-display text-2xl font-bold text-[#0F766E] tabular-nums">{tens}</span>
              </div>
              <div className="min-h-[112px] flex flex-wrap content-start items-end gap-1.5 py-1">
                {Array.from({ length: tens }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-3.5 h-20 rounded-sm bg-[#14B8A6] border-2 border-[#115E59] flex flex-col justify-between p-[1px]"
                    title="10"
                  >
                    {Array.from({ length: 5 }, (_, c) => (
                      <div key={c} className="w-full h-[1px] bg-[#CCFBF1]/70" />
                    ))}
                  </div>
                ))}
                {tens === 0 && (
                  <span className="text-xs font-semibold text-[#115E59]/70 self-center">
                    {lang === 'ar' ? '٠ عشرات' : '0 tens'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#0F766E]/15">
                <button
                  type="button"
                  onClick={() => adjust(setTens, -1, 0, 9)}
                  aria-label={lang === 'ar' ? 'إنقاص العشرات' : 'Decrease tens'}
                  className="flex-1 h-10 rounded-xl bg-white border border-[#0F766E]/40 text-[#0F766E] flex items-center justify-center hover:bg-[#CCFBF1] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#115E59] tabular-nums w-12 text-center">
                  {tens * 10}
                </span>
                <button
                  type="button"
                  onClick={() => adjust(setTens, 1, 0, 9)}
                  aria-label={lang === 'ar' ? 'زيادة العشرات' : 'Increase tens'}
                  className="flex-1 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center hover:bg-[#115E59] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#EFF6FF] border border-[#1D4ED8]/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1D4ED8]">{t(UI_TEXT.ones, lang)}</span>
                <span className="font-display text-2xl font-bold text-[#1D4ED8] tabular-nums">{ones}</span>
              </div>
              <div className="min-h-[112px] flex flex-wrap content-start gap-2 py-1">
                {Array.from({ length: ones }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-md bg-[#3B82F6] border-2 border-[#1E3A8A]"
                    title="1"
                  />
                ))}
                {ones === 0 && (
                  <span className="text-xs font-semibold text-[#1E3A8A]/70 self-center">
                    {lang === 'ar' ? '٠ آحاد' : '0 ones'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1D4ED8]/15">
                <button
                  type="button"
                  onClick={() => adjust(setOnes, -1, 0, 9)}
                  aria-label={lang === 'ar' ? 'إنقاص الآحاد' : 'Decrease ones'}
                  className="flex-1 h-10 rounded-xl bg-white border border-[#1D4ED8]/40 text-[#1D4ED8] flex items-center justify-center hover:bg-[#DBEAFE] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#1E3A8A] tabular-nums w-12 text-center">
                  {ones}
                </span>
                <button
                  type="button"
                  onClick={() => adjust(setOnes, 1, 0, 9)}
                  aria-label={lang === 'ar' ? 'زيادة الآحاد' : 'Increase ones'}
                  className="flex-1 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center hover:bg-[#1E40AF] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4" dir="ltr">
            <div className="bg-[#FCF9F0] border border-[#133C3B]/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-[#64748B]">
                <span>{lang === 'ar' ? 'العدد الأول' : 'First Number'}</span>
                <span className="font-display text-2xl text-[#133C3B] tabular-nums">{leftNum}</span>
              </div>
              <input
                type="range"
                min={100}
                max={999}
                value={leftNum}
                onChange={(e) => setLeftNum(Number(e.target.value))}
                aria-label={lang === 'ar' ? 'العدد الأول المكوّن من ٣ أرقام' : 'First 3-digit number'}
                className="w-full accent-[#C2410C]"
              />
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold tabular-nums">
                <div className={`p-2 rounded-lg ${diffPlace === 'h' ? 'bg-[#FFEDD5] text-[#9A3412] ring-2 ring-[#C2410C]' : 'bg-white text-[#475569]'}`}>
                  H: {lh}
                </div>
                <div className={`p-2 rounded-lg ${diffPlace === 't' ? 'bg-[#CCFBF1] text-[#115E59] ring-2 ring-[#0F766E]' : 'bg-white text-[#475569]'}`}>
                  T: {lt}
                </div>
                <div className={`p-2 rounded-lg ${diffPlace === 'o' ? 'bg-[#DBEAFE] text-[#1E3A8A] ring-2 ring-[#1D4ED8]' : 'bg-white text-[#475569]'}`}>
                  O: {lo}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#133C3B] text-[#FEF3C7] font-display text-4xl font-bold flex items-center justify-center">
                {compareSymbol}
              </div>
            </div>

            <div className="bg-[#FCF9F0] border border-[#133C3B]/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-[#64748B]">
                <span>{lang === 'ar' ? 'العدد الثاني' : 'Second Number'}</span>
                <span className="font-display text-2xl text-[#133C3B] tabular-nums">{rightNum}</span>
              </div>
              <input
                type="range"
                min={100}
                max={999}
                value={rightNum}
                onChange={(e) => setRightNum(Number(e.target.value))}
                aria-label={lang === 'ar' ? 'العدد الثاني المكوّن من ٣ أرقام' : 'Second 3-digit number'}
                className="w-full accent-[#0F766E]"
              />
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold tabular-nums">
                <div className={`p-2 rounded-lg ${diffPlace === 'h' ? 'bg-[#FFEDD5] text-[#9A3412] ring-2 ring-[#C2410C]' : 'bg-white text-[#475569]'}`}>
                  H: {rh}
                </div>
                <div className={`p-2 rounded-lg ${diffPlace === 't' ? 'bg-[#CCFBF1] text-[#115E59] ring-2 ring-[#0F766E]' : 'bg-white text-[#475569]'}`}>
                  T: {rt}
                </div>
                <div className={`p-2 rounded-lg ${diffPlace === 'o' ? 'bg-[#DBEAFE] text-[#1E3A8A] ring-2 ring-[#1D4ED8]' : 'bg-white text-[#475569]'}`}>
                  O: {ro}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F0FDFA] border border-[#0F766E]/25 rounded-2xl p-4 text-sm font-bold text-[#133C3B]">
            {diffPlace === 'h' &&
              (lang === 'ar'
                ? `نبدأ بالمئات: ${lh} ${compareSymbol} ${rh}، إذن ${leftNum} ${compareSymbol} ${rightNum}.`
                : `Check Hundreds first: ${lh} ${compareSymbol} ${rh}, so ${leftNum} ${compareSymbol} ${rightNum}.`)}
            {diffPlace === 't' &&
              (lang === 'ar'
                ? `المئات متساوية (${lh} = ${rh})، فنقارن العشرات: ${lt} ${compareSymbol} ${rt}، إذن ${leftNum} ${compareSymbol} ${rightNum}.`
                : `Hundreds are equal (${lh} = ${rh}), so check Tens: ${lt} ${compareSymbol} ${rt}, meaning ${leftNum} ${compareSymbol} ${rightNum}.`)}
            {diffPlace === 'o' &&
              (lang === 'ar'
                ? `المئات والعشرات متساوية، فنقارن الآحاد: ${lo} ${compareSymbol} ${ro}، إذن ${leftNum} ${compareSymbol} ${rightNum}.`
                : `Hundreds and Tens match, so check Ones: ${lo} ${compareSymbol} ${ro}, meaning ${leftNum} ${compareSymbol} ${rightNum}.`)}
            {diffPlace === 'eq' &&
              (lang === 'ar'
                ? `المئات والعشرات والآحاد متساوية تمامًا: ${leftNum} = ${rightNum}!`
                : `Hundreds, Tens, and Ones are all identical: ${leftNum} = ${rightNum}!`)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   02. EGYPTIAN POUNDS (LE) & MAKING CHANGE
   ============================================================================ */
const MoneyLab: React.FC<LabProps> = ({ lang }) => {
  const [mode, setMode] = useState<'build' | 'change'>('build');
  const [tray, setTray] = useState<number[]>([50, 20, 5]);
  const [paidNote, setPaidNote] = useState<50 | 100 | 200>(100);
  const [itemPrice, setItemPrice] = useState(65);

  const notes = [100, 50, 20, 10, 5, 1];
  const trayTotal = tray.reduce((s, n) => s + n, 0);

  const addNote = (val: number) => {
    if (tray.length >= 12) return;
    soundEngine.playClick();
    setTray((prev) => [...prev, val]);
  };

  const removeNoteAt = (idx: number) => {
    soundEngine.playClick();
    setTray((prev) => prev.filter((_, i) => i !== idx));
  };

  const safePrice = Math.min(itemPrice, paidNote - 1);
  const changeAmount = paidNote - safePrice;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 p-1 bg-[#F1EDE1] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setMode('build');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            mode === 'build' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569] hover:text-[#133C3B]'
          }`}
        >
          {lang === 'ar' ? 'تكوين المبالغ بالجنيهات' : 'Build Amounts (LE)'}
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setMode('change');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            mode === 'change' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569] hover:text-[#133C3B]'
          }`}
        >
          {lang === 'ar' ? 'حساب الباقي في السوق' : 'Making Change Lab'}
        </button>
      </div>

      {mode === 'build' ? (
        <>
          <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-[#64748B]">{t(UI_TEXT.collected, lang)}:</span>
              <span className="font-display text-3xl font-bold text-[#133C3B] tabular-nums">
                {trayTotal} {t(UI_TEXT.leUnit, lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setTray([]);
              }}
              className="h-9 px-3.5 rounded-lg bg-white border border-[#133C3B]/20 text-xs font-bold text-[#133C3B] hover:bg-[#FEF3C7] cursor-pointer whitespace-nowrap shrink-0"
            >
              {t(UI_TEXT.clearTray, lang)}
            </button>
          </div>

          <div>
            <div className="text-xs font-bold text-[#64748B] mb-2.5">
              {lang === 'ar' ? 'اضغط على أي ورقة نقدية لإضافتها:' : 'Click any banknote to add it to your tray:'}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {notes.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addNote(val)}
                  className="p-1.5 rounded-xl bg-white border border-[#133C3B]/20 hover:border-[#D97706] hover:-translate-y-0.5 active:translate-y-0 transition-transform cursor-pointer"
                >
                  <EgyptianBanknoteSvg denomination={val} lang={lang} compact />
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[116px] bg-[#FEFCE8] border border-dashed border-[#D97706]/50 rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-[#92400E]">
              {lang === 'ar'
                ? 'صندوقك (اضغط على الورقة لإزالتها):'
                : 'Your Payment Tray (click a note to remove it):'}
            </div>
            {tray.length === 0 ? (
              <div className="text-sm font-semibold text-[#92400E]/70 py-4 text-center">
                {lang === 'ar' ? 'الصندوق فارغ — أضف أوراقًا نقدية من الأعلى.' : 'Tray is empty — tap banknotes above to count them!'}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {tray.map((val, idx) => (
                    <button
                      key={`${val}-${idx}`}
                      type="button"
                      onClick={() => removeNoteAt(idx)}
                      className="hover:opacity-75 transition-opacity cursor-pointer"
                      title={lang === 'ar' ? 'اضغط للإزالة' : 'Click to remove'}
                    >
                      <EgyptianBanknoteSvg denomination={val} lang={lang} compact />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-[#133C3B] tabular-nums pt-1" dir="ltr">
                  {tray.join(' + ')} = {trayTotal} LE
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-[#133C3B]">
              {lang === 'ar' ? 'الورقة المدفوعة:' : 'You Pay With:'}
            </span>
            {([50, 100, 200] as const).map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPaidNote(note);
                  if (itemPrice >= note) setItemPrice(Math.round(note * 0.6));
                }}
                className={`px-4 py-2 rounded-xl font-bold text-sm border cursor-pointer tabular-nums whitespace-nowrap shrink-0 ${
                  paidNote === note
                    ? 'bg-[#133C3B] text-white border-[#133C3B]'
                    : 'bg-white text-[#133C3B] border-[#133C3B]/20 hover:bg-[#FEF3C7]'
                }`}
              >
                {note} {t(UI_TEXT.leUnit, lang)}
              </button>
            ))}
          </div>

          <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-bold text-[#133C3B]">
              <span>{lang === 'ar' ? 'سعر السلعة:' : 'Item Price:'}</span>
              <span className="font-display text-xl text-[#D97706] tabular-nums">
                {safePrice} {t(UI_TEXT.leUnit, lang)}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={paidNote - 5}
              step={5}
              value={safePrice}
              onChange={(e) => setItemPrice(Number(e.target.value))}
              aria-label={lang === 'ar' ? 'سعر السلعة بالجنيه' : 'Item price in LE'}
              className="w-full accent-[#D97706]"
            />
          </div>

          <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col gap-4">
            <div className="w-full h-11 rounded-xl overflow-hidden flex border border-[#133C3B]/30 font-bold text-xs sm:text-sm tabular-nums">
              <div
                className="bg-[#FDE68A] text-[#78350F] flex items-center justify-center transition-all duration-200 px-2 truncate"
                style={{ width: `${(safePrice / paidNote) * 100}%` }}
              >
                {lang === 'ar' ? `السعر ${safePrice}` : `Price ${safePrice}`}
              </div>
              <div
                className="bg-[#0D9488] text-white flex items-center justify-center transition-all duration-200 px-2 truncate"
                style={{ width: `${(changeAmount / paidNote) * 100}%` }}
              >
                {lang === 'ar' ? `الباقي ${changeAmount}` : `Change ${changeAmount}`}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-lg font-display font-bold text-[#133C3B] tabular-nums" dir="ltr">
              <span>
                {paidNote} LE − {safePrice} LE ={' '}
                <span className="text-[#0F766E] text-2xl">{changeAmount} LE</span>
              </span>
              <span className="text-xs font-sans font-bold text-[#64748B]">
                ({safePrice} + {changeAmount} = {paidNote})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   03. VERTICAL ADDITION & SUBTRACTION WITH REGROUPING STEPPER
   ============================================================================ */
interface RegroupPreset {
  op: '+' | '-';
  top: number;
  bottom: number;
  label: BilingualText;
}

const REGROUP_PRESETS: RegroupPreset[] = [
  { op: '+', top: 48, bottom: 27, label: { en: '2-Digit Carry (48 + 27)', ar: 'جمع بالحمل (٤٨ + ٢٧)' } },
  { op: '-', top: 63, bottom: 28, label: { en: '2-Digit Borrow (63 − 28)', ar: 'طرح بالاستلاف (٦٣ − ٢٨)' } },
  { op: '+', top: 267, bottom: 158, label: { en: '3-Digit Carry (267 + 158)', ar: '٣ أرقام بالحمل (٢٦٧ + ١٥٨)' } },
  { op: '-', top: 432, bottom: 168, label: { en: '3-Digit Borrow (432 − 168)', ar: '٣ أرقام بالاستلاف (٤٣٢ − ١٦٨)' } },
];

const RegroupingLab: React.FC<LabProps> = ({ lang }) => {
  const [presetIdx, setPresetIdx] = useState(0);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const preset = REGROUP_PRESETS[presetIdx];
  const { op, top, bottom } = preset;
  const answer = op === '+' ? top + bottom : top - bottom;
  const isThreeDigit = top >= 100 || bottom >= 100 || answer >= 100;

  const tH = Math.floor(top / 100);
  const tT = Math.floor((top % 100) / 10);
  const tO = top % 10;

  const bH = Math.floor(bottom / 100);
  const bT = Math.floor((bottom % 100) / 10);
  const bO = bottom % 10;

  const aH = Math.floor(answer / 100);
  const aT = Math.floor((answer % 100) / 10);
  const aO = answer % 10;

  const carryToTens = op === '+' && tO + bO >= 10 ? 1 : 0;
  const carryToHundreds = op === '+' && tT + bT + carryToTens >= 10 ? 1 : 0;

  const borrowFromTens = op === '-' && tO < bO;
  const adjustedTopOnes = borrowFromTens ? tO + 10 : tO;
  const tensAfterOnesBorrow = borrowFromTens ? tT - 1 : tT;
  const borrowFromHundreds = op === '-' && tensAfterOnesBorrow < bT;
  const adjustedTopTens = borrowFromHundreds ? tensAfterOnesBorrow + 10 : tensAfterOnesBorrow;
  const adjustedTopHundreds = borrowFromHundreds ? tH - 1 : tH;

  const maxStep: 2 | 3 = isThreeDigit ? 3 : 2;

  const getStepExplanation = (): string => {
    if (step === 0) {
      return lang === 'ar'
        ? 'اضغط على "الخطوة التالية" لنحل المسألة خانة تلو الأخرى بدءًا من الآحاد.'
        : 'Click "Next Step" to walk through Ones, Tens, and Hundreds one column at a time.';
    }
    if (step === 1) {
      if (op === '+') {
        const sum = tO + bO;
        return carryToTens
          ? lang === 'ar'
            ? `الآحاد: ${tO} + ${bO} = ${sum}. نكتب ${aO} في الآحاد ونحمل ١ إلى خانة العشرات!`
            : `Ones: ${tO} + ${bO} = ${sum}. Write ${aO} in Ones and carry 1 Ten to the Tens column!`
          : lang === 'ar'
          ? `الآحاد: ${tO} + ${bO} = ${sum}. نكتب ${aO} مباشرة.`
          : `Ones: ${tO} + ${bO} = ${sum}. Write ${aO} directly.`;
      }
      return borrowFromTens
        ? lang === 'ar'
          ? `الآحاد: ${tO} أصغر من ${bO}، فنستلف ١ عشرة ليصبح الآحاد ${adjustedTopOnes}. ثم ${adjustedTopOnes} − ${bO} = ${aO}!`
          : `Ones: ${tO} < ${bO}, so borrow 1 Ten to make ${adjustedTopOnes} Ones. Now ${adjustedTopOnes} − ${bO} = ${aO}!`
        : lang === 'ar'
        ? `الآحاد: ${tO} − ${bO} = ${aO}.`
        : `Ones: ${tO} − ${bO} = ${aO}.`;
    }
    if (step === 2) {
      if (op === '+') {
        const sum = tT + bT + carryToTens;
        return carryToHundreds
          ? lang === 'ar'
            ? `العشرات: ${tT} + ${bT}${carryToTens ? ' + ١ (محمول)' : ''} = ${sum}. نكتب ${aT} ونحمل ١ للمئات!`
            : `Tens: ${tT} + ${bT}${carryToTens ? ' + 1 (carried)' : ''} = ${sum}. Write ${aT} and carry 1 to Hundreds!`
          : lang === 'ar'
          ? `العشرات: ${tT} + ${bT}${carryToTens ? ' + ١ (محمول)' : ''} = ${sum}. نكتب ${aT}.`
          : `Tens: ${tT} + ${bT}${carryToTens ? ' + 1 (carried)' : ''} = ${sum}. Write ${aT}.`;
      }
      return borrowFromHundreds
        ? lang === 'ar'
          ? `العشرات: بعد الاستلاف أصبحت ${tensAfterOnesBorrow} وهي أصغر من ${bT}، فنستلف ١ مئة لتصبح ${adjustedTopTens}. ثم ${adjustedTopTens} − ${bT} = ${aT}!`
          : `Tens: ${tensAfterOnesBorrow} < ${bT}, so borrow 1 Hundred to make ${adjustedTopTens} Tens. Now ${adjustedTopTens} − ${bT} = ${aT}!`
        : lang === 'ar'
        ? `العشرات: ${tensAfterOnesBorrow} − ${bT} = ${aT}.`
        : `Tens: ${tensAfterOnesBorrow} − ${bT} = ${aT}.`;
    }
    return op === '+'
      ? lang === 'ar'
        ? `المئات: ${tH} + ${bH}${carryToHundreds ? ' + ١ (محمول)' : ''} = ${aH}. الناتج النهائي = ${answer}!`
        : `Hundreds: ${tH} + ${bH}${carryToHundreds ? ' + 1 (carried)' : ''} = ${aH}. Final answer = ${answer}!`
      : lang === 'ar'
      ? `المئات: ${adjustedTopHundreds} − ${bH} = ${aH}. الناتج النهائي = ${answer}!`
      : `Hundreds: ${adjustedTopHundreds} − ${bH} = ${aH}. Final answer = ${answer}!`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {REGROUP_PRESETS.map((p, idx) => (
          <button
            key={p.label.en}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setPresetIdx(idx);
              setStep(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              presetIdx === idx
                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                : 'bg-white text-[#133C3B] border-[#133C3B]/20 hover:bg-[#F0FDFA]'
            }`}
          >
            {t(p.label, lang)}
          </button>
        ))}
      </div>

      <div className="bg-[#FCF9F0] border border-[#133C3B]/20 rounded-2xl p-6 flex flex-col items-center gap-4">
        <div
          dir="ltr"
          className="grid gap-x-4 gap-y-2 items-center text-center font-display tabular-nums"
          style={{
            gridTemplateColumns: isThreeDigit ? '36px 64px 64px 64px' : '36px 72px 72px',
          }}
        >
          <div />
          {isThreeDigit && (
            <div className={`text-xs font-sans font-bold ${step === 3 ? 'text-[#C2410C]' : 'text-[#64748B]'}`}>H</div>
          )}
          <div className={`text-xs font-sans font-bold ${step === 2 ? 'text-[#0F766E]' : 'text-[#64748B]'}`}>T</div>
          <div className={`text-xs font-sans font-bold ${step === 1 ? 'text-[#1D4ED8]' : 'text-[#64748B]'}`}>O</div>

          <div />
          {isThreeDigit && (
            <div className="h-7 flex items-center justify-center text-sm font-bold">
              {op === '+' && carryToHundreds === 1 && step >= 2 && <span className="text-[#C2410C]">+1</span>}
              {op === '-' && borrowFromHundreds && step >= 2 && <span className="text-[#C2410C]">{adjustedTopHundreds}</span>}
            </div>
          )}
          <div className="h-7 flex items-center justify-center text-sm font-bold">
            {op === '+' && carryToTens === 1 && step >= 1 && <span className="text-[#0F766E]">+1</span>}
            {op === '-' && step >= 1 && (borrowFromTens || borrowFromHundreds) && (
              <span className="text-[#0F766E]">
                {step >= 2 && borrowFromHundreds ? adjustedTopTens : tensAfterOnesBorrow}
              </span>
            )}
          </div>
          <div className="h-7 flex items-center justify-center text-sm font-bold">
            {op === '-' && borrowFromTens && step >= 1 && <span className="text-[#1D4ED8]">{adjustedTopOnes}</span>}
          </div>

          <div />
          {isThreeDigit && (
            <div
              className={`text-4xl font-bold rounded-xl py-1 ${step === 3 ? 'bg-[#FFEDD5] text-[#9A3412]' : 'text-[#133C3B]'} ${
                op === '-' && borrowFromHundreds && step >= 2 ? 'line-through opacity-45' : ''
              }`}
            >
              {tH}
            </div>
          )}
          <div
            className={`text-4xl font-bold rounded-xl py-1 ${step === 2 ? 'bg-[#CCFBF1] text-[#115E59]' : 'text-[#133C3B]'} ${
              op === '-' && (borrowFromTens || borrowFromHundreds) && step >= 1 ? 'line-through opacity-45' : ''
            }`}
          >
            {tT}
          </div>
          <div
            className={`text-4xl font-bold rounded-xl py-1 ${step === 1 ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'text-[#133C3B]'} ${
              op === '-' && borrowFromTens && step >= 1 ? 'line-through opacity-45' : ''
            }`}
          >
            {tO}
          </div>

          <div className="text-3xl font-bold text-[#D97706]">{op}</div>
          {isThreeDigit && (
            <div className={`text-4xl font-bold rounded-xl py-1 ${step === 3 ? 'bg-[#FFEDD5] text-[#9A3412]' : 'text-[#133C3B]'}`}>
              {bH}
            </div>
          )}
          <div className={`text-4xl font-bold rounded-xl py-1 ${step === 2 ? 'bg-[#CCFBF1] text-[#115E59]' : 'text-[#133C3B]'}`}>
            {bT}
          </div>
          <div className={`text-4xl font-bold rounded-xl py-1 ${step === 1 ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'text-[#133C3B]'}`}>
            {bO}
          </div>

          <div
            className="h-1 bg-[#133C3B] rounded-full my-1"
            style={{ gridColumn: isThreeDigit ? '1 / 5' : '1 / 4' }}
          />

          <div className="text-xl font-bold text-[#94A3B8]">=</div>
          {isThreeDigit && <div className="text-4xl font-bold text-[#C2410C]">{step >= 3 ? aH : '?'}</div>}
          <div className="text-4xl font-bold text-[#0F766E]">{step >= 2 ? aT : '?'}</div>
          <div className="text-4xl font-bold text-[#1D4ED8]">{step >= 1 ? aO : '?'}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setStep(0);
            }}
            className="h-10 px-4 rounded-xl bg-white border border-[#133C3B]/25 text-sm font-bold text-[#133C3B] hover:bg-[#FEF3C7] cursor-pointer whitespace-nowrap shrink-0"
          >
            {t(UI_TEXT.resetLab, lang)}
          </button>

          <button
            type="button"
            disabled={step >= maxStep}
            onClick={() => {
              soundEngine.playCorrect();
              setStep((s) => Math.min(maxStep, s + 1) as 0 | 1 | 2 | 3);
            }}
            className="h-10 px-5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-45 text-white text-sm font-bold cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            {lang === 'ar'
              ? step >= maxStep
                ? 'اكتملت الخطوات!'
                : `الخطوة التالية (${step + 1}/${maxStep})`
              : step >= maxStep
              ? 'All Steps Shown!'
              : `Next Step (${step + 1}/${maxStep})`}
          </button>
        </div>
      </div>

      <div className="bg-[#F0FDFA] border border-[#0F766E]/25 rounded-2xl p-4 text-sm font-bold text-[#133C3B]">
        {getStepExplanation()}
      </div>
    </div>
  );
};

/* ============================================================================
   04. ARRAYS & REPEATED ADDITION
   ============================================================================ */
const ArraysLab: React.FC<LabProps> = ({ lang }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [groupBy, setGroupBy] = useState<'rows' | 'cols'>('rows');

  const total = rows * cols;
  const repeatedExpr =
    groupBy === 'rows'
      ? Array(rows).fill(cols).join(' + ')
      : Array(cols).fill(rows).join(' + ');

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#64748B]">
              {lang === 'ar' ? 'عدد الصفوف (أفقي)' : 'Rows (Across)'}
            </div>
            <div className="font-display text-2xl font-bold text-[#0F766E] tabular-nums">{rows}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setRows((r) => Math.max(1, r - 1));
              }}
              aria-label={lang === 'ar' ? 'صفوف أقل' : 'Fewer rows'}
              className="w-10 h-10 rounded-xl bg-white border border-[#133C3B]/20 flex items-center justify-center hover:bg-[#CCFBF1] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setRows((r) => Math.min(6, r + 1));
              }}
              aria-label={lang === 'ar' ? 'صفوف أكثر' : 'More rows'}
              className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center hover:bg-[#115E59] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#64748B]">
              {lang === 'ar' ? 'عدد الأعمدة (رأسي)' : 'Columns (Down)'}
            </div>
            <div className="font-display text-2xl font-bold text-[#D97706] tabular-nums">{cols}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCols((c) => Math.max(1, c - 1));
              }}
              aria-label={lang === 'ar' ? 'أعمدة أقل' : 'Fewer columns'}
              className="w-10 h-10 rounded-xl bg-white border border-[#133C3B]/20 flex items-center justify-center hover:bg-[#FEF3C7] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCols((c) => Math.min(6, c + 1));
              }}
              aria-label={lang === 'ar' ? 'أعمدة أكثر' : 'More columns'}
              className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center hover:bg-[#B45309] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-[#F1EDE1] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setGroupBy('rows');
          }}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 ${
            groupBy === 'rows' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569]'
          }`}
        >
          {lang === 'ar' ? 'تجميع حسب الصفوف' : 'Group by Rows'}
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setGroupBy('cols');
          }}
          className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 ${
            groupBy === 'cols' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569]'
          }`}
        >
          {lang === 'ar' ? 'تجميع حسب الأعمدة' : 'Group by Columns'}
        </button>
      </div>

      <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2" dir="ltr">
          {Array.from({ length: rows }, (_, rIdx) => (
            <div
              key={rIdx}
              className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors ${
                groupBy === 'rows' ? 'bg-[#CCFBF1]/60 border border-[#0F766E]/25' : ''
              }`}
            >
              {Array.from({ length: cols }, (_, cIdx) => (
                <div
                  key={cIdx}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-display text-sm font-bold border-2 border-[#133C3B] ${
                    groupBy === 'cols'
                      ? cIdx % 2 === 0
                        ? 'bg-[#FDE68A] text-[#78350F]'
                        : 'bg-[#FDBA74] text-[#7C2D12]'
                      : 'bg-[#F59E0B] text-[#133C3B]'
                  }`}
                >
                  {rIdx * cols + cIdx + 1}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="w-full bg-white border border-[#133C3B]/15 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left" dir="ltr">
          <div>
            <div className="text-xs font-bold text-[#64748B]">
              {lang === 'ar' ? 'الجمع المتكرر:' : 'Repeated Addition:'}
            </div>
            <div className="font-display text-lg font-bold text-[#0F766E] tabular-nums">
              {repeatedExpr} = {total}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-[#64748B]">
              {lang === 'ar' ? 'معادلة الضرب:' : 'Multiplication:'}
            </div>
            <div className="font-display text-2xl font-bold text-[#133C3B] tabular-nums">
              {rows} × {cols} = {total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   05. TELLING TIME (ANALOG & DIGITAL CLOCK)
   ============================================================================ */
const ClockLab: React.FC<LabProps> = ({ lang }) => {
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(15);
  const [period, setPeriod] = useState<'am' | 'pm'>('am');

  const padMin = (m: number) => (m < 10 ? `0${m}` : `${m}`);

  const describeTime = (): string => {
    const nextHour = (hour % 12) + 1;
    if (minute === 0) return lang === 'ar' ? `الساعة ${hour} تمامًا` : `${hour} o'clock`;
    if (minute === 15) return lang === 'ar' ? `الساعة ${hour} والربع` : `Quarter past ${hour}`;
    if (minute === 30) return lang === 'ar' ? `الساعة ${hour} والنصف` : `Half past ${hour}`;
    if (minute === 45) return lang === 'ar' ? `الساعة ${nextHour} إلا ربع` : `Quarter to ${nextHour}`;
    return lang === 'ar' ? `الساعة ${hour} و ${minute} دقيقة` : `${minute} minutes past ${hour}`;
  };

  const stepMinutes = (delta: number) => {
    soundEngine.playClick();
    let totalMin = minute + delta;
    let nextH = hour;
    if (totalMin >= 60) {
      totalMin -= 60;
      nextH = (nextH % 12) + 1;
    } else if (totalMin < 0) {
      totalMin += 60;
      nextH = nextH === 1 ? 12 : nextH - 1;
    }
    setHour(nextH);
    setMinute(totalMin);
  };

  const stepHours = (delta: number) => {
    soundEngine.playClick();
    setHour((h) => ((h - 1 + delta + 12) % 12) + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-around gap-6">
        <AnalogClockSvg hour={hour} minute={minute} size={220} showMinuteTicks />

        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="bg-[#133C3B] text-[#FEF3C7] rounded-2xl px-6 py-3 font-display text-4xl font-bold tabular-nums tracking-wide" dir="ltr">
            {hour}:{padMin(minute)}{' '}
            <span className="text-lg text-[#5EEAD4]">{period.toUpperCase()}</span>
          </div>

          <div className="font-display text-xl font-bold text-[#1D4ED8]">{describeTime()}</div>

          <div className="flex flex-col gap-1 text-xs font-bold text-[#475569]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-5 h-1.5 rounded-full bg-[#DC2626]" />
              <span>{lang === 'ar' ? `العقرب القصير (الساعات): ${hour}` : `Short Red Hand (Hour): ${hour}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-5 h-1.5 rounded-full bg-[#0D9488]" />
              <span>{lang === 'ar' ? `العقرب الطويل (الدقائق): ${minute} دقيقة` : `Long Teal Hand (Minutes): ${minute} min`}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F1EDE1] rounded-xl">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setPeriod('am');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                period === 'am' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              {t(UI_TEXT.morningAm, lang)}
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setPeriod('pm');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                period === 'pm' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              {t(UI_TEXT.eveningPm, lang)}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => stepHours(-1)}
            className="h-10 px-3.5 rounded-xl bg-white border border-[#133C3B]/25 text-sm font-bold text-[#133C3B] hover:bg-[#FEF3C7] cursor-pointer whitespace-nowrap shrink-0"
          >
            {t(UI_TEXT.stepBackHour, lang)}
          </button>
          <button
            type="button"
            onClick={() => stepHours(1)}
            className="h-10 px-3.5 rounded-xl bg-[#DC2626] text-white text-sm font-bold hover:bg-[#B91C1C] cursor-pointer whitespace-nowrap shrink-0"
          >
            {t(UI_TEXT.stepForwardHour, lang)}
          </button>
          <button
            type="button"
            onClick={() => stepMinutes(-5)}
            className="h-10 px-3.5 rounded-xl bg-white border border-[#133C3B]/25 text-sm font-bold text-[#133C3B] hover:bg-[#CCFBF1] cursor-pointer whitespace-nowrap shrink-0"
          >
            {t(UI_TEXT.stepBack5, lang)}
          </button>
          <button
            type="button"
            onClick={() => stepMinutes(5)}
            className="h-10 px-3.5 rounded-xl bg-[#0D9488] text-white text-sm font-bold hover:bg-[#0F766E] cursor-pointer whitespace-nowrap shrink-0"
          >
            {t(UI_TEXT.stepForward5, lang)}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[0, 15, 30, 45].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setMinute(m);
              }}
              className={`h-9 px-3 rounded-lg text-xs font-bold tabular-nums border cursor-pointer whitespace-nowrap shrink-0 ${
                minute === m
                  ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                  : 'bg-white text-[#133C3B] border-[#133C3B]/20 hover:bg-[#EFF6FF]'
              }`}
            >
              :{padMin(m)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   06. ELAPSED TIME & CALENDAR
   ============================================================================ */
const DAYS_OF_WEEK: BilingualText[] = [
  { en: 'Sat', ar: 'السبت' },
  { en: 'Sun', ar: 'الأحد' },
  { en: 'Mon', ar: 'الاثنين' },
  { en: 'Tue', ar: 'الثلاثاء' },
  { en: 'Wed', ar: 'الأربعاء' },
  { en: 'Thu', ar: 'الخميس' },
  { en: 'Fri', ar: 'الجمعة' },
];

const MONTHS_LIST: BilingualText[] = [
  { en: 'Jan', ar: 'يناير' },
  { en: 'Feb', ar: 'فبراير' },
  { en: 'Mar', ar: 'مارس' },
  { en: 'Apr', ar: 'أبريل' },
  { en: 'May', ar: 'مايو' },
  { en: 'Jun', ar: 'يونيو' },
  { en: 'Jul', ar: 'يوليو' },
  { en: 'Aug', ar: 'أغسطس' },
  { en: 'Sep', ar: 'سبتمبر' },
  { en: 'Oct', ar: 'أكتوبر' },
  { en: 'Nov', ar: 'نوفمبر' },
  { en: 'Dec', ar: 'ديسمبر' },
];

const CalendarLab: React.FC<LabProps> = ({ lang }) => {
  const [tab, setTab] = useState<'elapsed' | 'calendar'>('elapsed');
  const [startHour, setStartHour] = useState(2);
  const [durationMin, setDurationMin] = useState(90);
  const [startDayIdx, setStartDayIdx] = useState(1);
  const [jumpDays, setJumpDays] = useState(3);

  const endTotalMinutes = startHour * 60 + durationMin;
  const endHour = ((Math.floor(endTotalMinutes / 60) - 1) % 12) + 1;
  const endMin = endTotalMinutes % 60;
  const padMin = (m: number) => (m < 10 ? `0${m}` : `${m}`);
  const durHours = Math.floor(durationMin / 60);
  const durRemMins = durationMin % 60;
  const targetDayIdx = (startDayIdx + jumpDays) % 7;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 p-1 bg-[#F1EDE1] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setTab('elapsed');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 ${
            tab === 'elapsed' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569]'
          }`}
        >
          {lang === 'ar' ? 'الوقت المنقضي (المدة)' : 'Elapsed Time Jump'}
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setTab('calendar');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap shrink-0 ${
            tab === 'calendar' ? 'bg-white text-[#133C3B] shadow-xs' : 'text-[#475569]'
          }`}
        >
          {lang === 'ar' ? 'أيام الأسبوع والشهور' : 'Days & Months'}
        </button>
      </div>

      {tab === 'elapsed' ? (
        <div className="flex flex-col gap-4">
          <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-around gap-4" dir="ltr">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-bold text-[#64748B]">{lang === 'ar' ? 'وقت البداية' : 'Start Time'}</span>
              <AnalogClockSvg hour={startHour} minute={0} size={130} showMinuteTicks={false} />
              <span className="font-display text-xl font-bold text-[#133C3B] tabular-nums">{startHour}:00</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-xs font-bold text-[#4338CA]">
                +{durHours > 0 ? `${durHours}h ` : ''}
                {durRemMins > 0 ? `${durRemMins}m` : ''}
              </span>
              <div className="w-24 sm:w-32 h-2 rounded-full bg-[#C7D2FE] overflow-hidden">
                <div
                  className="h-full bg-[#4338CA] transition-all duration-200"
                  style={{ width: `${Math.min(100, (durationMin / 180) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#64748B] tabular-nums">({durationMin} min)</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-bold text-[#0F766E]">{lang === 'ar' ? 'وقت النهاية' : 'End Time'}</span>
              <AnalogClockSvg hour={endHour} minute={endMin} size={130} showMinuteTicks={false} />
              <span className="font-display text-xl font-bold text-[#0F766E] tabular-nums">
                {endHour}:{padMin(endMin)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-[#133C3B]">
                <span>{lang === 'ar' ? 'ساعة البداية' : 'Start Hour'}</span>
                <span className="tabular-nums">{startHour}:00</span>
              </div>
              <input
                type="range"
                min={1}
                max={9}
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full accent-[#133C3B]"
              />
            </div>
            <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold text-[#4338CA]">
                <span>{lang === 'ar' ? 'المدة المضافة' : 'Duration Added'}</span>
                <span className="tabular-nums">{durationMin} min</span>
              </div>
              <input
                type="range"
                min={15}
                max={180}
                step={15}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full accent-[#4338CA]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#133C3B]">
                {lang === 'ar' ? 'أيام الأسبوع (٧ أيام = ١ أسبوع)' : '7 Days in 1 Week — Click a Start Day'}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4338CA]">
                <span>{lang === 'ar' ? 'قفز للأمام:' : 'Jump Forward:'}</span>
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setJumpDays(d);
                    }}
                    className={`w-8 h-8 rounded-lg border font-bold cursor-pointer tabular-nums ${
                      jumpDays === d
                        ? 'bg-[#4338CA] text-white border-[#4338CA]'
                        : 'bg-white text-[#133C3B] border-[#133C3B]/20'
                    }`}
                  >
                    +{d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day, idx) => {
                const isStart = idx === startDayIdx;
                const isTarget = idx === targetDayIdx;
                return (
                  <button
                    key={day.en}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setStartDayIdx(idx);
                    }}
                    className={`py-3 px-1 rounded-xl border text-center font-bold text-xs sm:text-sm cursor-pointer transition-colors ${
                      isTarget
                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                        : isStart
                        ? 'bg-[#4338CA] text-white border-[#4338CA]'
                        : 'bg-white text-[#133C3B] border-[#133C3B]/15 hover:bg-[#EEF2FF]'
                    }`}
                  >
                    {t(day, lang)}
                  </button>
                );
              })}
            </div>

            <div className="text-sm font-bold text-[#133C3B]">
              {lang === 'ar'
                ? `${t(DAYS_OF_WEEK[startDayIdx], lang)} + ${jumpDays} أيام ← ${t(DAYS_OF_WEEK[targetDayIdx], lang)}`
                : `${t(DAYS_OF_WEEK[startDayIdx], lang)} + ${jumpDays} days → ${t(DAYS_OF_WEEK[targetDayIdx], lang)}`}
            </div>
          </div>

          <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="text-xs font-bold text-[#64748B]">
              {lang === 'ar' ? 'شهور السنة الكاملة (١٢ شهرًا = ١ سنة)' : '12 Months in 1 Full Year'}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {MONTHS_LIST.map((m, idx) => (
                <div
                  key={m.en}
                  className="bg-[#FCF9F0] border border-[#133C3B]/12 rounded-xl py-2 px-2 text-center"
                >
                  <div className="text-[11px] font-bold text-[#94A3B8] tabular-nums">{idx + 1}</div>
                  <div className="text-xs sm:text-sm font-bold text-[#133C3B]">{t(m, lang)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   07. MEASURING LENGTH (cm / m) — STANDALONE LAB
   ============================================================================ */
const LengthLab: React.FC<LabProps> = ({ lang }) => {
  const [startCm, setStartCm] = useState(2);
  const [lengthCm, setLengthCm] = useState(7);
  const maxCm = 14;
  const endCm = Math.min(maxCm, startCm + lengthCm);
  const actualLength = endCm - startCm;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col gap-4" dir="ltr">
        <div className="relative h-14 flex items-center">
          <div
            className="h-10 rounded-xl bg-[#15803D] border-2 border-[#133C3B] flex items-center justify-center text-white font-display font-bold text-sm transition-all duration-150"
            style={{
              marginLeft: `${(startCm / maxCm) * 100}%`,
              width: `${(actualLength / maxCm) * 100}%`,
            }}
          >
            {actualLength} cm
          </div>
        </div>

        <div className="bg-[#FDE68A] border-2 border-[#133C3B] rounded-xl px-0 pt-0 pb-2 relative">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${maxCm}, minmax(0, 1fr))` }}>
            {Array.from({ length: maxCm }, (_, i) => (
              <div key={i} className="border-r border-[#133C3B] h-5 relative">
                {i === 0 && (
                  <span className="absolute -bottom-5 left-0.5 text-[11px] font-bold text-[#133C3B] tabular-nums">
                    0
                  </span>
                )}
                <span className="absolute -bottom-5 right-0 translate-x-1/2 text-[11px] font-bold text-[#133C3B] tabular-nums">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="h-4" />
        </div>

        <div className="text-sm font-bold text-[#133C3B] pt-1">
          {startCm === 0
            ? lang === 'ar'
              ? `يبدأ عند ٠ وينتهي عند ${endCm} ← الطول = ${actualLength} سم`
              : `Starts at 0 cm and ends at ${endCm} cm → Length = ${actualLength} cm`
            : lang === 'ar'
            ? `يبدأ عند ${startCm} وينتهي عند ${endCm} ← الطول = ${endCm} − ${startCm} = ${actualLength} سم`
            : `Starts at ${startCm} cm and ends at ${endCm} cm → Length = ${endCm} − ${startCm} = ${actualLength} cm`}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold text-[#133C3B]">
            <span>{lang === 'ar' ? 'نقطة البداية على المسطرة' : 'Start Mark on Ruler'}</span>
            <span className="tabular-nums">{startCm} cm</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            value={startCm}
            onChange={(e) => setStartCm(Number(e.target.value))}
            className="w-full accent-[#D97706]"
          />
        </div>
        <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-bold text-[#15803D]">
            <span>{lang === 'ar' ? 'طول الجسم' : 'Object Length'}</span>
            <span className="tabular-nums">{actualLength} cm</span>
          </div>
          <input
            type="range"
            min={2}
            max={10}
            value={lengthCm}
            onChange={(e) => setLengthCm(Number(e.target.value))}
            className="w-full accent-[#15803D]"
          />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   08. LIQUID CAPACITY (L / mL) — STANDALONE LAB
   ============================================================================ */
const CapacityLab: React.FC<LabProps> = ({ lang }) => {
  const [waterMl, setWaterMl] = useState(500);

  return (
    <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-around gap-6">
      <div className="flex items-end gap-3" dir="ltr">
        <div className="flex flex-col justify-between h-56 text-xs font-bold text-[#475569] tabular-nums py-1 text-right">
          <span>1 L (1000 mL)</span>
          <span>750 mL</span>
          <span>500 mL</span>
          <span>250 mL</span>
          <span>0 mL</span>
        </div>
        <div className="w-32 h-56 rounded-b-3xl rounded-t-md border-4 border-[#133C3B] bg-white relative overflow-hidden flex flex-col justify-end">
          <div
            className="w-full bg-[#38BDF8] transition-all duration-300 border-t-4 border-[#0284C7]"
            style={{ height: `${(waterMl / 1000) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-[#133C3B] tabular-nums">
            {waterMl} mL
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 max-w-xs w-full">
        <div className="font-display text-xl font-bold text-[#133C3B] tabular-nums">
          {waterMl === 1000
            ? lang === 'ar'
              ? '١٠٠٠ مل = ١ لتر كامل!'
              : '1000 mL = 1 Full Liter!'
            : lang === 'ar'
            ? `${waterMl} مل (متبقي ${1000 - waterMl} مل ليصل إلى ١ لتر)`
            : `${waterMl} mL (${1000 - waterMl} mL left to reach 1 L)`}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[500, 250, 100, 50].map((scoop) => (
            <button
              key={scoop}
              type="button"
              onClick={() => {
                soundEngine.playHop();
                setWaterMl((w) => Math.min(1000, w + scoop));
              }}
              className="h-11 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm cursor-pointer tabular-nums whitespace-nowrap shrink-0"
            >
              +{scoop} mL
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setWaterMl(0);
          }}
          className="h-10 rounded-xl bg-white border border-[#133C3B]/25 text-sm font-bold text-[#133C3B] hover:bg-[#FEF3C7] cursor-pointer"
        >
          {lang === 'ar' ? 'إفراغ الدورق (٠ مل)' : 'Empty Jug (0 mL)'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   09. MASS & BALANCE SCALES (g / kg) — STANDALONE LAB
   ============================================================================ */
const MassLab: React.FC<LabProps> = ({ lang }) => {
  const [leftG, setLeftG] = useState(1000);
  const [rightG, setRightG] = useState(650);
  const tiltDeg = leftG === rightG ? 0 : leftG > rightG ? -10 : 10;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="w-full max-w-md flex flex-col items-center" dir="ltr">
          <div
            className="w-full flex items-end justify-between px-4 transition-transform duration-300"
            style={{ transform: `rotate(${tiltDeg}deg)` }}
          >
            <div className="w-28 sm:w-32 bg-[#FEF3C7] border-2 border-[#133C3B] rounded-xl p-2.5 text-center">
              <div className="text-[11px] font-bold text-[#92400E]">
                {lang === 'ar' ? 'الكفة اليسرى' : 'Left Pan'}
              </div>
              <div className="font-display text-lg font-bold text-[#133C3B] tabular-nums">
                {leftG >= 1000 && leftG % 1000 === 0 ? `${leftG / 1000} kg` : `${leftG} g`}
              </div>
            </div>

            <div className="w-28 sm:w-32 bg-[#CCFBF1] border-2 border-[#133C3B] rounded-xl p-2.5 text-center">
              <div className="text-[11px] font-bold text-[#115E59]">
                {lang === 'ar' ? 'الكفة اليمنى' : 'Right Pan'}
              </div>
              <div className="font-display text-lg font-bold text-[#133C3B] tabular-nums">
                {rightG >= 1000 && rightG % 1000 === 0 ? `${rightG / 1000} kg` : `${rightG} g`}
              </div>
            </div>
          </div>
          <div
            className="w-4/5 h-2.5 bg-[#133C3B] rounded-full transition-transform duration-300"
            style={{ transform: `rotate(${tiltDeg}deg)` }}
          />
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[26px] border-l-transparent border-r-transparent border-b-[#D97706]" />
        </div>

        <div className="text-sm font-bold text-[#133C3B] tabular-nums">
          {leftG === rightG
            ? lang === 'ar'
              ? `الميزان متوازن! ${leftG} جم = ${rightG} جم`
              : `Balanced! ${leftG} g = ${rightG} g`
            : leftG > rightG
            ? lang === 'ar'
              ? `الكفة اليسرى أثقل (${leftG} جم > ${rightG} جم)`
              : `Left side is heavier (${leftG} g > ${rightG} g)`
            : lang === 'ar'
            ? `الكفة اليمنى أثقل (${rightG} جم > ${leftG} جم)`
            : `Right side is heavier (${rightG} g > ${leftG} g)`}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-bold text-[#92400E]">
            <span>{lang === 'ar' ? 'تعديل الكفة اليسرى' : 'Left Pan Mass'}</span>
            <span className="tabular-nums">{leftG} g</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[250, 500, 1000, 2000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setLeftG(v);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer tabular-nums ${
                  leftG === v ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-[#FCF9F0] text-[#133C3B] border-[#133C3B]/15'
                }`}
              >
                {v >= 1000 ? `${v / 1000} kg (${v}g)` : `${v} g`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#133C3B]/15 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-bold text-[#115E59]">
            <span>{lang === 'ar' ? 'تعديل الكفة اليمنى' : 'Right Pan Mass'}</span>
            <span className="tabular-nums">{rightG} g</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[250, 500, 650, 1000, 2000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setRightG(v);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer tabular-nums ${
                  rightG === v ? 'bg-[#0F766E] text-white border-[#0F766E]' : 'bg-[#FCF9F0] text-[#133C3B] border-[#133C3B]/15'
                }`}
              >
                {v >= 1000 ? `${v / 1000} kg` : `${v} g`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   10. 2D & 3D SHAPES — STANDALONE LAB
   ============================================================================ */
interface ShapeFact {
  kind: ShapeKind;
  name: BilingualText;
  dim: '2D' | '3D';
  fact: BilingualText;
}

const SHAPE_FACTS: ShapeFact[] = [
  { kind: 'triangle', name: { en: 'Triangle', ar: 'مثلث' }, dim: '2D', fact: { en: '3 sides · 3 vertices', ar: '٣ أضلاع · ٣ رؤوس' } },
  { kind: 'square', name: { en: 'Square', ar: 'مربع' }, dim: '2D', fact: { en: '4 equal sides · 4 vertices', ar: '٤ أضلاع متساوية · ٤ رؤوس' } },
  { kind: 'rectangle', name: { en: 'Rectangle', ar: 'مستطيل' }, dim: '2D', fact: { en: '4 sides (2 long, 2 short) · 4 vertices', ar: '٤ أضلاع · ٤ رؤوس' } },
  { kind: 'pentagon', name: { en: 'Pentagon', ar: 'خماسي' }, dim: '2D', fact: { en: '5 sides · 5 vertices', ar: '٥ أضلاع · ٥ رؤوس' } },
  { kind: 'hexagon', name: { en: 'Hexagon', ar: 'سداسي' }, dim: '2D', fact: { en: '6 sides · 6 vertices', ar: '٦ أضلاع · ٦ رؤوس' } },
  { kind: 'cube', name: { en: 'Cube', ar: 'مكعب' }, dim: '3D', fact: { en: '6 flat square faces · 8 vertices', ar: '٦ أوجه مربعة · ٨ رؤوس' } },
  { kind: 'cylinder', name: { en: 'Cylinder', ar: 'أسطوانة' }, dim: '3D', fact: { en: '2 flat circular faces · 0 vertices', ar: 'وجهان دائريان · ٠ رؤوس' } },
  { kind: 'pyramid', name: { en: 'Pyramid', ar: 'هرم' }, dim: '3D', fact: { en: '5 faces (1 square base + 4 triangles)', ar: '٥ أوجه (قاعدة مربعة + ٤ مثلثات)' } },
];

const ShapesLab: React.FC<LabProps> = ({ lang }) => {
  const [selectedShape, setSelectedShape] = useState<ShapeKind>('pentagon');
  const shapeInfo = SHAPE_FACTS.find((s) => s.kind === selectedShape) ?? SHAPE_FACTS[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-around gap-5">
        <EgyptShapeSvg shape={shapeInfo.kind} size={160} showVertices />
        <div className="flex flex-col gap-1.5 text-center sm:text-start">
          <div className="text-xs font-bold text-[#7C3AED]">
            {shapeInfo.dim} {lang === 'ar' ? 'شكل هندسي' : 'Geometry'}
          </div>
          <div className="font-display text-3xl font-bold text-[#133C3B]">
            {t(shapeInfo.name, lang)}
          </div>
          <div className="text-base font-bold text-[#0F766E]">{t(shapeInfo.fact, lang)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SHAPE_FACTS.map((sf) => (
          <button
            key={sf.kind}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setSelectedShape(sf.kind);
            }}
            className={`px-3 py-3 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
              selectedShape === sf.kind
                ? 'bg-[#133C3B] text-white border-[#133C3B]'
                : 'bg-white text-[#133C3B] border-[#133C3B]/15 hover:bg-[#F5F3FF]'
            }`}
          >
            {t(sf.name, lang)} ({sf.dim})
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   11. FRACTIONS — STANDALONE LAB (HALVES TO EIGHTHS)
   ============================================================================ */
const FractionsLab: React.FC<LabProps> = ({ lang }) => {
  const [totalParts, setTotalParts] = useState(4);
  const [shadedParts, setShadedParts] = useState(3);

  const getFractionLabel = (): string => {
    if (shadedParts === totalParts) return lang === 'ar' ? `${shadedParts}/${totalParts} (واحد صحيح)` : `${shadedParts}/${totalParts} (1 Whole)`;
    if (totalParts === 2 && shadedParts === 1) return lang === 'ar' ? '١/٢ (نصف)' : '1/2 (One Half)';
    if (totalParts === 3 && shadedParts === 1) return lang === 'ar' ? '١/٣ (ثلث)' : '1/3 (One Third)';
    if (totalParts === 3 && shadedParts === 2) return lang === 'ar' ? '٢/٣ (ثلثان)' : '2/3 (Two Thirds)';
    if (totalParts === 4 && shadedParts === 1) return lang === 'ar' ? '١/٤ (ربع)' : '1/4 (One Quarter)';
    if (totalParts === 4 && shadedParts === 2) return lang === 'ar' ? '٢/٤ (ربعان = نصف)' : '2/4 (Two Quarters = Half)';
    if (totalParts === 4 && shadedParts === 3) return lang === 'ar' ? '٣/٤ (ثلاثة أرباع)' : '3/4 (Three Quarters)';
    return `${shadedParts}/${totalParts}`;
  };

  return (
    <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-around gap-6">
      <FractionCircleSvg totalParts={totalParts} shadedParts={shadedParts} size={184} />

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="font-display text-2xl sm:text-3xl font-bold text-[#0F766E] tabular-nums">
          {getFractionLabel()}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#64748B]">
            {lang === 'ar' ? 'المقام (إجمالي الأجزاء المتساوية):' : 'Denominator (Total Equal Parts):'}
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            {[2, 3, 4, 5, 6, 8].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTotalParts(p);
                  if (shadedParts > p) setShadedParts(p);
                }}
                className={`h-10 rounded-xl font-bold text-sm border cursor-pointer tabular-nums ${
                  totalParts === p
                    ? 'bg-[#133C3B] text-white border-[#133C3B]'
                    : 'bg-white text-[#133C3B] border-[#133C3B]/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#64748B]">
            {lang === 'ar' ? 'البسط (الأجزاء المظللة):' : 'Numerator (Shaded Parts):'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: totalParts }, (_, idx) => idx + 1).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShadedParts(s);
                }}
                className={`min-w-[40px] flex-1 h-10 rounded-xl font-bold text-sm border cursor-pointer tabular-nums ${
                  shadedParts === s
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : 'bg-white text-[#133C3B] border-[#133C3B]/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   12. BAR GRAPHS & DATA — STANDALONE LAB
   ============================================================================ */
const GraphsLab: React.FC<LabProps> = ({ lang }) => {
  const [mango, setMango] = useState(6);
  const [dates, setDates] = useState(3);
  const [figs, setFigs] = useState(5);

  const items = [
    { label: { en: 'Mango', ar: 'مانجو' }, val: mango, set: setMango, color: '#F59E0B' },
    { label: { en: 'Dates', ar: 'تمر' }, val: dates, set: setDates, color: '#B45309' },
    { label: { en: 'Figs', ar: 'تين' }, val: figs, set: setFigs, color: '#8B5CF6' },
  ];

  const sorted = [...items].sort((a, b) => b.val - a.val);
  const mostItem = sorted[0];
  const leastItem = sorted[sorted.length - 1];

  return (
    <div className="bg-[#FCF9F0] border border-[#133C3B]/15 rounded-2xl p-5 flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-6 items-end h-48 pt-4 px-4 border-b-2 border-[#133C3B]/25">
        {items.map((bar) => (
          <div key={bar.label.en} className="flex flex-col items-center gap-2 h-full justify-end">
            <span className="font-display text-lg font-bold text-[#133C3B] tabular-nums">
              {bar.val}
            </span>
            <div
              className="w-14 sm:w-16 rounded-t-xl border-2 border-[#133C3B] transition-all duration-200"
              style={{
                height: `${(bar.val / 9) * 126}px`,
                backgroundColor: bar.color,
              }}
            />
            <span className="text-xs sm:text-sm font-bold text-[#133C3B]">{t(bar.label, lang)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label.en} className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                item.set((v) => Math.max(1, v - 1));
              }}
              aria-label={`Decrease ${item.label.en}`}
              className="w-9 h-9 rounded-lg bg-white border border-[#133C3B]/20 flex items-center justify-center hover:bg-[#FEF3C7] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                item.set((v) => Math.min(9, v + 1));
              }}
              aria-label={`Increase ${item.label.en}`}
              className="w-9 h-9 rounded-lg bg-[#133C3B] text-white flex items-center justify-center hover:bg-[#0F766E] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-bold tabular-nums">
        <div className="bg-white border border-[#133C3B]/15 rounded-xl p-3 text-[#133C3B]">
          {lang === 'ar'
            ? `الإجمالي: ${mango} + ${dates} + ${figs} = ${mango + dates + figs}`
            : `Total: ${mango} + ${dates} + ${figs} = ${mango + dates + figs}`}
        </div>
        <div className="bg-white border border-[#133C3B]/15 rounded-xl p-3 text-[#0F766E]">
          {lang === 'ar'
            ? `الأكثر: ${t(mostItem.label, lang)} (${mostItem.val})`
            : `Most: ${t(mostItem.label, lang)} (${mostItem.val})`}
        </div>
        <div className="bg-white border border-[#133C3B]/15 rounded-xl p-3 text-[#BE123C]">
          {lang === 'ar'
            ? `الفرق (الأكبر − الأصغر): ${mostItem.val} − ${leastItem.val} = ${mostItem.val - leastItem.val}`
            : `Range (${mostItem.val} − ${leastItem.val}): ${mostItem.val - leastItem.val}`}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   DISPATCHER FOR ALL 12 STANDALONE SUBJECT LABS
   ============================================================================ */
export const PracticeVisualizer: React.FC<{
  subjectId: SubjectId;
  lang: Language;
}> = ({ subjectId, lang }) => {
  switch (subjectId) {
    case 'place_value':
      return <PlaceValueLab lang={lang} />;
    case 'money':
      return <MoneyLab lang={lang} />;
    case 'vertical_math':
      return <RegroupingLab lang={lang} />;
    case 'arrays':
      return <ArraysLab lang={lang} />;
    case 'clock':
      return <ClockLab lang={lang} />;
    case 'calendar':
      return <CalendarLab lang={lang} />;
    case 'length':
      return <LengthLab lang={lang} />;
    case 'capacity':
      return <CapacityLab lang={lang} />;
    case 'mass':
      return <MassLab lang={lang} />;
    case 'shapes':
      return <ShapesLab lang={lang} />;
    case 'fractions':
      return <FractionsLab lang={lang} />;
    case 'graphs':
      return <GraphsLab lang={lang} />;
  }
};
