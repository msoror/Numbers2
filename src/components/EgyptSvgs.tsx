import React from 'react';
import { Language, ShapeKind, StickerId } from '../types/game';

export const EgyptTitleLockupSvg: React.FC<{ lang: Language; className?: string }> = ({
  lang,
  className = '',
}) => (
  <svg
    viewBox="0 0 460 162"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={lang === 'ar' ? 'أرقام النيل' : 'Nile Numbers'}
  >
    {/* Warm Papyrus Cartouche Panel */}
    <rect x="6" y="12" width="448" height="138" rx="28" fill="#FFFDF7" fillOpacity="0.94" />
    <rect x="6" y="12" width="448" height="138" rx="28" stroke="#133C3B" strokeWidth="4" />
    <rect x="15" y="21" width="430" height="120" rx="21" stroke="#D97706" strokeWidth="2" strokeDasharray="6 6" />

    {/* Sun & Nile Wave Emblem */}
    <circle cx="48" cy="48" r="16" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.5" />
    <path d="M28 66C38 61 48 61 58 66C68 71 78 71 88 66" stroke="#0D9488" strokeWidth="3.5" strokeLinecap="round" />

    {/* Primary 2 Emblem */}
    <circle cx="414" cy="48" r="16" fill="#0D9488" stroke="#133C3B" strokeWidth="2.5" />
    <text
      x="414"
      y="54"
      textAnchor="middle"
      fill="#FFFDF7"
      fontFamily="Fredoka, Cairo, sans-serif"
      fontWeight="700"
      fontSize="16"
    >
      P2
    </text>

    {lang === 'ar' ? (
      <>
        <text
          x="230"
          y="84"
          textAnchor="middle"
          fill="#133C3B"
          fontFamily="Cairo, system-ui, sans-serif"
          fontWeight="800"
          fontSize="50"
        >
          أرقام النيل
        </text>
        <text
          x="230"
          y="124"
          textAnchor="middle"
          fill="#D97706"
          fontFamily="Cairo, system-ui, sans-serif"
          fontWeight="700"
          fontSize="22"
        >
          مغامرة الرياضيات · الصف الثاني الابتدائي
        </text>
      </>
    ) : (
      <>
        <text
          x="230"
          y="78"
          textAnchor="middle"
          fill="#133C3B"
          fontFamily="Fredoka, system-ui, sans-serif"
          fontWeight="700"
          fontSize="48"
        >
          Nile Numbers
        </text>
        <text
          x="230"
          y="122"
          textAnchor="middle"
          fill="#D97706"
          fontFamily="Fredoka, system-ui, sans-serif"
          fontWeight="700"
          fontSize="24"
        >
          Primary 2 Math · Egypt
        </text>
      </>
    )}
  </svg>
);

export const EgyptianBanknoteSvg: React.FC<{
  denomination: number;
  lang: Language;
  compact?: boolean;
}> = ({ denomination, lang, compact = false }) => {
  const styles: Record<number, { bg: string; accent: string; ink: string }> = {
    1: { bg: '#FEF3C7', accent: '#D97706', ink: '#78350F' },
    5: { bg: '#CCFBF1', accent: '#0D9488', ink: '#115E59' },
    10: { bg: '#FFE4E6', accent: '#E11D48', ink: '#881337' },
    20: { bg: '#DCFCE7', accent: '#16A34A', ink: '#14532D' },
    50: { bg: '#F3E8FF', accent: '#9333EA', ink: '#581C87' },
    100: { bg: '#FFEDD5', accent: '#EA580C', ink: '#7C2D12' },
    200: { bg: '#E0F2FE', accent: '#0284C7', ink: '#0C4A6E' },
  };
  const pal = styles[denomination] ?? styles[1];
  const w = compact ? 88 : 112;
  const h = compact ? 48 : 58;

  const noteAria =
    lang === 'ar'
      ? `ورقة نقدية بقيمة ${denomination} جنيه مصري`
      : `${denomination} Egyptian pound banknote`;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 112 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={noteAria}
    >
      <rect x="2" y="2" width="108" height="54" rx="8" fill={pal.bg} stroke="#133C3B" strokeWidth="2.5" />
      <rect x="7" y="7" width="98" height="44" rx="5" stroke={pal.accent} strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="56" cy="29" r="15" fill="#FFFDF7" stroke={pal.accent} strokeWidth="2" />
      <text
        x="56"
        y="34"
        textAnchor="middle"
        fill={pal.ink}
        fontFamily="Fredoka, system-ui, sans-serif"
        fontWeight="700"
        fontSize="16"
      >
        {denomination}
      </text>
      <text
        x="17"
        y="21"
        textAnchor="middle"
        fill={pal.ink}
        fontFamily="Fredoka, system-ui, sans-serif"
        fontWeight="700"
        fontSize="11"
      >
        {denomination}
      </text>
      <text
        x="94"
        y="46"
        textAnchor="middle"
        fill={pal.ink}
        fontFamily="Cairo, sans-serif"
        fontWeight="700"
        fontSize="10"
      >
        {lang === 'ar' ? 'ج.م' : 'LE'}
      </text>
    </svg>
  );
};

