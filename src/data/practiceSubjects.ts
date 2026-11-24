import { BilingualText, SubjectId, WorldId } from '../types/game';
import { buildNumberOptions, nextRandom, pickOne, randInt, shuffle } from './egyptLevels';
import { getCombinedSeenSignatures, recordSeenQuestionSignatures } from '../utils/questionHistory';

export interface PracticeCheckItem {
  id: string;
  prompt: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

export interface PracticeSubjectInfo {
  id: SubjectId;
  order: string;
  worldId: WorldId;
  linkedLevelId: string;
  categoryLabel: BilingualText;
  title: BilingualText;
  shortTitle: BilingualText;
  summary: BilingualText;
  termTag: BilingualText;
  accentColor: string;
  surfaceTint: string;
  keyRules: BilingualText[];
}

export const PRACTICE_SUBJECTS: PracticeSubjectInfo[] = [
  {
    id: 'place_value',
    order: '01',
    worldId: 'bazaar',
    linkedLevelId: 'place_value-1',
    categoryLabel: { en: 'Numbers & Place Value', ar: 'الأعداد والقيمة المكانية' },
    title: { en: 'Place Value & Comparing', ar: 'القيمة المكانية والمقارنة' },
    shortTitle: { en: 'Place Value', ar: 'القيمة المكانية' },
    summary: {
      en: 'Build 3-digit numbers with Hundreds, Tens, and Ones blocks and compare values step by step.',
      ar: 'كوّن أعدادًا من ٣ أرقام بمكعبات المئات والعشرات والآحاد وقارن بينها خطوة بخطوة.',
    },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    accentColor: '#C2410C',
    surfaceTint: '#FFF7ED',
    keyRules: [
      {
        en: 'Every digit has a value based on its place: 100s on the left, 10s in the middle, 1s on the right.',
        ar: 'لكل رقم قيمة حسب خانته: المئات يسارًا، العشرات في الوسط، والآحاد يمينًا.',
      },
      {
        en: 'Expanded form breaks a number apart: 345 = 300 + 40 + 5.',
        ar: 'الصيغة الممتدة تفكك العدد: ٣٤٥ = ٣٠٠ + ٤٠ + ٥.',
      },
      {
        en: 'To compare two 3-digit numbers, check Hundreds first. If equal, check Tens, then Ones.',
        ar: 'لمقارنة عددين من ٣ أرقام، قارن المئات أولاً؛ وإن تساوت قارن العشرات ثم الآحاد.',
      },
    ],
  },
  {
    id: 'money',
    order: '02',
    worldId: 'bazaar',
    linkedLevelId: 'money-1',
    categoryLabel: { en: 'Egyptian Currency', ar: 'النقود المصرية' },
    title: { en: 'Egyptian Money & Change (LE)', ar: 'الجنيهات المصرية وحساب الباقي' },
    shortTitle: { en: 'Money (LE)', ar: 'الجنيهات (ج.م)' },
    summary: {
      en: 'Combine 1, 5, 10, 20, 50, and 100 LE banknotes to pay exact prices and calculate change.',
      ar: 'اجمع فئات ١ و ٥ و ١٠ و ٢٠ و ٥٠ و ١٠٠ ج.م لتكوين الأسعار وحساب الباقي بدقة.',
    },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    accentColor: '#D97706',
    surfaceTint: '#FEFCE8',
    keyRules: [
      {
        en: 'Start with the largest banknote that fits inside the target price, then add smaller notes.',
        ar: 'ابدأ بأكبر ورقة نقدية تناسب السعر المطلوب، ثم أضف الفئات الأصغر.',
      },
      {
        en: 'Different combinations make the same amount: 20 LE = 10 + 10 LE or 10 + 5 + 5 LE.',
        ar: 'يمكن تكوين نفس المبلغ بطرق متعددة: ٢٠ ج.م = ١٠ + ١٠ ج.م أو ١٠ + ٥ + ٥ ج.م.',
      },
      {
        en: 'Change = Money Paid − Item Price.',
        ar: 'الباقي = المبلغ المدفوع − سعر السلعة.',
      },
    ],
  },
  {
    id: 'vertical_math',
    order: '03',
    worldId: 'nile',
    linkedLevelId: 'vertical_math-1',
    categoryLabel: { en: 'Addition & Subtraction', ar: 'الجمع والطرح' },
    title: { en: 'Addition & Subtraction (Regrouping)', ar: 'الجمع والطرح وإعادة التجميع' },
    shortTitle: { en: 'Add & Sub', ar: 'الجمع والطرح' },
    summary: {
      en: 'Walk column-by-column through Ones, Tens, and Hundreds to master carrying and borrowing.',
      ar: 'تدرّج خانة تلو الأخرى في الآحاد والعشرات والمئات لتتقن الحمل والاستلاف.',
    },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
    keyRules: [
      {
        en: 'Always start on the right in the Ones column, then move left to Tens and Hundreds.',
        ar: 'ابدأ دائمًا من اليمين في خانة الآحاد، ثم انتقل إلى العشرات فالمئات.',
      },
      {
        en: 'Carry: When a column sums to 10 or more, write the ones digit and carry 1 to the next column.',
        ar: 'الحمل: إذا بلغ مجموع الخانة ١٠ أو أكثر نكتب الآحاد ونحمل ١ للخانة التالية.',
      },
      {
        en: 'Borrow: When the top digit is smaller, borrow 1 (= 10) from the column to the left.',
        ar: 'الاستلاف: إذا كان الرقم العلوي أصغر نستلف ١ (= ١٠) من الخانة المجاورة.',
      },
    ],
  },
  {
    id: 'arrays',
    order: '04',
    worldId: 'nile',
    linkedLevelId: 'arrays-1',
    categoryLabel: { en: 'Multiplication Foundations', ar: 'أساسيات الضرب' },
    title: { en: 'Arrays & Repeated Addition', ar: 'المصفوفات والجمع المتكرر' },
    shortTitle: { en: 'Arrays', ar: 'المصفوفات' },
    summary: {
      en: 'Build row-and-column grids to connect repeated addition with multiplication facts.',
      ar: 'كوّن شبكات صفوف وأعمدة تفاعلية لتربط بين الجمع المتكرر وجدول الضرب.',
    },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    accentColor: '#0D9488',
    surfaceTint: '#ECFEFF',
    keyRules: [
      {
        en: 'Rows go across horizontally. Columns go up and down vertically.',
        ar: 'الصفوف تمتد أفقيًا، والأعمدة تمتد رأسيًا.',
      },
      {
        en: '3 rows of 4 equals 4 + 4 + 4 = 12, written as 3 × 4 = 12.',
        ar: '٣ صفوف في كل صف ٤ تساوي ٤ + ٤ + ٤ = ١٢ وتُكتب ٣ × ٤ = ١٢.',
      },
      {
        en: 'Counting by rows or by columns always gives the exact same total.',
        ar: 'العد بالصفوف أو بالأعمدة يعطي دائمًا نفس الناتج تمامًا.',
      },
    ],
  },
  {
    id: 'clock',
    order: '05',
    worldId: 'clock',
    linkedLevelId: 'clock-1',
    categoryLabel: { en: 'Time & Clocks', ar: 'الوقت والساعة' },
    title: { en: 'Telling Time (Analog & Digital)', ar: 'قراءة وضبط الساعة' },
    shortTitle: { en: 'Clocks', ar: 'الساعة' },
    summary: {
      en: "Spin the hour and minute hands to master o'clock, half-past, quarters, and 5-minute steps.",
      ar: 'حرّك عقربي الساعات والدقائق لتتقن تمام الساعة والنصف والربع ومضاعفات ٥ دقائق.',
    },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    accentColor: '#1D4ED8',
    surfaceTint: '#EFF6FF',
    keyRules: [
      {
        en: 'Short red hand = Hour. Long teal hand = Minutes.',
        ar: 'العقرب الأحمر القصير = الساعات، والعقرب الطويل = الدقائق.',
      },
      {
        en: 'Count by 5s around the dial: 12 = :00, 3 = :15 (quarter past), 6 = :30 (half past), 9 = :45.',
        ar: 'عدّ بالخمسات حول الساعة: ١٢ = تمامًا، ٣ = وربع (:١٥)، ٦ = ونصف (:٣٠)، ٩ = إلا ربع (:٤٥).',
      },
      {
        en: 'AM is morning (midnight to noon); PM is afternoon and evening.',
        ar: 'صباحًا (AM) قبل الظهر، ومساءً (PM) بعد الظهر وحتى المساء.',
      },
    ],
  },
  {
    id: 'calendar',
    order: '06',
    worldId: 'clock',
    linkedLevelId: 'calendar-1',
    categoryLabel: { en: 'Duration & Dates', ar: 'المدة والتقويم' },
    title: { en: 'Elapsed Time & Calendar', ar: 'الوقت المنقضي والتقويم' },
    shortTitle: { en: 'Calendar', ar: 'التقويم والمدة' },
    summary: {
      en: 'Jump forward along a timeline to measure durations and explore the 7 weekdays and 12 months.',
      ar: 'احسب المدة الزمنية على خط الوقت وتعرّف على أيام الأسبوع السبعة وشهور السنة.',
    },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    accentColor: '#4338CA',
    surfaceTint: '#EEF2FF',
    keyRules: [
      {
        en: '1 hour = 60 minutes. Add whole hours first, then remaining minutes.',
        ar: '١ ساعة = ٦٠ دقيقة. اجمع الساعات الكاملة أولاً ثم الدقائق المتبقية.',
      },
      {
        en: 'There are 7 days in 1 week and 12 months in 1 full year.',
        ar: 'في الأسبوع الواحد ٧ أيام، وفي السنة الكاملة ١٢ شهرًا.',
      },
      {
        en: 'To find the day after N days, step forward around the 7-day cycle.',
        ar: 'لمعرفة اليوم بعد عدة أيام، عدّ للأمام على دائرة أيام الأسبوع.',
      },
    ],
  },
  {
    id: 'length',
    order: '07',
    worldId: 'workshop',
    linkedLevelId: 'length-1',
    categoryLabel: { en: 'Length Measurement', ar: 'قياس الأطوال' },
    title: { en: 'Measuring Length (cm / m)', ar: 'قياس الطول (سم / م)' },
    shortTitle: { en: 'Length', ar: 'الطول' },
    summary: {
      en: 'Slide objects along a centimeter ruler—including non-zero starting marks—to master End − Start.',
      ar: 'حرّك الأجسام على مسطرة السنتيمتر من الصفر أو من أي نقطة لتتقن قاعدة النهاية − البداية.',
    },
    termTag: { en: 'Term 1', ar: 'الفصل ١' },
    accentColor: '#15803D',
    surfaceTint: '#F0FDF4',
    keyRules: [
      {
        en: '1 meter (m) = 100 centimeters (cm). Use cm for pencils/books and m for rooms/trees.',
        ar: '١ متر = ١٠٠ سم. نستخدم السنتيمتر للأشياء الصغيرة والمتر للغرف والأشجار.',
      },
      {
        en: 'When an object starts at 0 cm, its length equals the mark at its right end.',
        ar: 'عندما يبدأ الجسم عند ٠ سم يكون طوله هو الرقم عند نهايته.',
      },
      {
        en: 'When an object does not start at 0, subtract: Length = End Mark − Start Mark.',
        ar: 'إذا لم يبدأ الجسم عند الصفر نطرح: الطول = رقم النهاية − رقم البداية.',
      },
    ],
  },
  {
    id: 'capacity',
    order: '08',
    worldId: 'workshop',
    linkedLevelId: 'capacity-1',
    categoryLabel: { en: 'Liquid Volume', ar: 'سعة السوائل' },
    title: { en: 'Liquid Capacity (L / mL)', ar: 'سعة السوائل (لتر / مل)' },
    shortTitle: { en: 'Capacity', ar: 'السعة' },
    summary: {
      en: 'Pour scoops of water into a 1-Liter graduated jug to see how milliliters add up to 1000 mL.',
      ar: 'اسكب مغارف الماء في دورق سعة ١ لتر لترى كيف تتجمع الملليلترات لتصل إلى ١٠٠٠ مل.',
    },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    accentColor: '#0284C7',
    surfaceTint: '#F0F9FF',
    keyRules: [
      {
        en: '1 full Liter (L) = 1000 milliliters (mL).',
        ar: '١ لتر كامل = ١٠٠٠ ملليلتر (مل).',
      },
      {
        en: 'Half a liter = 500 mL, and a quarter liter = 250 mL.',
        ar: 'نصف اللتر = ٥٠٠ مل، وربع اللتر = ٢٥٠ مل.',
      },
      {
        en: 'Use Liters for bottles and jugs; use milliliters for spoons and small cups.',
        ar: 'نستخدم اللتر للزجاجات الكبيرة والملليلتر للملاعق والأكواب الصغيرة.',
      },
    ],
  },
  {
    id: 'mass',
    order: '09',
    worldId: 'workshop',
    linkedLevelId: 'mass-1',
    categoryLabel: { en: 'Weight & Balance', ar: 'الكتلة والميزان' },
    title: { en: 'Mass & Balance Scales (g / kg)', ar: 'الكتلة والميزان (جم / كجم)' },
    shortTitle: { en: 'Mass (g/kg)', ar: 'الكتلة' },
    summary: {
      en: 'Place gram and kilogram weights on a tilting balance scale to compare light and heavy masses.',
      ar: 'ضع أوزان الجرام والكيلوجرام على كفتي الميزان لترى التوازن وتقارن الأثقل والأخف.',
    },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    accentColor: '#B45309',
    surfaceTint: '#FFFBEB',
    keyRules: [
      {
        en: '1 kilogram (kg) = 1000 grams (g).',
        ar: '١ كيلوجرام (كجم) = ١٠٠٠ جرام (جم).',
      },
      {
        en: 'Two 500 g weights balance 1 kg (500 g + 500 g = 1000 g).',
        ar: 'وزنان من ٥٠٠ جم يساويان ١ كجم (٥٠٠ + ٥٠٠ = ١٠٠٠ جم).',
      },
      {
        en: 'On a balance scale, the heavier pan tilts downward and equal weights stay level.',
        ar: 'على الميزان، تميل الكفة الأثقل للأسفل وتستوي الكفتان عند التساوي.',
      },
    ],
  },
  {
    id: 'shapes',
    order: '10',
    worldId: 'workshop',
    linkedLevelId: 'shapes-1',
    categoryLabel: { en: 'Geometry', ar: 'الهندسة' },
    title: { en: '2D & 3D Shapes', ar: 'الأشكال الهندسية والمجسمات' },
    shortTitle: { en: 'Shapes', ar: 'الأشكال' },
    summary: {
      en: 'Inspect flat 2D polygons and solid 3D shapes to count sides, corners (vertices), and faces.',
      ar: 'استكشف الأشكال المسطحة والمجسمات ثلاثية الأبعاد لتعد الأضلاع والرؤوس والأوجه.',
    },
    termTag: { en: 'Term 1', ar: 'الفصل ١' },
    accentColor: '#7C3AED',
    surfaceTint: '#F5F3FF',
    keyRules: [
      {
        en: '2D shapes are flat: Triangle (3), Square/Rectangle (4), Pentagon (5), Hexagon (6) sides.',
        ar: 'الأشكال المسطحة: المثلث (٣)، المربع والمستطيل (٤)، الخماسي (٥)، السداسي (٦ أضلاع).',
      },
      {
        en: 'Vertices are the sharp corners where two sides meet.',
        ar: 'الرؤوس هي الزوايا التي يلتقي عندها ضلعان.',
      },
      {
        en: '3D solids have flat faces: a Cube has 6 square faces, a Pyramid has 5 faces, a Cylinder has 2 circular faces.',
        ar: 'المجسمات لها أوجه: المكعب له ٦ أوجه مربعة، والهرم ٥ أوجه، والأسطوانة وجهان دائريان.',
      },
    ],
  },
  {
    id: 'fractions',
    order: '11',
    worldId: 'workshop',
    linkedLevelId: 'fractions-1',
    categoryLabel: { en: 'Fractions', ar: 'الكسور' },
    title: { en: 'Fractions & Equal Parts', ar: 'الكسور والأجزاء المتساوية' },
    shortTitle: { en: 'Fractions', ar: 'الكسور' },
    summary: {
      en: 'Divide a circle into equal slices from halves to eighths and shade parts to build any fraction.',
      ar: 'قسّم الدائرة إلى أجزاء متساوية من النصف حتى الأثمان ولوّن الأجزاء لتفهم البسط والمقام.',
    },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
    keyRules: [
      {
        en: 'A fraction only works when every part is the exact same size (equal parts).',
        ar: 'الكسور تعبّر دائمًا عن أجزاء متساوية تمامًا في الحجم.',
      },
      {
        en: 'Top number (numerator) = shaded parts. Bottom number (denominator) = total equal parts.',
        ar: 'الرقم العلوي (البسط) = الأجزاء المظللة، والرقم السفلي (المقام) = كل الأجزاء المتساوية.',
      },
      {
        en: 'When all parts are shaded (e.g., 4/4), the fraction equals 1 Whole.',
        ar: 'عند تظليل جميع الأجزاء (مثل ٤/٤) يساوي الكسر ١ صحيحًا.',
      },
    ],
  },
  {
    id: 'graphs',
    order: '12',
    worldId: 'workshop',
    linkedLevelId: 'graphs-1',
    categoryLabel: { en: 'Data & Charts', ar: 'البيانات والرسوم' },
    title: { en: 'Bar Graphs & Data', ar: 'التمثيل البياني بالأعمدة' },
    shortTitle: { en: 'Bar Graphs', ar: 'الرسم البياني' },
    summary: {
      en: 'Raise and lower live fruit bars to see how totals, differences, and comparisons change immediately.',
      ar: 'غيّر ارتفاع أعمدة الفاكهة مباشرة لتفهم كيف يُحسب الإجمالي والفرق والأكثر والأقل.',
    },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    accentColor: '#BE123C',
    surfaceTint: '#FFF1F2',
    keyRules: [
      {
        en: 'Taller bars mean a larger number; shorter bars mean a smaller number.',
        ar: 'العمود الأطول يعني عددًا أكبر، والعمود الأقصر يعني عددًا أصغر.',
      },
      {
        en: 'To find "altogether" or "total", add the values of all bars.',
        ar: 'لمعرفة "الإجمالي معًا" نجمع أعداد كل الأعمدة.',
      },
      {
        en: 'To find "how many more" or "difference", subtract the smaller bar from the larger bar.',
        ar: 'لمعرفة "بكم يزيد" نطرح العمود الأصغر من العمود الأكبر.',
      },
    ],
  },
];

export function getSubjectById(id: SubjectId): PracticeSubjectInfo {
  return PRACTICE_SUBJECTS.find((s) => s.id === id) ?? PRACTICE_SUBJECTS[0];
}

/* ============================================================================
   PROCEDURAL AUTO-GENERATED PRACTICE QUICK CHECKS (FRESH NUMBERS EVERY CLICK)
   ============================================================================ */
const WEEKDAYS_QC: BilingualText[] = [
  { en: 'Saturday', ar: 'السبت' },
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الاثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
  { en: 'Friday', ar: 'الجمعة' },
];

export function generatePracticeQuickCheck(subjectId: SubjectId): PracticeCheckItem {
  const seen = getCombinedSeenSignatures();
  let chosen = generatePracticeQuickCheckOnce(subjectId);
  let tries = 0;
  while (seen.has(`qc:${subjectId}:${chosen.prompt.en}`) && tries < 30) {
    chosen = generatePracticeQuickCheckOnce(subjectId);
    tries++;
  }
  recordSeenQuestionSignatures([`qc:${subjectId}:${chosen.prompt.en}`]);
  return chosen;
}

function generatePracticeQuickCheckOnce(subjectId: SubjectId): PracticeCheckItem {
  const qid = `qc-${subjectId}-${Date.now().toString(36)}-${Math.floor(nextRandom() * 1e6).toString(36)}`;

  switch (subjectId) {
    case 'place_value': {
      if (nextRandom() < 0.55) {
        const h = randInt(1, 9);
        let t = randInt(1, 9);
        while (t === h) t = randInt(1, 9);
        let o = randInt(1, 9);
        while (o === h || o === t) o = randInt(1, 9);
        const num = h * 100 + t * 10 + o;
        const askPlace = pickOne(['h', 't', 'o'] as const);
        const digit = askPlace === 'h' ? h : askPlace === 't' ? t : o;
        const ansVal = askPlace === 'h' ? h * 100 : askPlace === 't' ? t * 10 : o;
        const rawOpts = shuffle([digit, digit * 10, digit * 100]);
        const correctIndex = rawOpts.indexOf(ansVal);
        const placeNameEn = askPlace === 'h' ? 'Hundreds' : askPlace === 't' ? 'Tens' : 'Ones';
        const placeNameAr = askPlace === 'h' ? 'المئات' : askPlace === 't' ? 'العشرات' : 'الآحاد';

        return {
          id: qid,
          prompt: {
            en: `What is the value of the digit ${digit} in ${num}?`,
            ar: `ما قيمة الرقم ${digit} في العدد ${num}؟`,
          },
          options: rawOpts.map((v) => ({ en: `${v}`, ar: `${v}` })),
          correctIndex,
          explanation: {
            en: `${digit} is in the ${placeNameEn} place, so its value is ${ansVal}.`,
            ar: `الرقم ${digit} في خانة ${placeNameAr}، إذن قيمته ${ansVal}.`,
          },
        };
      }
      const h = randInt(2, 8);
      const t1 = randInt(1, 8);
      let t2 = randInt(1, 8);
      if (t2 === t1) t2 = (t1 % 8) + 1;
      const left = h * 100 + t1 * 10 + randInt(1, 9);
      const right = h * 100 + t2 * 10 + randInt(1, 9);
      const ansIdx = left < right ? 0 : left === right ? 1 : 2;
      return {
        id: qid,
        prompt: {
          en: `Which symbol makes ${left} ___ ${right} true?`,
          ar: `أي علامة تجعل المقارنة ${left} ___ ${right} صحيحة؟`,
        },
        options: [
          { en: '< (Less than)', ar: '< (أصغر من)' },
          { en: '= (Equal)', ar: '= (يساوي)' },
          { en: '> (Greater than)', ar: '> (أكبر من)' },
        ],
        correctIndex: ansIdx,
        explanation: {
          en: `Both have ${h} Hundreds, so compare Tens: ${t1} ${left < right ? '<' : '>'} ${t2}.`,
          ar: `المئات متساوية (${h})، فنقارن العشرات: ${t1} ${left < right ? '<' : '>'} ${t2}.`,
        },
      };
    }

    case 'money': {
      if (nextRandom() < 0.5) {
        const n1 = pickOne([50, 100]);
        const n2 = pickOne([10, 20]);
        const n3 = pickOne([1, 5]);
        const total = n1 + n2 + n3;
        const opts = buildNumberOptions(total, [-10, -5, 5, 10], 10).slice(0, 3);
        if (!opts.includes(total)) opts[0] = total;
        const shuf = shuffle(opts);
        return {
          id: qid,
          prompt: {
            en: `You have ${n1} LE + ${n2} LE + ${n3} LE. How much money in total?`,
            ar: `معك ورقة ${n1} ج.م وورقة ${n2} ج.م وورقة ${n3} ج.م. كم المجموع؟`,
          },
          options: shuf.map((v) => ({ en: `${v} LE`, ar: `${v} ج.م` })),
          correctIndex: shuf.indexOf(total),
          explanation: {
            en: `${n1} + ${n2} = ${n1 + n2}, and ${n1 + n2} + ${n3} = ${total} LE.`,
            ar: `${n1} + ${n2} = ${n1 + n2}، ثم + ${n3} = ${total} ج.م.`,
          },
        };
      }
      const paid = pickOne([50, 100]);
      const price = paid === 50 ? randInt(15, 42) : randInt(25, 85);
      const change = paid - price;
      const shuf = shuffle([change, change + 10, Math.max(1, change - 5)]);
      return {
        id: qid,
        prompt: {
          en: `An item costs ${price} LE and you pay ${paid} LE. What is your change?`,
          ar: `سعر السلعة ${price} ج.م ودفعت ${paid} ج.م. كم الباقي؟`,
        },
        options: shuf.map((v) => ({ en: `${v} LE`, ar: `${v} ج.م` })),
        correctIndex: shuf.indexOf(change),
        explanation: {
          en: `Change = ${paid} − ${price} = ${change} LE.`,
          ar: `الباقي = ${paid} − ${price} = ${change} ج.م.`,
        },
      };
    }

    case 'vertical_math': {
      const isAdd = nextRandom() < 0.5;
      if (isAdd) {
        const o1 = randInt(5, 9);
        const o2 = randInt(10 - o1, 9);
        const a = randInt(2, 5) * 10 + o1;
        const b = randInt(1, 3) * 10 + o2;
        const ans = a + b;
        const shuf = shuffle([ans, ans - 10, ans + 10]);
        return {
          id: qid,
          prompt: {
            en: `Solve with regrouping: ${a} + ${b} = ?`,
            ar: `اجمع مع إعادة التجميع: ${a} + ${b} = ؟`,
          },
          options: shuf.map((v) => ({ en: `${v}`, ar: `${v}` })),
          correctIndex: shuf.indexOf(ans),
          explanation: {
            en: `Ones: ${o1} + ${o2} = ${o1 + o2} (write ${(o1 + o2) % 10}, carry 1). Tens: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(ans / 10)} → ${ans}.`,
            ar: `الآحاد: ${o1} + ${o2} = ${o1 + o2} (نكتب ${(o1 + o2) % 10} ونحمل ١). العشرات مع الحمل تعطي ${ans}.`,
          },
        };
      }
      const o1 = randInt(1, 4);
      const o2 = randInt(o1 + 2, 9);
      const a = randInt(5, 8) * 10 + o1;
      const b = randInt(1, 3) * 10 + o2;
      const ans = a - b;
      const shuf = shuffle([ans, ans + 10, Math.max(1, ans - 10)]);
      return {
        id: qid,
        prompt: {
          en: `Solve by borrowing: ${a} − ${b} = ?`,
          ar: `اطرح بالاستلاف: ${a} − ${b} = ؟`,
        },
        options: shuf.map((v) => ({ en: `${v}`, ar: `${v}` })),
        correctIndex: shuf.indexOf(ans),
        explanation: {
          en: `Borrow 1 Ten so ${o1} becomes ${o1 + 10}: ${o1 + 10} − ${o2} = ${o1 + 10 - o2}, then subtract Tens → ${ans}.`,
          ar: `نستلف ١ عشرة لتصبح الآحاد ${o1 + 10}: ${o1 + 10} − ${o2} = ${o1 + 10 - o2}، والناتج ${ans}.`,
        },
      };
    }

    case 'arrays': {
      const r = randInt(2, 6);
      const c = randInt(2, 6);
      const total = r * c;
      const shuf = shuffle([total, r + c, total + c]);
      return {
        id: qid,
        prompt: {
          en: `An array has ${r} rows with ${c} dates in each row. How many dates in all?`,
          ar: `مصفوفة بها ${r} صفوف في كل صف ${c} تمرات. كم إجمالي التمرات؟`,
        },
        options: shuf.map((v) => ({ en: `${v}`, ar: `${v}` })),
        correctIndex: shuf.indexOf(total),
        explanation: {
          en: `${r} rows of ${c} = ${Array(r).fill(c).join(' + ')} = ${total} (${r} × ${c}).`,
          ar: `${r} صفوف من ${c} = ${Array(r).fill(c).join(' + ')} = ${total}.`,
        },
      };
    }

    case 'clock': {
      const dialNum = pickOne([3, 6, 9, 12, 2, 4, 8, 10]);
      const mins = dialNum === 12 ? 0 : dialNum * 5;
      const wrong1 = (mins + 15) % 60;
      const wrong2 = (mins + 30) % 60;
      const shuf = shuffle([mins, wrong1, wrong2]);
      return {
        id: qid,
        prompt: {
          en: `When the long minute hand points to ${dialNum}, how many minutes past the hour is it?`,
          ar: `عندما يشير عقرب الدقائق الطويل إلى الرقم ${dialNum}، كم دقيقة مضت من الساعة؟`,
        },
        options: shuf.map((m) => ({
          en: m === 0 ? '00 minutes (O’clock)' : `${m} minutes`,
          ar: m === 0 ? '٠٠ دقيقة (تمام الساعة)' : `${m} دقيقة`,
        })),
        correctIndex: shuf.indexOf(mins),
        explanation: {
          en:
            mins === 0
              ? '12 at the top always means :00 (o’clock)!'
              : `Count by 5s from 12 to ${dialNum}: ${dialNum} × 5 = ${mins} minutes.`,
          ar:
            mins === 0
              ? 'الرقم ١٢ في الأعلى يعني دائمًا تمام الساعة (:٠٠).'
              : `بالعد بالخمسات حتى ${dialNum}: ${dialNum} × ٥ = ${mins} دقيقة.`,
        },
      };
    }

    case 'calendar': {
      const startIdx = randInt(0, 6);
      const jump = randInt(2, 5);
      const targetIdx = (startIdx + jump) % 7;
      const wrong1 = (targetIdx + 1) % 7;
      const wrong2 = (targetIdx + 6) % 7;
      const shuf = shuffle([targetIdx, wrong1, wrong2]);
      return {
        id: qid,
        prompt: {
          en: `If today is ${WEEKDAYS_QC[startIdx].en}, what day is ${jump} days later?`,
          ar: `إذا كان اليوم ${WEEKDAYS_QC[startIdx].ar}، فما اليوم بعد ${jump} أيام؟`,
        },
        options: shuf.map((idx) => WEEKDAYS_QC[idx]),
        correctIndex: shuf.indexOf(targetIdx),
        explanation: {
          en: `Counting ${jump} days forward from ${WEEKDAYS_QC[startIdx].en} lands on ${WEEKDAYS_QC[targetIdx].en}.`,
          ar: `بالعد ${jump} أيام للأمام بعد ${WEEKDAYS_QC[startIdx].ar} نصل إلى ${WEEKDAYS_QC[targetIdx].ar}.`,
        },
      };
    }

    case 'length': {
      const start = randInt(1, 4);
      const len = randInt(4, 9);
      const end = start + len;
      const shuf = shuffle([len, end, end + start]);
      return {
        id: qid,
        prompt: {
          en: `A brush starts at ${start} cm on a ruler and ends at ${end} cm. How long is it?`,
          ar: `تبدأ فرشاة عند ${start} سم على المسطرة وتنتهي عند ${end} سم. كم طولها؟`,
        },
        options: shuf.map((v) => ({ en: `${v} cm`, ar: `${v} سم` })),
        correctIndex: shuf.indexOf(len),
        explanation: {
          en: `Subtract Start from End: ${end} − ${start} = ${len} cm.`,
          ar: `نطرح البداية من النهاية: ${end} − ${start} = ${len} سم.`,
        },
      };
    }

    case 'capacity': {
      const poured = pickOne([200, 250, 300, 400, 600, 750]);
      const needed = 1000 - poured;
      const shuf = shuffle([needed, Math.max(50, needed - 100), needed + 100]);
      return {
        id: qid,
        prompt: {
          en: `A 1 Liter (1000 mL) jug has ${poured} mL of water. How many more mL to fill it?`,
          ar: `دورق سعة ١ لتر (١٠٠٠ مل) به ${poured} مل. كم ملليلترًا نحتاج ليمتلئ تمامًا؟`,
        },
        options: shuf.map((v) => ({ en: `${v} mL`, ar: `${v} مل` })),
        correctIndex: shuf.indexOf(needed),
        explanation: {
          en: `1 Liter = 1000 mL, so 1000 − ${poured} = ${needed} mL.`,
          ar: `١ لتر = ١٠٠٠ مل، إذن ١٠٠٠ − ${poured} = ${needed} مل.`,
        },
      };
    }

    case 'mass': {
      const partA = pickOne([200, 300, 350, 400, 500, 650, 700]);
      const needed = 1000 - partA;
      const shuf = shuffle([needed, needed + 100, Math.max(50, needed - 100)]);
      return {
        id: qid,
        prompt: {
          en: `One pan has 1 kg. The other pan has ${partA} g. How many more grams balance the scale?`,
          ar: `في كفة ١ كجم وفي الكفة الأخرى ${partA} جم. كم جرامًا نضيف ليتوازن الميزان؟`,
        },
        options: shuf.map((v) => ({ en: `${v} g`, ar: `${v} جم` })),
        correctIndex: shuf.indexOf(needed),
        explanation: {
          en: `1 kg = 1000 g, so 1000 − ${partA} = ${needed} g.`,
          ar: `١ كجم = ١٠٠٠ جم، إذن ١٠٠٠ − ${partA} = ${needed} جم.`,
        },
      };
    }

    case 'shapes': {
      const pool = [
        { nameEn: 'Triangle', nameAr: 'المثلث', attrEn: 'sides', attrAr: 'أضلاع', ans: 3 },
        { nameEn: 'Pentagon', nameAr: 'الشكل الخماسي', attrEn: 'sides', attrAr: 'أضلاع', ans: 5 },
        { nameEn: 'Hexagon', nameAr: 'الشكل السداسي', attrEn: 'sides', attrAr: 'أضلاع', ans: 6 },
        { nameEn: 'Cube', nameAr: 'المكعب', attrEn: 'flat square faces', attrAr: 'أوجه مربعة', ans: 6 },
        { nameEn: 'Pyramid', nameAr: 'الهرم الرباعي', attrEn: 'faces', attrAr: 'أوجه', ans: 5 },
      ];
      const item = pickOne(pool);
      const shuf = shuffle([item.ans, item.ans + 2, Math.max(2, item.ans - 1)]);
      return {
        id: qid,
        prompt: {
          en: `How many ${item.attrEn} does a ${item.nameEn} have?`,
          ar: `كم عدد ${item.attrAr} ${item.nameAr}؟`,
        },
        options: shuf.map((v) => ({ en: `${v}`, ar: `${v}` })),
        correctIndex: shuf.indexOf(item.ans),
        explanation: {
          en: `A ${item.nameEn} always has ${item.ans} ${item.attrEn}.`,
          ar: `${item.nameAr} له دائمًا ${item.ans} ${item.attrAr}.`,
        },
      };
    }

    case 'fractions': {
      const den = pickOne([2, 3, 4, 6, 8]);
      const num = randInt(1, den - 1);
      const ans = `${num}/${den}`;
      const w1 = `${den}/${num}`;
      const w2 = `${Math.min(den, num + 1)}/${den === 2 ? 4 : den}`;
      const optsSet = new Set<string>([ans]);
      if (w1 !== ans) optsSet.add(w1);
      if (w2 !== ans) optsSet.add(w2);
      while (optsSet.size < 3) {
        optsSet.add(`${randInt(1, 3)}/${pickOne([4, 5, 6])}`);
      }
      const shuf = shuffle(Array.from(optsSet));
      return {
        id: qid,
        prompt: {
          en: `A shape is cut into ${den} equal parts and ${num} ${num === 1 ? 'part is' : 'parts are'} shaded. Which fraction is shaded?`,
          ar: `شكل مقسم إلى ${den} أجزاء متساوية وتم تظليل ${num}. ما الكسر؟`,
        },
        options: shuf.map((v) => ({ en: v, ar: v })),
        correctIndex: shuf.indexOf(ans),
        explanation: {
          en: `Put shaded parts (${num}) on top and total equal parts (${den}) on the bottom: ${ans}.`,
          ar: `نضع الأجزاء المظللة (${num}) في الأعلى وإجمالي الأجزاء المتساوية (${den}) في الأسفل: ${ans}.`,
        },
      };
    }

    case 'graphs': {
      const mango = randInt(4, 9);
      const dates = randInt(2, 8);
      const figs = randInt(2, 7);
      if (nextRandom() < 0.5) {
        const total = mango + dates + figs;
        const shuf = shuffle([total, total - 2, total + 3]);
        return {
          id: qid,
          prompt: {
            en: `A bar graph shows ${mango} Mangoes, ${dates} Dates, and ${figs} Figs. How many fruits altogether?`,
            ar: `يعرض الرسم البياني ${mango} مانجو و ${dates} تمر و ${figs} تين. كم إجمالي الفاكهة معًا؟`,
          },
          options: shuf.map((v) => ({ en: `${v}`, ar: `${v}` })),
          correctIndex: shuf.indexOf(total),
          explanation: {
            en: `Add all three bars: ${mango} + ${dates} + ${figs} = ${total}.`,
            ar: `نجمع الأعمدة الثلاثة: ${mango} + ${dates} + ${figs} = ${total}.`,
          },
        };
      }
      const big = Math.max(mango, dates);
      const small = Math.min(mango, dates);
      const diff = big === small ? 1 : big - small;
      const adjBig = big === small ? big + 1 : big;
      const shuf = shuffle([diff, diff + 2, adjBig + small]);
      return {
        id: qid,
        prompt: {
          en: `A chart shows ${adjBig} Mangoes and ${small} Dates. How many more Mangoes than Dates?`,
          ar: `يعرض الرسم البياني ${adjBig} مانجو و ${small} تمر. بكم يزيد المانجو عن التمر؟`,
        },
        options: shuf.map((v) => ({ en: `${v}`, ar: `${v}` })),
        correctIndex: shuf.indexOf(diff),
        explanation: {
          en: `Subtract the smaller bar from the larger bar: ${adjBig} − ${small} = ${diff}.`,
          ar: `نطرح العمود الأصغر من الأكبر: ${adjBig} − ${small} = ${diff}.`,
        },
      };
    }
  }
}