export const AnalogClockSvg: React.FC<{
  hour: number;
  minute: number;
  size?: number;
  showMinuteTicks?: boolean;
  lang?: Language;
  hideExactTime?: boolean;
}> = ({ hour, minute, size = 220, showMinuteTicks = true, lang = 'en', hideExactTime = false }) => {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteMark = minute === 0 ? 12 : Math.round(minute / 5);
  const padM = minute < 10 ? `0${minute}` : `${minute}`;
  const clockAria = hideExactTime
    ? lang === 'ar'
      ? `ساعة بعقارب: العقرب الأحمر القصير عند ${hour} والعقرب الأخضر الطويل عند الرقم ${minuteMark}`
      : `Analog clock: short red hour hand near ${hour} and long teal minute hand pointing to ${minuteMark}`
    : lang === 'ar'
    ? `ساعة بعقارب تشير إلى ${hour}:${padM}`
    : `Analog clock showing ${hour}:${padM}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={clockAria}
    >
      {/* Sandstone & Gold Bezel */}
      <circle cx="110" cy="110" r="102" fill="#F59E0B" stroke="#133C3B" strokeWidth="4" />
      <circle cx="110" cy="110" r="90" fill="#FFFDF7" stroke="#133C3B" strokeWidth="3" />

      {/* 60 Tick Marks */}
      {Array.from({ length: 60 }, (_, idx) => {
        const isHour = idx % 5 === 0;
        if (!showMinuteTicks && !isHour) return null;
        const rad = ((idx * 6 - 90) * Math.PI) / 180;
        const r1 = isHour ? 76 : 82;
        const r2 = 86;
        return (
          <line
            key={idx}
            x1={110 + Math.cos(rad) * r1}
            y1={110 + Math.sin(rad) * r1}
            x2={110 + Math.cos(rad) * r2}
            y2={110 + Math.sin(rad) * r2}
            stroke={isHour ? '#133C3B' : '#94A3B8'}
            strokeWidth={isHour ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* 1..12 Numerals */}
      {Array.from({ length: 12 }, (_, idx) => {
        const num = idx + 1;
        const rad = ((num * 30 - 90) * Math.PI) / 180;
        const x = 110 + Math.cos(rad) * 63;
        const y = 110 + Math.sin(rad) * 63 + 6;
        return (
          <text
            key={num}
            x={x}
            y={y}
            textAnchor="middle"
            fill="#133C3B"
            fontFamily="Fredoka, system-ui, sans-serif"
            fontWeight="700"
            fontSize="18"
          >
            {num}
          </text>
        );
      })}

      {/* Hour Hand (Short, Terracotta/Dark) */}
      <g transform={`rotate(${hourAngle} 110 110)`} className="transition-transform duration-200 ease-out">
        <line x1="110" y1="114" x2="110" y2="62" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* Minute Hand (Long, Nile Teal) */}
      <g transform={`rotate(${minuteAngle} 110 110)`} className="transition-transform duration-200 ease-out">
        <line x1="110" y1="116" x2="110" y2="38" stroke="#0D9488" strokeWidth="4.5" strokeLinecap="round" />
      </g>

      {/* Center Pin */}
      <circle cx="110" cy="110" r="7" fill="#F59E0B" stroke="#133C3B" strokeWidth="2.5" />
    </svg>
  );
};

export const FractionCircleSvg: React.FC<{
  totalParts: number;
  shadedParts: number;
  size?: number;
  lang?: Language;
}> = ({ totalParts, shadedParts, size = 148, lang = 'en' }) => {
  const cx = 74;
  const cy = 74;
  const r = 62;

  const slices = Array.from({ length: totalParts }, (_, i) => {
    const startDeg = (i * 360) / totalParts - 90;
    const endDeg = ((i + 1) * 360) / totalParts - 90;
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = 360 / totalParts > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const isShaded = i < shadedParts;
    return (
      <path
        key={i}
        d={d}
        fill={isShaded ? '#0D9488' : '#FFFDF7'}
        stroke="#133C3B"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  });

  const fracAria =
    lang === 'ar'
      ? `دائرة مقسمة إلى ${totalParts} أجزاء متساوية، منها ${shadedParts} مظللة`
      : `Circle divided into ${totalParts} equal parts with ${shadedParts} shaded`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 148 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={fracAria}
    >
      {slices}
    </svg>
  );
};

const SHAPE_DESCRIPTIONS: Record<
  ShapeKind,
  { named: { en: string; ar: string }; geometryOnly: { en: string; ar: string } }
> = {
  triangle: {
    named: { en: 'Triangle with 3 sides and 3 corners', ar: 'مثلث له ٣ أضلاع و ٣ رؤوس' },
    geometryOnly: { en: 'Flat 2D shape with 3 straight sides and 3 corners', ar: 'شكل هندسي مسطح له ٣ أضلاع مستقيمة و ٣ رؤوس' },
  },
  square: {
    named: { en: 'Square with 4 equal sides and 4 corners', ar: 'مربع له ٤ أضلاع متساوية و ٤ رؤوس' },
    geometryOnly: { en: 'Flat 2D shape with 4 equal straight sides and 4 corners', ar: 'شكل هندسي مسطح له ٤ أضلاع متساوية و ٤ رؤوس' },
  },
  rectangle: {
    named: { en: 'Rectangle with 4 sides and 4 corners', ar: 'مستطيل له ٤ أضلاع و ٤ رؤوس' },
    geometryOnly: { en: 'Flat 2D shape with 2 long sides, 2 short sides, and 4 corners', ar: 'شكل هندسي مسطح له ضلعان طويلان وضلعان قصيران و ٤ رؤوس' },
  },
  pentagon: {
    named: { en: 'Pentagon with 5 sides and 5 corners', ar: 'شكل خماسي له ٥ أضلاع و ٥ رؤوس' },
    geometryOnly: { en: 'Flat 2D shape with 5 straight sides and 5 corners', ar: 'شكل هندسي مسطح له ٥ أضلاع مستقيمة و ٥ رؤوس' },
  },
  hexagon: {
    named: { en: 'Hexagon with 6 sides and 6 corners', ar: 'شكل سداسي له ٦ أضلاع و ٦ رؤوس' },
    geometryOnly: { en: 'Flat 2D shape with 6 straight sides and 6 corners', ar: 'شكل هندسي مسطح له ٦ أضلاع مستقيمة و ٦ رؤوس' },
  },
  cube: {
    named: { en: '3D Cube with 6 square faces and 8 vertices', ar: 'مكعب ثلاثي الأبعاد له ٦ أوجه مربعة و ٨ رؤوس' },
    geometryOnly: { en: '3D solid box with 6 equal flat square faces and 8 corners', ar: 'مجسم ثلاثي الأبعاد له ٦ أوجه مربعة مستوية و ٨ رؤوس' },
  },
  cylinder: {
    named: { en: '3D Cylinder with 2 flat circular faces', ar: 'أسطوانة ثلاثية الأبعاد لها وجهان دائريان مستويان' },
    geometryOnly: { en: '3D solid with 2 flat circular faces and a curved side', ar: 'مجسم ثلاثي الأبعاد له وجهان دائريان مستويان وجانب منحني' },
  },
  pyramid: {
    named: { en: '3D Pyramid with 5 faces and 5 vertices', ar: 'هرم ثلاثي الأبعاد له ٥ أوجه و ٥ رؤوس' },
    geometryOnly: { en: '3D solid with a flat base and triangular faces meeting at a top point', ar: 'مجسم ثلاثي الأبعاد له قاعدة مستوية وأوجه مثلثة تلتقي عند قمة واحدة' },
  },
};

export const EgyptShapeSvg: React.FC<{
  shape: ShapeKind;
  size?: number;
  showVertices?: boolean;
  lang?: Language;
  hideName?: boolean;
}> = ({ shape, size = 120, showVertices = false, lang = 'en', hideName = false }) => {
  const vertices: Partial<Record<ShapeKind, [number, number][]>> = {
    triangle: [[60, 18], [102, 96], [18, 96]],
    square: [[24, 24], [96, 24], [96, 96], [24, 96]],
    rectangle: [[16, 32], [104, 32], [104, 88], [16, 88]],
    pentagon: [[60, 14], [104, 46], [88, 100], [32, 100], [16, 46]],
    hexagon: [[60, 14], [100, 37], [100, 83], [60, 106], [20, 83], [20, 37]],
  };

  const shapeAria = hideName
    ? SHAPE_DESCRIPTIONS[shape].geometryOnly[lang]
    : SHAPE_DESCRIPTIONS[shape].named[lang];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={shapeAria}
    >
      {shape === 'triangle' && (
        <polygon points="60,18 102,96 18,96" fill="#F59E0B" stroke="#133C3B" strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {shape === 'square' && (
        <rect x="24" y="24" width="72" height="72" rx="4" fill="#0D9488" stroke="#133C3B" strokeWidth="3.5" />
      )}
      {shape === 'rectangle' && (
        <rect x="16" y="32" width="88" height="56" rx="4" fill="#0EA5E9" stroke="#133C3B" strokeWidth="3.5" />
      )}
      {shape === 'pentagon' && (
        <polygon points="60,14 104,46 88,100 32,100 16,46" fill="#8B5CF6" stroke="#133C3B" strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {shape === 'hexagon' && (
        <polygon points="60,14 100,37 100,83 60,106 20,83 20,37" fill="#E11D48" stroke="#133C3B" strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {shape === 'cube' && (
        <g>
          <polygon points="60,16 98,34 60,52 22,34" fill="#FDE68A" stroke="#133C3B" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="22,34 60,52 60,98 22,80" fill="#F59E0B" stroke="#133C3B" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="98,34 60,52 60,98 98,80" fill="#D97706" stroke="#133C3B" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {shape === 'cylinder' && (
        <g>
          <path d="M30 34V86C30 95 90 95 90 86V34" fill="#0D9488" stroke="#133C3B" strokeWidth="3" />
          <ellipse cx="60" cy="34" rx="30" ry="11" fill="#5EEAD4" stroke="#133C3B" strokeWidth="3" />
        </g>
      )}
      {shape === 'pyramid' && (
        <g>
          <polygon points="60,16 20,86 64,98" fill="#FBBF24" stroke="#133C3B" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="60,16 64,98 100,82" fill="#D97706" stroke="#133C3B" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {showVertices &&
        vertices[shape]?.map(([vx, vy], idx) => (
          <circle key={idx} cx={vx} cy={vy} r="6" fill="#FFFDF7" stroke="#133C3B" strokeWidth="2.5" />
        ))}
    </svg>
  );
};

export const EgyptStickerSvg: React.FC<{
  stickerId: StickerId;
  unlocked?: boolean;
  size?: number;
}> = ({ stickerId, unlocked = true, size = 84 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={unlocked ? '' : 'opacity-40 grayscale'}
    >
      <circle cx="48" cy="48" r="42" fill={unlocked ? '#FFFDF7' : '#E2E8F0'} stroke="#133C3B" strokeWidth="3" />
      <circle
        cx="48"
        cy="48"
        r="35"
        fill={unlocked ? '#FEF3C7' : '#CBD5E1'}
        stroke={unlocked ? '#D97706' : '#94A3B8'}
        strokeWidth="2.5"
        strokeDasharray="5 4"
      />

      {stickerId === 'bazaar_scarab' && (
        <g>
          <ellipse cx="48" cy="52" rx="14" ry="18" fill="#0D9488" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M48 34V70" stroke="#133C3B" strokeWidth="2" />
          <circle cx="48" cy="31" r="7" fill="#14B8A6" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M34 44L24 38M33 54L22 54M35 64L25 70M62 44L72 38M63 54L74 54M61 64L71 70" stroke="#133C3B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {stickerId === 'egypt_pound_chest' && (
        <g>
          <rect x="26" y="42" width="44" height="26" rx="4" fill="#B45309" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M26 42C26 30 70 30 70 42" fill="#D97706" stroke="#133C3B" strokeWidth="2.5" />
          <rect x="44" y="42" width="8" height="10" rx="2" fill="#FDE047" stroke="#133C3B" strokeWidth="2" />
          <circle cx="38" cy="34" r="5" fill="#FBBF24" stroke="#133C3B" strokeWidth="1.8" />
          <circle cx="58" cy="34" r="5" fill="#FBBF24" stroke="#133C3B" strokeWidth="1.8" />
        </g>
      )}

      {stickerId === 'khan_lantern' && (
        <g>
          <path d="M48 18V24" stroke="#133C3B" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="48,24 62,36 34,36" fill="#D97706" stroke="#133C3B" strokeWidth="2.2" />
          <polygon points="34,36 62,36 58,64 38,64" fill="#FDE047" stroke="#133C3B" strokeWidth="2.2" />
          <polygon points="38,64 58,64 62,72 34,72" fill="#B45309" stroke="#133C3B" strokeWidth="2.2" />
          <circle cx="48" cy="50" r="6" fill="#F59E0B" />
        </g>
      )}

      {stickerId === 'nile_felucca' && (
        <g>
          <path d="M48 22L68 56H48V22Z" fill="#FFFDF7" stroke="#133C3B" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M24 58H72L64 70H32L24 58Z" fill="#B45309" stroke="#133C3B" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M22 72C32 68 42 68 52 72C62 76 70 74 76 70" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {stickerId === 'palm_abacus' && (
        <g>
          <rect x="26" y="28" width="44" height="40" rx="4" fill="#FFFDF7" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M26 40H70M26 54H70" stroke="#133C3B" strokeWidth="2" />
          <circle cx="36" cy="40" r="4.5" fill="#E11D48" stroke="#133C3B" strokeWidth="1.5" />
          <circle cx="46" cy="40" r="4.5" fill="#E11D48" stroke="#133C3B" strokeWidth="1.5" />
          <circle cx="38" cy="54" r="4.5" fill="#0D9488" stroke="#133C3B" strokeWidth="1.5" />
          <circle cx="56" cy="54" r="4.5" fill="#0D9488" stroke="#133C3B" strokeWidth="1.5" />
        </g>
      )}

      {stickerId === 'golden_array' && (
        <g>
          {[32, 48, 64].map((x) =>
            [36, 50, 64].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="#F59E0B" stroke="#133C3B" strokeWidth="1.8" />
            ))
          )}
        </g>
      )}

      {stickerId === 'sundial_badge' && (
        <g>
          <circle cx="48" cy="50" r="21" fill="#FBBF24" stroke="#133C3B" strokeWidth="2.5" />
          <polygon points="48,34 58,56 48,52" fill="#B45309" stroke="#133C3B" strokeWidth="2" />
        </g>
      )}

      {stickerId === 'oasis_clock' && (
        <g>
          <circle cx="48" cy="48" r="22" fill="#FFFDF7" stroke="#133C3B" strokeWidth="2.8" />
          <line x1="48" y1="48" x2="48" y2="33" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="48" x2="60" y2="48" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="48" cy="48" r="3.5" fill="#F59E0B" />
        </g>
      )}

      {stickerId === 'calendar_moon' && (
        <g>
          <rect x="26" y="28" width="44" height="40" rx="6" fill="#FFFDF7" stroke="#133C3B" strokeWidth="2.5" />
          <rect x="26" y="28" width="44" height="12" rx="4" fill="#0D9488" stroke="#133C3B" strokeWidth="2.5" />
          <path d="M52 46C46 46 42 50 42 55C42 60 46 64 52 64C48 62 47 58 47 55C47 51 49 48 52 46Z" fill="#F59E0B" stroke="#133C3B" strokeWidth="1.8" />
        </g>
      )}

      {stickerId === 'papyrus_ruler' && (
        <g>
          <rect x="20" y="38" width="56" height="20" rx="4" fill="#FDE68A" stroke="#133C3B" strokeWidth="2.5" />
          {[28, 36, 44, 52, 60, 68].map((x) => (
            <line key={x} x1={x} y1="38" x2={x} y2="46" stroke="#133C3B" strokeWidth="2" />
          ))}
        </g>
      )}

      {stickerId === 'nile_amphora' && (
        <g>
          <path d="M40 24H56L54 33C64 38 66 56 58 68H38C30 56 32 38 42 33L40 24Z" fill="#0EA5E9" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M36 52C42 49 54 49 60 52" stroke="#FFFDF7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {stickerId === 'pyramid_prism' && (
        <g>
          <polygon points="48,22 22,68 50,74" fill="#FBBF24" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="48,22 50,74 74,64" fill="#D97706" stroke="#133C3B" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};
