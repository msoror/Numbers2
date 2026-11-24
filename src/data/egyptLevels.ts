import {
  ActiveQuestion,
  BazaarQuestion,
  BilingualText,
  ClockQuestion,
  LevelConfig,
  LevelNumber,
  NileQuestion,
  ShapeKind,
  StickerId,
  StickerInfo,
  SubjectConfig,
  SubjectId,
  WorkshopQuestion,
  WorldId,
} from '../types/game';

/* ============================================================================
   12 EGYPTIAN STICKERS (1 UNIQUE STICKER PER STANDALONE SUBJECT)
   ============================================================================ */
export const EGYPT_STICKERS: Record<StickerId, StickerInfo> = {
  bazaar_scarab: {
    id: 'bazaar_scarab',
    name: { en: 'Turquoise Scarab', ar: 'جعران الفيروز' },
    worldId: 'bazaar',
    subjectId: 'place_value',
    unlockHint: { en: 'Complete a Place Value level', ar: 'أكمل مستوى في القيمة المكانية' },
  },
  egypt_pound_chest: {
    id: 'egypt_pound_chest',
    name: { en: 'Bazaar Coin Chest', ar: 'صندوق الجنيهات' },
    worldId: 'bazaar',
    subjectId: 'money',
    unlockHint: { en: 'Complete an Egyptian Money level', ar: 'أكمل مستوى في الجنيهات المصرية' },
  },
  nile_felucca: {
    id: 'nile_felucca',
    name: { en: 'White-Sailed Felucca', ar: 'فلوكة النيل' },
    worldId: 'nile',
    subjectId: 'vertical_math',
    unlockHint: { en: 'Complete an Addition & Subtraction level', ar: 'أكمل مستوى في الجمع والطرح' },
  },
  golden_array: {
    id: 'golden_array',
    name: { en: 'Golden Harvest Array', ar: 'مصفوفة البلح الذهبية' },
    worldId: 'nile',
    subjectId: 'arrays',
    unlockHint: { en: 'Complete an Arrays level', ar: 'أكمل مستوى في المصفوفات' },
  },
  oasis_clock: {
    id: 'oasis_clock',
    name: { en: 'Oasis Tower Gear', ar: 'ترس ساعة الواحة' },
    worldId: 'clock',
    subjectId: 'clock',
    unlockHint: { en: 'Complete a Telling Time level', ar: 'أكمل مستوى في قراءة الساعة' },
  },
  calendar_moon: {
    id: 'calendar_moon',
    name: { en: 'Crescent Calendar', ar: 'تقويم الهلال' },
    worldId: 'clock',
    subjectId: 'calendar',
    unlockHint: { en: 'Complete an Elapsed & Calendar level', ar: 'أكمل مستوى في الوقت والتقويم' },
  },
  papyrus_ruler: {
    id: 'papyrus_ruler',
    name: { en: 'Royal Cubit Ruler', ar: 'مسطرة البردي' },
    worldId: 'workshop',
    subjectId: 'length',
    unlockHint: { en: 'Complete a Measuring Length level', ar: 'أكمل مستوى في قياس الطول' },
  },
  nile_amphora: {
    id: 'nile_amphora',
    name: { en: 'Nile Water Amphora', ar: 'جرة ماء النيل' },
    worldId: 'workshop',
    subjectId: 'capacity',
    unlockHint: { en: 'Complete a Liquid Capacity level', ar: 'أكمل مستوى في سعة السوائل' },
  },
  khan_lantern: {
    id: 'khan_lantern',
    name: { en: 'Khan Brass Balance', ar: 'ميزان خان الخليلي' },
    worldId: 'workshop',
    subjectId: 'mass',
    unlockHint: { en: 'Complete a Mass & Scales level', ar: 'أكمل مستوى في الكتلة والميزان' },
  },
  pyramid_prism: {
    id: 'pyramid_prism',
    name: { en: 'Giza Golden Pyramid', ar: 'هرم الجيزة الذهبي' },
    worldId: 'workshop',
    subjectId: 'shapes',
    unlockHint: { en: 'Complete a 2D & 3D Shapes level', ar: 'أكمل مستوى في الأشكال الهندسية' },
  },
  sundial_badge: {
    id: 'sundial_badge',
    name: { en: 'Fraction Sun Disk', ar: 'قرص الكسور الذهبي' },
    worldId: 'workshop',
    subjectId: 'fractions',
    unlockHint: { en: 'Complete a Fractions level', ar: 'أكمل مستوى في الكسور' },
  },
  palm_abacus: {
    id: 'palm_abacus',
    name: { en: 'Harvest Graph Tablet', ar: 'لوح الرسم البياني' },
    worldId: 'workshop',
    subjectId: 'graphs',
    unlockHint: { en: 'Complete a Bar Graphs level', ar: 'أكمل مستوى في الرسم البياني' },
  },
};

/* ============================================================================
   12 STANDALONE PRIMARY 2 SUBJECTS
   ============================================================================ */
export const WORLD_NAMES: Record<WorldId, BilingualText> = {
  bazaar: { en: 'Cairo Bazaar', ar: 'سوق القاهرة' },
  nile: { en: 'Nile Felucca', ar: 'فلوكة النيل' },
  clock: { en: 'Oasis Clocktower', ar: 'برج الساعة' },
  workshop: { en: 'Pyramid Workshop', ar: 'ورشة القياس' },
};

export const EGYPT_SUBJECTS: SubjectConfig[] = [
  {
    id: 'place_value',
    order: '01',
    worldId: 'bazaar',
    title: { en: 'Place Value & Comparing', ar: 'القيمة المكانية والمقارنة' },
    shortTitle: { en: 'Place Value', ar: 'القيمة المكانية' },
    subtitle: { en: 'Hundreds, Tens, Ones & < = >', ar: 'المئات والعشرات والآحاد والمقارنة' },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    stickerId: 'bazaar_scarab',
    accentColor: '#C2410C',
    surfaceTint: '#FFF7ED',
  },
  {
    id: 'money',
    order: '02',
    worldId: 'bazaar',
    title: { en: 'Egyptian Money & Change', ar: 'الجنيهات المصرية والباقي' },
    shortTitle: { en: 'Money (LE)', ar: 'الجنيهات (ج.م)' },
    subtitle: { en: 'Banknotes 1–200 LE & making change', ar: 'الأوراق النقدية وحساب الباقي' },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    stickerId: 'egypt_pound_chest',
    accentColor: '#D97706',
    surfaceTint: '#FEFCE8',
  },
  {
    id: 'vertical_math',
    order: '03',
    worldId: 'nile',
    title: { en: 'Addition & Subtraction', ar: 'الجمع والطرح وإعادة التجميع' },
    shortTitle: { en: 'Add & Sub', ar: 'الجمع والطرح' },
    subtitle: { en: '2- & 3-digit carry and borrow', ar: 'جمع بالحمل وطرح بالاستلاف' },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    stickerId: 'nile_felucca',
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
  },
  {
    id: 'arrays',
    order: '04',
    worldId: 'nile',
    title: { en: 'Arrays & Multiplication', ar: 'المصفوفات والجمع المتكرر' },
    shortTitle: { en: 'Arrays', ar: 'المصفوفات' },
    subtitle: { en: 'Rows, columns & repeated addition', ar: 'الصفوف والأعمدة وجدول الضرب' },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    stickerId: 'golden_array',
    accentColor: '#0D9488',
    surfaceTint: '#ECFEFF',
  },
  {
    id: 'clock',
    order: '05',
    worldId: 'clock',
    title: { en: 'Telling Time (Clocks)', ar: 'قراءة وضبط الساعة' },
    shortTitle: { en: 'Clocks', ar: 'الساعة' },
    subtitle: { en: "O'clock, halves, quarters & 5-min", ar: 'تمامًا والنصف والربع و٥ دقائق' },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    stickerId: 'oasis_clock',
    accentColor: '#1D4ED8',
    surfaceTint: '#EFF6FF',
  },
  {
    id: 'calendar',
    order: '06',
    worldId: 'clock',
    title: { en: 'Elapsed Time & Calendar', ar: 'الوقت المنقضي والتقويم' },
    shortTitle: { en: 'Calendar', ar: 'التقويم والمدة' },
    subtitle: { en: 'Durations, weekdays, weeks & months', ar: 'حساب المدة والأيام والشهور' },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    stickerId: 'calendar_moon',
    accentColor: '#4338CA',
    surfaceTint: '#EEF2FF',
  },
  {
    id: 'length',
    order: '07',
    worldId: 'workshop',
    title: { en: 'Measuring Length (cm / m)', ar: 'قياس الطول (سم / م)' },
    shortTitle: { en: 'Length', ar: 'الطول' },
    subtitle: { en: 'Centimeter rulers & non-zero starts', ar: 'المسطرة والقياس من أي نقطة' },
    termTag: { en: 'Term 1', ar: 'الفصل ١' },
    stickerId: 'papyrus_ruler',
    accentColor: '#15803D',
    surfaceTint: '#F0FDF4',
  },
  {
    id: 'capacity',
    order: '08',
    worldId: 'workshop',
    title: { en: 'Liquid Capacity (L / mL)', ar: 'سعة السوائل (لتر / مل)' },
    shortTitle: { en: 'Capacity', ar: 'السعة' },
    subtitle: { en: 'Pouring scoops into a 1 Liter jug', ar: 'سكب الملليلترات حتى ١ لتر' },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    stickerId: 'nile_amphora',
    accentColor: '#0284C7',
    surfaceTint: '#F0F9FF',
  },
  {
    id: 'mass',
    order: '09',
    worldId: 'workshop',
    title: { en: 'Mass & Balance Scales', ar: 'الكتلة والميزان (جم / كجم)' },
    shortTitle: { en: 'Mass (g/kg)', ar: 'الكتلة' },
    subtitle: { en: 'Compare grams & kilograms (1 kg = 1000 g)', ar: 'المقارنة بين الجرام والكيلوجرام' },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    stickerId: 'khan_lantern',
    accentColor: '#B45309',
    surfaceTint: '#FFFBEB',
  },
  {
    id: 'shapes',
    order: '10',
    worldId: 'workshop',
    title: { en: '2D & 3D Shapes', ar: 'الأشكال الهندسية والمجسمات' },
    shortTitle: { en: 'Shapes', ar: 'الأشكال' },
    subtitle: { en: 'Polygons, solids, sides, vertices & faces', ar: 'الأضلاع والرؤوس والأوجه' },
    termTag: { en: 'Term 1', ar: 'الفصل ١' },
    stickerId: 'pyramid_prism',
    accentColor: '#7C3AED',
    surfaceTint: '#F5F3FF',
  },
  {
    id: 'fractions',
    order: '11',
    worldId: 'workshop',
    title: { en: 'Fractions & Equal Parts', ar: 'الكسور والأجزاء المتساوية' },
    shortTitle: { en: 'Fractions', ar: 'الكسور' },
    subtitle: { en: 'Halves, thirds, quarters up to eighths', ar: 'النصف والثلث والربع وحتى الأثمان' },
    termTag: { en: 'Term 2', ar: 'الفصل ٢' },
    stickerId: 'sundial_badge',
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
  },
  {
    id: 'graphs',
    order: '12',
    worldId: 'workshop',
    title: { en: 'Bar Graphs & Data', ar: 'التمثيل البياني بالأعمدة' },
    shortTitle: { en: 'Bar Graphs', ar: 'الرسم البياني' },
    subtitle: { en: 'Read counts, totals & differences', ar: 'قراءة الأعمدة والمجموع والفرق' },
    termTag: { en: 'Term 1 & 2', ar: 'الفصل ١ و ٢' },
    stickerId: 'palm_abacus',
    accentColor: '#BE123C',
    surfaceTint: '#FFF1F2',
  },
];

const DIFFICULTY_LABELS: Record<LevelNumber, BilingualText> = {
  1: { en: 'Easy', ar: 'سهل' },
  2: { en: 'Core', ar: 'أساسي' },
  3: { en: 'Skilled', ar: 'متقدم' },
  4: { en: 'Hard', ar: 'تحدي' },
  5: { en: 'Master', ar: 'إتقان' },
};

const LEVEL_BLUEPRINTS: Record<
  SubjectId,
  { title: BilingualText; summary: BilingualText }[]
> = {
  place_value: [
    { title: { en: 'Tens & Ones Blocks', ar: 'العشرات والآحاد' }, summary: { en: '2-digit numbers up to 99', ar: 'أعداد من رقمين حتى ٩٩' } },
    { title: { en: 'Hundreds Up to 499', ar: 'المئات حتى ٤٩٩' }, summary: { en: 'Build 3-digit numbers (100–499)', ar: 'أعداد من ٣ أرقام حتى ٤٩٩' } },
    { title: { en: 'Full 999 & Zero Digits', ar: 'حتى ٩٩٩ مع الصفر' }, summary: { en: 'Includes zero-tens/ones like 407', ar: 'يشمل أعدادًا بها صفر مثل ٤٠٧' } },
    { title: { en: 'Compare 3-Digit Prices', ar: 'مقارنة ٣ أرقام' }, summary: { en: 'Choose <, =, or > for 3-digit numbers', ar: 'اختر < أو = أو > بين ٣ أرقام' } },
    { title: { en: 'Place Value Master', ar: 'بطل القيمة المكانية' }, summary: { en: 'Mixed tricky blocks & close compares', ar: 'تحدي شامل للمكعبات والمقارنة' } },
  ],
  money: [
    { title: { en: 'Small Prices (10–49 LE)', ar: 'أسعار صغيرة (١٠–٤٩ ج.م)' }, summary: { en: 'Pay with 1, 5, 10 & 20 LE notes', ar: 'ادفع بفئات ١ و ٥ و ١٠ و ٢٠ ج.م' } },
    { title: { en: 'Medium Prices (50–99 LE)', ar: 'أسعار متوسطة (٥٠–٩٩ ج.م)' }, summary: { en: 'Combine 50, 20, 10, 5 & 1 LE', ar: 'كوّن مبالغ حتى ٩٩ ج.م' } },
    { title: { en: 'Big Bazaar (100–250 LE)', ar: 'السوق الكبير (١٠٠–٢٥٠ ج.م)' }, summary: { en: 'Use 100 LE notes for 3-digit prices', ar: 'استخدم فئة ١٠٠ ج.م للأسعار الكبيرة' } },
    { title: { en: 'Change from 50 & 100 LE', ar: 'الباقي من ٥٠ و ١٠٠ ج.م' }, summary: { en: 'Subtract item price to find change', ar: 'احسب الباقي بعد الدفع' } },
    { title: { en: 'Master Cashier (200 LE)', ar: 'خبير الحساب (٢٠٠ ج.م)' }, summary: { en: 'Change from 100–200 LE & exact pay', ar: 'الباقي من ٢٠٠ ج.م وتكوين مبالغ' } },
  ],
  vertical_math: [
    { title: { en: '2-Digit Easy Add & Sub', ar: 'رقمان بدون إعادة تجميع' }, summary: { en: 'Clean columns with no carry/borrow', ar: 'جمع وطرح رأسي مباشر' } },
    { title: { en: '2-Digit Carry & Borrow', ar: 'رقمان بالحمل والاستلاف' }, summary: { en: 'Regrouping in the Ones column', ar: 'إعادة التجميع في خانة الآحاد' } },
    { title: { en: '3-Digit No Regrouping', ar: '٣ أرقام بدون تجميع' }, summary: { en: 'Hundreds, Tens & Ones vertical math', ar: 'جمع وطرح ٣ أرقام مباشرة' } },
    { title: { en: '3-Digit Ones Regrouping', ar: '٣ أرقام مع التجميع' }, summary: { en: 'Carry or borrow with 3-digit numbers', ar: 'الحمل والاستلاف في ٣ أرقام' } },
    { title: { en: 'Double Regroup Master', ar: 'بطل إعادة التجميع' }, summary: { en: 'Multi-column 3-digit carry & borrow', ar: 'حمل واستلاف متقدم في ٣ أرقام' } },
  ],
  arrays: [
    { title: { en: 'Mini Arrays (2×2 – 3×3)', ar: 'مصفوفات صغيرة' }, summary: { en: 'Count 2 to 3 equal rows', ar: 'صفان إلى ٣ صفوف متساوية' } },
    { title: { en: 'Growing Arrays (Up to 4×4)', ar: 'مصفوفات حتى ٤×٤' }, summary: { en: 'Repeated addition up to 4 rows', ar: 'جمع متكرر حتى ٤ صفوف' } },
    { title: { en: 'Oasis Arrays (Up to 5×5)', ar: 'مصفوفات حتى ٥×٥' }, summary: { en: 'Rows and columns up to 25', ar: 'صفوف وأعمدة حتى ٢٥' } },
    { title: { en: 'Large Harvest (Up to 5×6)', ar: 'مصفوفات كبيرة (٥×٦)' }, summary: { en: 'Multiply up to 30 dates', ar: 'ضرب متكرر حتى ٣٠' } },
    { title: { en: 'Master Arrays (Up to 6×6)', ar: 'بطل المصفوفات (٦×٦)' }, summary: { en: 'Full 6×6 array challenges', ar: 'تحدي المصفوفات حتى ٦×٦' } },
  ],
  clock: [
    { title: { en: "O'Clock (:00)", ar: 'الساعة تمامًا (:٠٠)' }, summary: { en: 'Read & set exact whole hours', ar: 'قراءة وضبط الساعات الكاملة' } },
    { title: { en: 'Half-Past (:30)', ar: 'والنصف (:٣٠)' }, summary: { en: 'Read & set :00 and :30 clocks', ar: 'قراءة وضبط تمامًا والنصف' } },
    { title: { en: 'Quarter Hours (:15, :45)', ar: 'وربع وإلا ربع' }, summary: { en: 'Quarter-past and quarter-to', ar: 'قراءة وضبط الربع ساعة' } },
    { title: { en: 'Nearest 5 Minutes', ar: 'أقرب ٥ دقائق' }, summary: { en: 'Count by 5s around the clock', ar: 'العد بالخمسات حول الساعة' } },
    { title: { en: 'Master Clockmaker', ar: 'خبير الساعات' }, summary: { en: 'Set & read any 5-minute time', ar: 'ضبط وقراءة أي وقت بـ ٥ دقائق' } },
  ],
  calendar: [
    { title: { en: 'Whole-Hour Durations', ar: 'المدة بالساعات الكاملة' }, summary: { en: 'Find how many hours passed', ar: 'كم ساعة مرت بين وقتين' } },
    { title: { en: 'Minutes & Half-Hours', ar: 'الدقائق وأنصاف الساعات' }, summary: { en: 'Add 15, 30, or 45 minutes', ar: 'إضافة ١٥ و ٣٠ و ٤٥ دقيقة' } },
    { title: { en: 'Days of the Week Jumps', ar: 'قفزات أيام الأسبوع' }, summary: { en: 'Count forward across 7 weekdays', ar: 'العد للأمام على أيام الأسبوع' } },
    { title: { en: 'Weeks & Months Math', ar: 'حساب الأسابيع والشهور' }, summary: { en: 'Convert weeks→days & years→months', ar: 'تحويل الأسابيع لأيام والسنوات لشهور' } },
    { title: { en: 'Time & Calendar Master', ar: 'بطل الوقت والتقويم' }, summary: { en: 'Mixed elapsed times & date puzzles', ar: 'تحدي شامل للمدة والتقويم' } },
  ],
  length: [
    { title: { en: 'Short Rulers (From 0)', ar: 'مسطرة قصيرة (من ٠)' }, summary: { en: 'Measure 2–7 cm starting at 0', ar: 'قياس ٢–٧ سم بدءًا من الصفر' } },
    { title: { en: 'Full Ruler (From 0)', ar: 'المسطرة الكاملة (من ٠)' }, summary: { en: 'Measure 5–13 cm starting at 0', ar: 'قياس ٥–١٣ سم بدءًا من الصفر' } },
    { title: { en: 'Offset Start (1–2 cm)', ar: 'بداية من ١ أو ٢ سم' }, summary: { en: 'Subtract End − Start to measure', ar: 'اطرح البداية من النهاية' } },
    { title: { en: 'Shifted Ruler (2–5 cm)', ar: 'بداية متغيرة (٢–٥ سم)' }, summary: { en: 'Measure objects anywhere on ruler', ar: 'قياس الأجسام من أي رقم' } },
    { title: { en: 'Royal Architect Ruler', ar: 'خبير قياس الأطوال' }, summary: { en: 'Tricky non-zero starts & close choices', ar: 'قياسات دقيقة بخيارات متقاربة' } },
  ],
  capacity: [
    { title: { en: 'Easy 100s (200–500 mL)', ar: 'بدايات السعة (٢٠٠–٥٠٠ مل)' }, summary: { en: 'Pour 100 & 200 mL scoops', ar: 'اسكب مغارف ١٠٠ و ٢٠٠ مل' } },
    { title: { en: 'Quarters of a Liter', ar: 'أرباع اللتر (٢٥٠–١٠٠٠)' }, summary: { en: 'Build 250, 500, 750 & 1000 mL', ar: 'كوّن ٢٥٠ و ٥٠٠ و ٧٥٠ و ١٠٠٠ مل' } },
    { title: { en: 'Hundred Steps (300–900)', ar: 'حتى ٩٠٠ مل' }, summary: { en: 'Combine 500, 200 & 100 mL scoops', ar: 'ادمج ٥٠٠ و ٢٠٠ و ١٠٠ مل' } },
    { title: { en: '50 mL Precision', ar: 'دقة ٥٠ مل' }, summary: { en: 'Hit exact targets like 650 or 850 mL', ar: 'الوصول بدقة لمضاعفات ٥٠ مل' } },
    { title: { en: 'Master Water Pourer', ar: 'بطل السعة واللتر' }, summary: { en: 'Complex scoop combos up to 1 Liter', ar: 'تركيبات ذكية حتى ١ لتر كامل' } },
  ],
  mass: [
    { title: { en: 'Compare Grams (<1000 g)', ar: 'مقارنة الجرامات' }, summary: { en: 'Which pan is heavier in grams?', ar: 'أي الكفتين أثقل بالجرام؟' } },
    { title: { en: '1 kg vs Grams', ar: '١ كجم مقابل الجرامات' }, summary: { en: 'Remember 1 kg = 1000 g', ar: 'تذكر أن ١ كجم = ١٠٠٠ جم' } },
    { title: { en: 'Make 1 Kilogram', ar: 'تكوين ١ كيلوجرام' }, summary: { en: 'Find the missing grams to reach 1000 g', ar: 'أكمل الجرامات لتصل إلى ١ كجم' } },
    { title: { en: 'Multi-Kilogram Scales', ar: 'عدة كيلوجرامات' }, summary: { en: 'Compare 1–3 kg against grams', ar: 'قارن ١–٣ كجم بالجرامات' } },
    { title: { en: 'Master Balance Scale', ar: 'خبير الميزان والكتلة' }, summary: { en: 'Mixed conversions, balances & units', ar: 'تحدي شامل للأوزان والوحدات' } },
  ],
  shapes: [
    { title: { en: 'Basic 2D Shapes', ar: 'أشكال ثنائية الأبعاد' }, summary: { en: 'Triangle, square & rectangle', ar: 'المثلث والمربع والمستطيل' } },
    { title: { en: 'Polygons & Sides', ar: 'المضلعات والأضلاع' }, summary: { en: 'Count sides & vertices up to 6', ar: 'عد الأضلاع والرؤوس حتى ٦' } },
    { title: { en: '3D Solid Shapes', ar: 'المجسمات ثلاثية الأبعاد' }, summary: { en: 'Identify cube, cylinder & pyramid', ar: 'المكعب والأسطوانة والهرم' } },
    { title: { en: 'Faces & Vertices', ar: 'الأوجه والرؤوس' }, summary: { en: 'Count flat faces on 3D solids', ar: 'احسب أوجه ورؤوس المجسمات' } },
    { title: { en: 'Master Geometry', ar: 'بطل الهندسة والأشكال' }, summary: { en: 'All 2D & 3D properties combined', ar: 'تحدي شامل لكل الأشكال' } },
  ],
  fractions: [
    { title: { en: 'Halves & Quarters', ar: 'النصف والربع' }, summary: { en: 'Identify 1/2, 1/4, 2/4 & 3/4', ar: 'تعرّف على ١/٢ و ١/٤ و ٣/٤' } },
    { title: { en: 'Thirds & Quarters', ar: 'الأثلاث والأرباع' }, summary: { en: 'Master 1/3, 2/3, 1/4 & 3/4', ar: 'أتقن ١/٣ و ٢/٣ والأرباع' } },
    { title: { en: 'Fifths & Sixths', ar: 'الأخماس والأسداس' }, summary: { en: 'Circles split into 5 or 6 equal parts', ar: 'دوائر مقسمة إلى ٥ أو ٦ أجزاء' } },
    { title: { en: 'Eighths Explorer', ar: 'عالم الأثمان (٨ أجزاء)' }, summary: { en: 'Read shaded fractions out of 8', ar: 'قراءة الكسور من ٨ أجزاء' } },
    { title: { en: 'Fraction Master', ar: 'بطل الكسور' }, summary: { en: 'Any fraction from halves to eighths', ar: 'جميع الكسور من ٢ إلى ٨ أجزاء' } },
  ],
  graphs: [
    { title: { en: 'Find the Most', ar: 'الأكثر في الرسم البياني' }, summary: { en: 'Read the tallest bar on the chart', ar: 'حدد العمود الأطول وقيمته' } },
    { title: { en: 'Find the Least', ar: 'الأقل في الرسم البياني' }, summary: { en: 'Read the shortest bar on the chart', ar: 'حدد العمود الأقصر وقيمته' } },
    { title: { en: 'How Many More?', ar: 'بكم يزيد؟ (الفرق)' }, summary: { en: 'Subtract two bars to find difference', ar: 'اطرح عمودين لإيجاد الفرق' } },
    { title: { en: 'Total Altogether', ar: 'الإجمالي الكلي' }, summary: { en: 'Add all 3 fruit bars together', ar: 'اجمع الأعمدة الثلاثة معًا' } },
    { title: { en: 'Data Chart Master', ar: 'بطل الرسوم البيانية' }, summary: { en: 'Mixed totals, differences & comparisons', ar: 'تحدي شامل لقراءة البيانات' } },
  ],
};

/* Build all 60 Playable Levels (12 Subjects × 5 Progressive Levels) */
export const EGYPT_LEVELS: LevelConfig[] = EGYPT_SUBJECTS.flatMap((subject) =>
  ([1, 2, 3, 4, 5] as LevelNumber[]).map((lvlNum) => {
    const bp = LEVEL_BLUEPRINTS[subject.id][lvlNum - 1];
    return {
      id: `${subject.id}-${lvlNum}`,
      subjectId: subject.id,
      subjectName: subject.title,
      worldId: subject.worldId,
      worldName: WORLD_NAMES[subject.worldId],
      levelNumber: lvlNum,
      difficultyLabel: DIFFICULTY_LABELS[lvlNum],
      title: bp.title,
      conceptSummary: bp.summary,
      termTag: subject.termTag,
      roundsCount: 6,
      stickerId: subject.stickerId,
    };
  })
);

/* ============================================================================
   SHARED RANDOMIZATION & DEDUPLICATION HELPERS
   ============================================================================ */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uid(prefix: string, idx: number): string {
  return `${prefix}-${idx}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildNumberOptions(answer: number, offsets: number[], minVal = 1): number[] {
  const set = new Set<number>([answer]);
  let safety = 0;
  while (set.size < 4 && safety < 80) {
    safety++;
    const candidate = answer + offsets[randInt(0, offsets.length - 1)];
    if (candidate >= minVal && candidate !== answer) {
      set.add(candidate);
    }
  }
  let bump = 1;
  while (set.size < 4) {
    if (answer + bump >= minVal) set.add(answer + bump);
    bump++;
  }
  return shuffle(Array.from(set));
}

function generateUniqueList<T>(
  count: number,
  factory: (idx: number) => { signature: string; item: T }
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    let chosen = factory(i);
    let tries = 0;
    while (seen.has(chosen.signature) && tries < 25) {
      chosen = factory(i);
      tries++;
    }
    seen.add(chosen.signature);
    out.push(chosen.item);
  }
  return out;
}

/* ============================================================================
   PROCEDURAL AUTO-GENERATORS FOR ALL 12 STANDALONE SUBJECTS (LEVELS 1..5)
   ============================================================================ */

const BAZAAR_ITEMS: BilingualText[] = [
  { en: 'Brass Lantern', ar: 'فانوس نحاسي' },
  { en: 'Spice Basket', ar: 'سلة توابل' },
  { en: 'Papyrus Scroll', ar: 'لفافة بردي' },
  { en: 'Clay Pitcher', ar: 'قلة فخار' },
  { en: 'Date Box', ar: 'علبة تمر' },
  { en: 'Woven Rug', ar: 'سجادة يدوية' },
  { en: 'Copper Tray', ar: 'صينية نحاس' },
  { en: 'Silk Scarf', ar: 'وشاح حريري' },
];

function genPlaceValue(level: LevelNumber, count: number): BazaarQuestion[] {
  return generateUniqueList<BazaarQuestion>(count, (i) => {
    const makeCompare = level === 4 || (level === 5 && i % 2 === 1);

    if (makeCompare) {
      const sameHundreds = level === 5 || i % 3 !== 0;
      const h1 = randInt(1, 9);
      const h2 = sameHundreds ? h1 : randInt(1, 9);
      const t1 = randInt(0, 9);
      const t2 = level === 5 && i % 3 === 1 ? t1 : randInt(0, 9);
      const o1 = randInt(1, 9);
      const makeEqual = i === 3 && Math.random() < 0.55;
      const leftValue = h1 * 100 + t1 * 10 + o1;
      const rightValue = makeEqual ? leftValue : h2 * 100 + t2 * 10 + randInt(0, 9);
      const ans: '<' | '=' | '>' =
        leftValue < rightValue ? '<' : leftValue > rightValue ? '>' : '=';

      return {
        signature: `cmp-${leftValue}-${rightValue}`,
        item: {
          id: uid('pv-cmp', i),
          kind: 'money_change_or_compare',
          subKind: 'compare',
          leftValue,
          rightValue,
          leftLabel: { en: `${leftValue}`, ar: `${leftValue}` },
          rightLabel: { en: `${rightValue}`, ar: `${rightValue}` },
          answerCompare: ans,
          prompt: {
            en: 'Compare the two 3-digit numbers',
            ar: 'قارن بين العددين المكونين من ٣ أرقام',
          },
          hint: {
            en: 'Compare Hundreds first, then Tens, then Ones!',
            ar: 'قارن المئات أولاً، ثم العشرات، ثم الآحاد!',
          },
        },
      };
    }

    let hundreds = 0;
    let tens = randInt(1, 9);
    let ones = randInt(1, 9);

    if (level === 1) {
      hundreds = 0;
      tens = randInt(1, 9);
      ones = randInt(1, 9);
    } else if (level === 2) {
      hundreds = randInt(1, 4);
      tens = randInt(1, 8);
      ones = randInt(1, 9);
    } else {
      hundreds = randInt(1, 9);
      // Level 3 & 5 purposefully include tricky zero-tens or zero-ones numbers
      const zeroTrick = i % 2 === 0;
      if (zeroTrick) {
        if (Math.random() < 0.5) {
          tens = 0;
          ones = randInt(1, 9);
        } else {
          tens = randInt(1, 9);
          ones = 0;
        }
      } else {
        tens = randInt(1, 9);
        ones = randInt(1, 9);
      }
    }

    const value = hundreds * 100 + tens * 10 + ones;
    const rawDistractors =
      hundreds === 0
        ? [ones * 10 + tens, value + 10, Math.max(10, value - 10), value + 1, value + 11]
        : [
            ones * 100 + tens * 10 + hundreds,
            hundreds * 100 + ones * 10 + tens,
            tens * 100 + hundreds * 10 + ones,
            value + 10,
            value - 10,
            value + 100,
          ];
    const cleanDistractors = Array.from(
      new Set(rawDistractors.filter((v) => v !== value && v > 0 && v <= 999))
    );
    const options = shuffle([value, ...cleanDistractors.slice(0, 3)]);
    let bump = 1;
    while (options.length < 4) {
      const candidate = value + bump;
      if (!options.includes(candidate)) options.push(candidate);
      bump++;
    }

    return {
      signature: `pv-${value}`,
      item: {
        id: uid('pv', i),
        kind: 'place_value',
        hundreds,
        tens,
        ones,
        value,
        options: shuffle(options),
        prompt:
          hundreds === 0
            ? {
                en: 'What 2-digit number do the Tens and Ones blocks show?',
                ar: 'ما العدد المكون من رقمين الذي تمثله المكعبات؟',
              }
            : {
                en: 'What 3-digit number do the Place Value blocks show?',
                ar: 'ما العدد المكون من ٣ أرقام الذي تمثله مكعبات القيمة المكانية؟',
              },
        hint: {
          en: `${hundreds > 0 ? `${hundreds} Hundreds (${hundreds * 100}) + ` : ''}${tens} Tens (${tens * 10}) + ${ones} Ones (${ones})`,
          ar: `${hundreds > 0 ? `${hundreds} مئات (${hundreds * 100}) + ` : ''}${tens} عشرات (${tens * 10}) + ${ones} آحاد (${ones})`,
        },
      },
    };
  });
}

function genMoney(level: LevelNumber, count: number): BazaarQuestion[] {
  return generateUniqueList<BazaarQuestion>(count, (i) => {
    const isChange = level === 4 || (level === 5 && i % 3 !== 2);

    if (isChange) {
      const paidPool = level === 4 ? [50, 100] : [100, 200];
      const paid = pickOne(paidPool);
      const cost =
        paid === 50
          ? randInt(12, 44)
          : paid === 100
          ? randInt(23, 88)
          : randInt(108, 186);
      const change = paid - cost;

      return {
        signature: `chg-${paid}-${cost}`,
        item: {
          id: uid('mon-chg', i),
          kind: 'money_change_or_compare',
          subKind: 'change',
          leftValue: paid,
          rightValue: cost,
          leftLabel: { en: `Paid ${paid} LE`, ar: `دفعت ${paid} ج.م` },
          rightLabel: { en: `Price ${cost} LE`, ar: `السعر ${cost} ج.م` },
          answerNumber: change,
          optionsNumber: buildNumberOptions(change, [-10, -5, -2, -1, 1, 2, 5, 10], 1),
          prompt: {
            en: `You pay ${paid} LE for an item costing ${cost} LE. What is your change?`,
            ar: `دفعت ${paid} ج.م لشراء سلعة بسعر ${cost} ج.م. كم الباقي؟`,
          },
          hint: {
            en: `Subtract the price from what you paid: ${paid} − ${cost}`,
            ar: `اطرح السعر من المبلغ المدفوع: ${paid} − ${cost}`,
          },
        },
      };
    }

    const targetAmount =
      level === 1
        ? randInt(12, 48)
        : level === 2
        ? randInt(52, 98)
        : level === 3
        ? randInt(106, 245)
        : randInt(115, 285);
    const itemName = pickOne(BAZAAR_ITEMS);
    const h = Math.floor(targetAmount / 100);
    const rem = targetAmount % 100;
    const tCount = Math.floor(rem / 10);
    const oCount = rem % 10;

    return {
      signature: `pay-${targetAmount}`,
      item: {
        id: uid('mon-pay', i),
        kind: 'money_build',
        targetAmount,
        itemName,
        availableNotes: level === 1 ? [20, 10, 5, 1] : [100, 50, 20, 10, 5, 1],
        prompt: {
          en: `Pay ${targetAmount} LE for the ${itemName.en} using Egyptian banknotes`,
          ar: `ادفع ${targetAmount} ج.م ثمن ${itemName.ar} باستخدام الجنيهات المصرية`,
        },
        hint: {
          en: `Break it down: ${h > 0 ? `${h * 100} + ` : ''}${tCount * 10} + ${oCount} LE`,
          ar: `فكّك المبلغ: ${h > 0 ? `${h * 100} + ` : ''}${tCount * 10} + ${oCount} ج.م`,
        },
      },
    };
  });
}

function genVerticalMath(level: LevelNumber, count: number): NileQuestion[] {
  return generateUniqueList<NileQuestion>(count, (i) => {
    const op: '+' | '-' = i % 2 === 0 ? '+' : '-';
    let top = 34;
    let bottom = 22;
    let needsRegroup = false;

    if (level === 1) {
      // 2-digit NO regrouping
      if (op === '+') {
        const t1 = randInt(1, 5);
        const t2 = randInt(1, 8 - t1);
        const o1 = randInt(1, 5);
        const o2 = randInt(1, 9 - o1);
        top = t1 * 10 + o1;
        bottom = t2 * 10 + o2;
      } else {
        const t1 = randInt(4, 9);
        const t2 = randInt(1, t1 - 1);
        const o1 = randInt(4, 9);
        const o2 = randInt(1, o1 - 1);
        top = t1 * 10 + o1;
        bottom = t2 * 10 + o2;
      }
      needsRegroup = false;
    } else if (level === 2) {
      // 2-digit WITH regrouping
      if (op === '+') {
        const o1 = randInt(4, 9);
        const o2 = randInt(10 - o1, 9);
        const t1 = randInt(1, 5);
        const t2 = randInt(1, 3);
        top = t1 * 10 + o1;
        bottom = t2 * 10 + o2;
      } else {
        const o1 = randInt(0, 5);
        const o2 = randInt(o1 + 1, 9);
        const t1 = randInt(4, 9);
        const t2 = randInt(1, t1 - 2);
        top = t1 * 10 + o1;
        bottom = t2 * 10 + o2;
      }
      needsRegroup = true;
    } else if (level === 3) {
      // 3-digit NO regrouping
      if (op === '+') {
        const h1 = randInt(1, 5);
        const h2 = randInt(1, 8 - h1);
        const t1 = randInt(1, 5);
        const t2 = randInt(1, 8 - t1);
        const o1 = randInt(1, 5);
        const o2 = randInt(1, 9 - o1);
        top = h1 * 100 + t1 * 10 + o1;
        bottom = h2 * 100 + t2 * 10 + o2;
      } else {
        const h1 = randInt(4, 9);
        const h2 = randInt(1, h1 - 1);
        const t1 = randInt(4, 9);
        const t2 = randInt(1, t1 - 1);
        const o1 = randInt(4, 9);
        const o2 = randInt(1, o1 - 1);
        top = h1 * 100 + t1 * 10 + o1;
        bottom = h2 * 100 + t2 * 10 + o2;
      }
      needsRegroup = false;
    } else if (level === 4) {
      // 3-digit WITH ones regrouping
      if (op === '+') {
        const o1 = randInt(5, 9);
        const o2 = randInt(10 - o1, 9);
        const t1 = randInt(1, 4);
        const t2 = randInt(1, 3);
        const h1 = randInt(1, 4);
        const h2 = randInt(1, 4);
        top = h1 * 100 + t1 * 10 + o1;
        bottom = h2 * 100 + t2 * 10 + o2;
      } else {
        const o1 = randInt(0, 4);
        const o2 = randInt(o1 + 2, 9);
        const t1 = randInt(4, 8);
        const t2 = randInt(1, t1 - 2);
        const h1 = randInt(4, 8);
        const h2 = randInt(1, h1 - 1);
        top = h1 * 100 + t1 * 10 + o1;
        bottom = h2 * 100 + t2 * 10 + o2;
      }
      needsRegroup = true;
    } else {
      // Level 5: 3-digit DOUBLE regrouping (ones + tens)
      if (op === '+') {
        const o1 = randInt(5, 9);
        const o2 = randInt(10 - o1, 9);
        const t1 = randInt(5, 8);
        const t2 = randInt(10 - t1, 8);
        const h1 = randInt(1, 4);
        const h2 = randInt(1, 3);
        top = h1 * 100 + t1 * 10 + o1;
        bottom = h2 * 100 + t2 * 10 + o2;
      } else {
        const o1 = randInt(0, 4);
        const o2 = randInt(o1 + 2, 9);
        const t1 = randInt(1, 4);
        const t2 = randInt(t1 + 1, 8);
        const h1 = randInt(5, 9);
        const h2 = randInt(1, h1 - 2);
        top = h1 * 100 + t1 * 10 + o1;
        bottom = h2 * 100 + t2 * 10 + o2;
      }
      needsRegroup = true;
    }

    const answer = op === '+' ? top + bottom : top - bottom;
    const offsets =
      level >= 3 ? [-100, -10, -2, -1, 1, 2, 10, 100] : [-10, -2, -1, 1, 2, 10];

    return {
      signature: `vm-${op}-${top}-${bottom}`,
      item: {
        id: uid('vm', i),
        kind: 'vertical_math',
        operator: op,
        top,
        bottom,
        answer,
        needsRegroup,
        options: buildNumberOptions(answer, offsets, 5),
        prompt: {
          en:
            op === '+'
              ? level >= 3
                ? 'Add the two 3-digit numbers vertically'
                : 'Add the two 2-digit numbers vertically'
              : level >= 3
              ? 'Subtract the two 3-digit numbers vertically'
              : 'Subtract the two 2-digit numbers vertically',
          ar:
            op === '+'
              ? level >= 3
                ? 'اجمع العددين من ٣ أرقام رأسيًا'
                : 'اجمع العددين من رقمين رأسيًا'
              : level >= 3
              ? 'اطرح العددين من ٣ أرقام رأسيًا'
              : 'اطرح العددين من رقمين رأسيًا',
        },
        hint: {
          en: needsRegroup
            ? op === '+'
              ? 'Ones add to 10 or more — carry 1 ten to the Tens column!'
              : 'Top digit is smaller — borrow 1 from the column to the left!'
            : 'Start with the Ones column, then Tens, then Hundreds.',
          ar: needsRegroup
            ? op === '+'
              ? 'مجموع الخانة ١٠ أو أكثر — احمل ١ إلى الخانة التالية!'
              : 'الرقم العلوي أصغر — استلف ١ من الخانة المجاورة!'
            : 'ابدأ بخانة الآحاد ثم العشرات ثم المئات.',
        },
      },
    };
  });
}

function genArrays(level: LevelNumber, count: number): NileQuestion[] {
  const bounds: Record<LevelNumber, [number, number, number, number]> = {
    1: [2, 3, 2, 3],
    2: [2, 4, 2, 4],
    3: [2, 5, 3, 5],
    4: [3, 5, 3, 6],
    5: [3, 6, 4, 6],
  };
  const [minR, maxR, minC, maxC] = bounds[level];

  return generateUniqueList<NileQuestion>(count, (i) => {
    const rows = randInt(minR, maxR);
    const cols = randInt(minC, maxC);
    const answer = rows * cols;

    return {
      signature: `arr-${rows}-${cols}`,
      item: {
        id: uid('arr', i),
        kind: 'array_multiply',
        rows,
        cols,
        answer,
        options: buildNumberOptions(answer, [-rows, -cols, -2, -1, 1, 2, cols, rows], 4),
        prompt: {
          en: `Count the date palm array: ${rows} rows of ${cols} (${rows} × ${cols})`,
          ar: `احسب مصفوفة التمر: ${rows} صفوف × ${cols} أعمدة`,
        },
        hint: {
          en: `Repeated addition: ${Array(rows).fill(cols).join(' + ')} = ${answer}`,
          ar: `جمع متكرر: ${Array(rows).fill(cols).join(' + ')} = ${answer}`,
        },
      },
    };
  });
}

function genClock(level: LevelNumber, count: number): ClockQuestion[] {
  const padM = (m: number) => (m < 10 ? `0${m}` : `${m}`);

  return generateUniqueList<ClockQuestion>(count, (i) => {
    const hour = randInt(1, 12);
    let minute = 0;
    if (level === 1) minute = 0;
    else if (level === 2) minute = i % 2 === 0 ? 30 : 0;
    else if (level === 3) minute = pickOne([15, 45, 30]);
    else if (level === 4) minute = randInt(1, 11) * 5;
    else minute = randInt(0, 11) * 5;

    const canSet = level <= 3 || level === 5;
    const isSetMode = canSet && i % 2 === 1;

    if (isSetMode) {
      const stepMinutes: 5 | 15 = level === 5 && minute % 15 !== 0 ? 5 : 15;
      const startHour = hour === 1 ? 12 : hour - 1;
      return {
        signature: `clk-set-${hour}-${minute}`,
        item: {
          id: uid('clk-set', i),
          kind: 'set_clock',
          targetHour: hour,
          targetMinute: minute,
          startHour,
          startMinute: 0,
          stepMinutes,
          prompt: {
            en: `Set the Oasis Clock to ${hour}:${padM(minute)}`,
            ar: `اضبط ساعة الواحة على ${hour}:${padM(minute)}`,
          },
          hint: {
            en:
              minute === 0
                ? 'Long minute hand points to 12 for :00!'
                : minute === 15
                ? 'Quarter past (:15) — minute hand points to 3!'
                : minute === 30
                ? 'Half past (:30) — minute hand points to 6!'
                : minute === 45
                ? '45 minutes (:45) — minute hand points to 9!'
                : `Count by 5s from 12 to reach :${padM(minute)} (number ${minute / 5})!`,
            ar:
              minute === 0
                ? 'عقرب الدقائق الطويل يشير إلى ١٢ عند تمام الساعة!'
                : minute === 15
                ? 'وربع (:١٥) — عقرب الدقائق عند ٣!'
                : minute === 30
                ? 'ونصف (:٣٠) — عقرب الدقائق عند ٦!'
                : minute === 45
                ? 'و٤٥ دقيقة (:٤٥) — عقرب الدقائق عند ٩!'
                : `عدّ بالخمسات من ١٢ حتى تصل إلى ${minute} دقيقة (عند الرقم ${minute / 5})!`,
          },
        },
      };
    }

    const candidates: { hour: number; minute: number }[] = [{ hour, minute }];
    const altPairs = [
      { hour: (hour % 12) + 1, minute },
      { hour: hour === 1 ? 12 : hour - 1, minute },
      { hour, minute: (minute + 15) % 60 },
      { hour, minute: (minute + 30) % 60 },
      { hour, minute: (minute + 5) % 60 },
      { hour, minute: (minute + 55) % 60 },
    ];
    for (const alt of shuffle(altPairs)) {
      if (
        candidates.length < 4 &&
        !candidates.some((c) => c.hour === alt.hour && c.minute === alt.minute)
      ) {
        candidates.push(alt);
      }
    }
    const opts = shuffle(candidates);
    const correctIndex = opts.findIndex((o) => o.hour === hour && o.minute === minute);

    return {
      signature: `clk-read-${hour}-${minute}`,
      item: {
        id: uid('clk-read', i),
        kind: 'read_clock',
        hour,
        minute,
        dayPeriod: Math.random() < 0.5 ? 'am' : 'pm',
        options: opts,
        correctIndex,
        prompt: {
          en: level >= 4 ? 'Read the clock to the nearest 5 minutes' : 'What time does the Oasis Clock show?',
          ar: level >= 4 ? 'اقرأ الساعة لأقرب ٥ دقائق' : 'كم الساعة الآن على برج الواحة؟',
        },
        hint: {
          en: 'Short red hand shows the hour; count by 5s around the dial for the long teal hand!',
          ar: 'العقرب الأحمر القصير للساعات، وعدّ بالخمسات حول الساعة للعقرب الطويل!',
        },
      },
    };
  });
}

const WEEKDAYS: BilingualText[] = [
  { en: 'Saturday', ar: 'السبت' },
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الاثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
  { en: 'Friday', ar: 'الجمعة' },
];

function genCalendar(level: LevelNumber, count: number): ClockQuestion[] {
  const padM = (m: number) => (m < 10 ? `0${m}` : `${m}`);

  return generateUniqueList<ClockQuestion>(count, (i) => {
    const mode =
      level === 1
        ? 'whole_hours'
        : level === 2
        ? 'mixed_mins'
        : level === 3
        ? 'weekdays'
        : level === 4
        ? 'conversions'
        : pickOne(['whole_hours', 'mixed_mins', 'weekdays', 'conversions'] as const);

    if (mode === 'whole_hours') {
      const startH = randInt(1, 7);
      const durH = randInt(1, 4);
      const endH = startH + durH;
      const numOpts = buildNumberOptions(durH, [-2, -1, 1, 2, 3], 1);
      const options: BilingualText[] = numOpts.map((h) => ({
        en: h === 1 ? '1 hour' : `${h} hours`,
        ar: h === 1 ? 'ساعة واحدة' : h === 2 ? 'ساعتان' : `${h} ساعات`,
      }));
      const correctIndex = numOpts.indexOf(durH);

      return {
        signature: `cal-hr-${startH}-${durH}`,
        item: {
          id: uid('cal-hr', i),
          kind: 'elapsed_or_calendar',
          prompt: {
            en: `A Nile boat sails from ${startH}:00 to ${endH}:00. How long was the trip?`,
            ar: `أبحرت الفلوكة من ${startH}:00 حتى ${endH}:00. كم ساعة استغرقت الرحلة؟`,
          },
          displayBadge: { en: `${startH}:00 → ${endH}:00`, ar: `${startH}:00 ← ${endH}:00` },
          options,
          correctIndex,
          hint: {
            en: `Subtract the start hour from the end hour: ${endH} − ${startH} = ${durH}!`,
            ar: `اطرح ساعة البداية من ساعة النهاية: ${endH} − ${startH} = ${durH}!`,
          },
        },
      };
    }

    if (mode === 'mixed_mins') {
      const startH = randInt(1, 9);
      const startM = pickOne([0, 15, 30]);
      const addM = pickOne([15, 30, 45]);
      const totalM = startH * 60 + startM + addM;
      const endH = ((Math.floor(totalM / 60) - 1) % 12) + 1;
      const endM = totalM % 60;

      const formatPair = (h: number, m: number) => `${h}:${padM(m)}`;
      const correctStr = formatPair(endH, endM);
      const wrongMins = shuffle([15, 30, 45, 60, -15]).map((delta) => {
        const tm = totalM + delta;
        const wh = ((Math.floor(tm / 60) - 1 + 12) % 12) + 1;
        const wm = ((tm % 60) + 60) % 60;
        return formatPair(wh, wm);
      });
      const uniqueStrs = Array.from(new Set([correctStr, ...wrongMins])).slice(0, 4);
      const shuffledStrs = shuffle(uniqueStrs);
      const correctIndex = shuffledStrs.indexOf(correctStr);

      return {
        signature: `cal-min-${startH}-${startM}-${addM}`,
        item: {
          id: uid('cal-min', i),
          kind: 'elapsed_or_calendar',
          prompt: {
            en: `Class starts at ${formatPair(startH, startM)} and lasts ${addM} minutes. When does it end?`,
            ar: `تبدأ الحصة الساعة ${formatPair(startH, startM)} وتستمر ${addM} دقيقة. متى تنتهي؟`,
          },
          displayBadge: {
            en: `${formatPair(startH, startM)} + ${addM} min`,
            ar: `${formatPair(startH, startM)} + ${addM} د`,
          },
          options: shuffledStrs.map((s) => ({ en: s, ar: s })),
          correctIndex,
          hint: {
            en: `Add ${addM} minutes to ${formatPair(startH, startM)} (remember 60 minutes = 1 hour)!`,
            ar: `أضف ${addM} دقيقة إلى ${formatPair(startH, startM)} (تذكر ٦٠ دقيقة = ١ ساعة)!`,
          },
        },
      };
    }

    if (mode === 'weekdays') {
      const startIdx = randInt(0, 6);
      const jump = randInt(2, 6);
      const targetIdx = (startIdx + jump) % 7;

      const idxPool = new Set<number>([targetIdx]);
      while (idxPool.size < 4) {
        idxPool.add(randInt(0, 6));
      }
      const optIndices = shuffle(Array.from(idxPool));
      const correctIndex = optIndices.indexOf(targetIdx);

      return {
        signature: `cal-day-${startIdx}-${jump}`,
        item: {
          id: uid('cal-day', i),
          kind: 'elapsed_or_calendar',
          prompt: {
            en: `Today is ${WEEKDAYS[startIdx].en}. What day comes ${jump} days later?`,
            ar: `اليوم هو ${WEEKDAYS[startIdx].ar}. ما اليوم الذي يأتي بعد ${jump} أيام؟`,
          },
          displayBadge: {
            en: `${WEEKDAYS[startIdx].en} + ${jump} days`,
            ar: `${WEEKDAYS[startIdx].ar} + ${jump} أيام`,
          },
          options: optIndices.map((idx) => WEEKDAYS[idx]),
          correctIndex,
          hint: {
            en: `Count ${jump} days forward starting after ${WEEKDAYS[startIdx].en}!`,
            ar: `عدّ ${jump} أيام للأمام بعد يوم ${WEEKDAYS[startIdx].ar}!`,
          },
        },
      };
    }

    // Conversions: random weeks -> days OR years -> months
    const isWeeks = Math.random() < 0.6;
    if (isWeeks) {
      const weeks = randInt(2, 5);
      const days = weeks * 7;
      const numOpts = buildNumberOptions(days, [-7, -3, -2, 2, 3, 7], 7);
      const correctIndex = numOpts.indexOf(days);
      return {
        signature: `cal-wk-${weeks}`,
        item: {
          id: uid('cal-wk', i),
          kind: 'elapsed_or_calendar',
          prompt: {
            en: `How many days are in ${weeks} full weeks?`,
            ar: `كم يومًا في ${weeks} أسابيع كاملة؟`,
          },
          displayBadge: {
            en: `${weeks} Weeks = ? Days`,
            ar: `${weeks} أسابيع = ؟ يومًا`,
          },
          options: numOpts.map((n) => ({ en: `${n} days`, ar: `${n} يومًا` })),
          correctIndex,
          hint: {
            en: `1 week = 7 days, so ${weeks} × 7 = ${days} days!`,
            ar: `الأسبوع الواحد = ٧ أيام، إذن ${weeks} × ٧ = ${days} يومًا!`,
          },
        },
      };
    }

    const years = randInt(1, 3);
    const months = years * 12;
    const numOpts = buildNumberOptions(months, [-12, -4, -2, 2, 4, 12], 6);
    const correctIndex = numOpts.indexOf(months);
    return {
      signature: `cal-yr-${years}`,
      item: {
        id: uid('cal-yr', i),
        kind: 'elapsed_or_calendar',
        prompt: {
          en: `How many months are in ${years === 1 ? '1 full year' : `${years} full years`}?`,
          ar: `كم شهرًا في ${years === 1 ? 'سنة كاملة' : `${years} سنوات كاملة`}؟`,
        },
        displayBadge: {
          en: `${years} ${years === 1 ? 'Year' : 'Years'} = ? Months`,
          ar: `${years} ${years === 1 ? 'سنة' : 'سنوات'} = ؟ شهرًا`,
        },
        options: numOpts.map((n) => ({ en: `${n} months`, ar: `${n} شهرًا` })),
        correctIndex,
        hint: {
          en: `1 year = 12 months, so ${years} × 12 = ${months} months!`,
          ar: `السنة الكاملة = ١٢ شهرًا، إذن ${years} × ١٢ = ${months} شهرًا!`,
        },
      },
    };
  });
}

const RULER_OBJECTS: { name: BilingualText; color: string }[] = [
  { name: { en: 'Reed Flute', ar: 'ناي القصب' }, color: '#D97706' },
  { name: { en: 'Papyrus Brush', ar: 'فرشاة الرسم' }, color: '#0EA5E9' },
  { name: { en: 'Turquoise Tile', ar: 'بلاطة فيروزية' }, color: '#0D9488' },
  { name: { en: 'Acacia Pencil', ar: 'قلم خشبي' }, color: '#16A34A' },
  { name: { en: 'Copper Chisel', ar: 'إزميل نحاسي' }, color: '#B45309' },
  { name: { en: 'Lotus Ribbon', ar: 'شريط اللوتس' }, color: '#7C3AED' },
];

function genLength(level: LevelNumber, count: number): WorkshopQuestion[] {
  return generateUniqueList<WorkshopQuestion>(count, (i) => {
    const maxCm = 14;
    let startCm = 0;
    let lengthCm = 6;

    if (level === 1) {
      startCm = 0;
      lengthCm = randInt(2, 7);
    } else if (level === 2) {
      startCm = 0;
      lengthCm = randInt(5, 13);
    } else if (level === 3) {
      startCm = randInt(1, 2);
      lengthCm = randInt(3, maxCm - startCm);
    } else if (level === 4) {
      startCm = randInt(2, 5);
      lengthCm = randInt(3, maxCm - startCm);
    } else {
      startCm = randInt(1, 5);
      lengthCm = randInt(3, maxCm - startCm);
    }

    const endCm = startCm + lengthCm;
    const obj = pickOne(RULER_OBJECTS);
    // Include endCm as a clever distractor when startCm > 0!
    const offsets =
      level === 5 ? [-2, -1, 1, 2] : [-3, -2, -1, 1, 2, 3];
    const baseOpts = buildNumberOptions(lengthCm, offsets, 1);
    if (startCm > 0 && !baseOpts.includes(endCm)) {
      const replaceIdx = baseOpts.findIndex((n) => n !== lengthCm);
      if (replaceIdx >= 0) baseOpts[replaceIdx] = endCm;
    }

    return {
      signature: `len-${startCm}-${lengthCm}`,
      item: {
        id: uid('len', i),
        kind: 'measure_length',
        objectName: obj.name,
        objectColor: obj.color,
        lengthCm,
        startCm,
        maxCm,
        options: shuffle(baseOpts),
        prompt: {
          en: `Measure the ${obj.name.en} using the centimeter ruler`,
          ar: `قِس طول ${obj.name.ar} باستخدام المسطرة (سم)`,
        },
        hint: {
          en:
            startCm === 0
              ? `Starts at 0 cm and ends at ${endCm} cm → ${endCm} cm!`
              : `Starts at ${startCm} cm and ends at ${endCm} cm → ${endCm} − ${startCm} = ${lengthCm} cm!`,
          ar:
            startCm === 0
              ? `يبدأ عند ٠ وينتهي عند ${endCm} سم ← الطول ${endCm} سم!`
              : `يبدأ عند ${startCm} وينتهي عند ${endCm} ← ${endCm} − ${startCm} = ${lengthCm} سم!`,
        },
      },
    };
  });
}

function genCapacity(level: LevelNumber, count: number): WorkshopQuestion[] {
  return generateUniqueList<WorkshopQuestion>(count, (i) => {
    let targetMl = 500;
    let scoops: number[] = [200, 100];

    if (level === 1) {
      targetMl = pickOne([200, 300, 400, 500, 600]);
      scoops = [200, 100];
    } else if (level === 2) {
      targetMl = pickOne([250, 500, 750, 1000]);
      scoops = [500, 250];
    } else if (level === 3) {
      targetMl = randInt(3, 9) * 100;
      scoops = [500, 200, 100];
    } else if (level === 4) {
      targetMl = pickOne([350, 450, 550, 650, 750, 850, 950]);
      scoops = [500, 250, 100, 50];
    } else {
      targetMl = randInt(9, 20) * 50; // 450..1000 in 50mL steps
      scoops = [500, 200, 150, 50];
    }

    return {
      signature: `cap-${targetMl}-${scoops.join(',')}`,
      item: {
        id: uid('cap', i),
        kind: 'capacity_pour',
        targetMl,
        maxMl: 1000,
        scoops,
        prompt: {
          en: `Pour exactly ${targetMl} mL of Nile water into the 1 Liter (1000 mL) jug`,
          ar: `اسكب ${targetMl} مل بالضبط في الدورق سعة ١ لتر (١٠٠٠ مل)`,
        },
        hint: {
          en: `Combine scoops to hit ${targetMl} mL (remember 1 L = 1000 mL)!`,
          ar: `اجمع المغارف لتصل إلى ${targetMl} مل (تذكر ١ لتر = ١٠٠٠ مل)!`,
        },
      },
    };
  });
}

const MASS_ITEMS: BilingualText[] = [
  { en: 'Dates', ar: 'تمر' },
  { en: 'Figs', ar: 'تين' },
  { en: 'Flour', ar: 'دقيق' },
  { en: 'Sugar', ar: 'سكر' },
  { en: 'Rice', ar: 'أرز' },
  { en: 'Olives', ar: 'زيتون' },
];

function genMass(level: LevelNumber, count: number): WorkshopQuestion[] {
  return generateUniqueList<WorkshopQuestion>(count, (i) => {
    const itemA = pickOne(MASS_ITEMS);
    let itemB = pickOne(MASS_ITEMS);
    if (itemB.en === itemA.en) itemB = MASS_ITEMS[(MASS_ITEMS.indexOf(itemA) + 1) % MASS_ITEMS.length];

    if (level === 1) {
      const leftG = randInt(2, 9) * 100;
      const rightG = randInt(2, 9) * 100;
      const correctIndex = leftG > rightG ? 0 : rightG > leftG ? 1 : 2;
      return {
        signature: `mass-1-${leftG}-${rightG}`,
        item: {
          id: uid('mass', i),
          kind: 'mass_or_unit',
          leftLabel: { en: `${leftG} g ${itemA.en}`, ar: `${leftG} جم ${itemA.ar}` },
          rightLabel: { en: `${rightG} g ${itemB.en}`, ar: `${rightG} جم ${itemB.ar}` },
          leftWeightGrams: leftG,
          rightWeightGrams: rightG,
          prompt: {
            en: 'Which pan is heavier on the balance scale?',
            ar: 'أي الكفتين أثقل على الميزان؟',
          },
          options: [
            { en: `${leftG} g ${itemA.en}`, ar: `${leftG} جم ${itemA.ar}` },
            { en: `${rightG} g ${itemB.en}`, ar: `${rightG} جم ${itemB.ar}` },
            { en: 'Both are equal', ar: 'الكفتان متساويتان' },
          ],
          correctIndex,
          hint: {
            en: `Compare the grams: ${leftG} g vs ${rightG} g!`,
            ar: `قارن الجرامات: ${leftG} جم مقابل ${rightG} جم!`,
          },
        },
      };
    }

    if (level === 2 || level === 4) {
      const kgCount = level === 2 ? 1 : randInt(1, 3);
      const kgInGrams = kgCount * 1000;
      const gramsSide =
        level === 2
          ? pickOne([450, 650, 800, 1000, 1200, 1350])
          : pickOne([kgInGrams - 350, kgInGrams - 150, kgInGrams, kgInGrams + 250, kgInGrams + 500]);
      const kgOnLeft = Math.random() < 0.5;
      const leftG = kgOnLeft ? kgInGrams : gramsSide;
      const rightG = kgOnLeft ? gramsSide : kgInGrams;
      const leftLabel = kgOnLeft
        ? { en: `${kgCount} kg ${itemA.en}`, ar: `${kgCount} كجم ${itemA.ar}` }
        : { en: `${gramsSide} g ${itemA.en}`, ar: `${gramsSide} جم ${itemA.ar}` };
      const rightLabel = kgOnLeft
        ? { en: `${gramsSide} g ${itemB.en}`, ar: `${gramsSide} جم ${itemB.ar}` }
        : { en: `${kgCount} kg ${itemB.en}`, ar: `${kgCount} كجم ${itemB.ar}` };
      const correctIndex = leftG > rightG ? 0 : rightG > leftG ? 1 : 2;

      return {
        signature: `mass-kg-${leftG}-${rightG}`,
        item: {
          id: uid('mass', i),
          kind: 'mass_or_unit',
          leftLabel,
          rightLabel,
          leftWeightGrams: leftG,
          rightWeightGrams: rightG,
          prompt: {
            en: 'Which side is heavier? (Remember: 1 kg = 1000 g)',
            ar: 'أي الكفتين أثقل؟ (تذكر: ١ كجم = ١٠٠٠ جم)',
          },
          options: [
            leftLabel,
            rightLabel,
            { en: 'Both are equal', ar: 'الكفتان متساويتان' },
          ],
          correctIndex,
          hint: {
            en: `${kgCount} kg = ${kgInGrams} g. Compare ${leftG} g and ${rightG} g!`,
            ar: `${kgCount} كجم = ${kgInGrams} جم. قارن بين ${leftG} جم و ${rightG} جم!`,
          },
        },
      };
    }

    if (level === 3 || (level === 5 && i % 2 === 0)) {
      // Find missing grams to balance 1 kg (1000 g) or 2 kg (2000 g)
      const targetKg = level === 5 ? pickOne([1, 2]) : 1;
      const targetG = targetKg * 1000;
      const partA = randInt(2, targetKg * 10 - 2) * 100;
      const missing = targetG - partA;
      const numOpts = buildNumberOptions(missing, [-200, -100, 100, 200, 300], 100);
      const correctIndex = numOpts.indexOf(missing);

      return {
        signature: `mass-fill-${targetG}-${partA}`,
        item: {
          id: uid('mass', i),
          kind: 'mass_or_unit',
          leftLabel: { en: `${partA} g + ? g`, ar: `${partA} جم + ؟ جم` },
          rightLabel: { en: `${targetKg} kg`, ar: `${targetKg} كجم` },
          leftWeightGrams: targetG,
          rightWeightGrams: targetG,
          prompt: {
            en: `How many more grams balance ${targetKg} kg (${targetG} g)?`,
            ar: `كم جرامًا نضيف ليصبح الميزان متساويًا مع ${targetKg} كجم (${targetG} جم)؟`,
          },
          options: numOpts.map((n) => ({ en: `${n} g`, ar: `${n} جم` })),
          correctIndex,
          hint: {
            en: `${targetG} g − ${partA} g = ${missing} g!`,
            ar: `${targetG} جم − ${partA} جم = ${missing} جم!`,
          },
        },
      };
    }

    // Level 5 odd rounds: procedural sum of two gram weights in kg or g
    const a = pickOne([500, 250, 750, 1000]);
    const b = a === 250 ? 750 : a === 750 ? 250 : a;
    const totalKg = (a + b) / 1000;
    const opts = shuffle([
      { val: totalKg, label: { en: `${totalKg} kg`, ar: `${totalKg} كجم` } },
      { val: totalKg + 1, label: { en: `${totalKg + 1} kg`, ar: `${totalKg + 1} كجم` } },
      { val: totalKg + 2, label: { en: `${totalKg + 2} kg`, ar: `${totalKg + 2} كجم` } },
    ]);
    const correctIndex = opts.findIndex((o) => o.val === totalKg);

    return {
      signature: `mass-sum-${a}-${b}`,
      item: {
        id: uid('mass', i),
        kind: 'mass_or_unit',
        leftLabel: { en: `${a} g + ${b} g`, ar: `${a} جم + ${b} جم` },
        rightLabel: { en: `? kg`, ar: `؟ كجم` },
        leftWeightGrams: a + b,
        rightWeightGrams: a + b,
        prompt: {
          en: `${a} g + ${b} g equals how many kilograms?`,
          ar: `${a} جم + ${b} جم تساوي كم كيلوجرام؟`,
        },
        options: opts.map((o) => o.label),
        correctIndex,
        hint: {
          en: `${a} + ${b} = ${a + b} g, and every 1000 g = 1 kg!`,
          ar: `${a} + ${b} = ${a + b} جم، وكل ١٠٠٠ جم = ١ كجم!`,
        },
      },
    };
  });
}

interface ShapeSpec {
  kind: ShapeKind;
  name: BilingualText;
  is3D: boolean;
  sidesOrFaces: number;
  vertices: number;
}

const ALL_SHAPES: ShapeSpec[] = [
  { kind: 'triangle', name: { en: 'Triangle', ar: 'مثلث' }, is3D: false, sidesOrFaces: 3, vertices: 3 },
  { kind: 'square', name: { en: 'Square', ar: 'مربع' }, is3D: false, sidesOrFaces: 4, vertices: 4 },
  { kind: 'rectangle', name: { en: 'Rectangle', ar: 'مستطيل' }, is3D: false, sidesOrFaces: 4, vertices: 4 },
  { kind: 'pentagon', name: { en: 'Pentagon', ar: 'خماسي' }, is3D: false, sidesOrFaces: 5, vertices: 5 },
  { kind: 'hexagon', name: { en: 'Hexagon', ar: 'سداسي' }, is3D: false, sidesOrFaces: 6, vertices: 6 },
  { kind: 'cube', name: { en: 'Cube', ar: 'مكعب' }, is3D: true, sidesOrFaces: 6, vertices: 8 },
  { kind: 'cylinder', name: { en: 'Cylinder', ar: 'أسطوانة' }, is3D: true, sidesOrFaces: 2, vertices: 0 },
  { kind: 'pyramid', name: { en: 'Pyramid', ar: 'هرم' }, is3D: true, sidesOrFaces: 5, vertices: 5 },
];

function genShapes(level: LevelNumber, count: number): WorkshopQuestion[] {
  return generateUniqueList<WorkshopQuestion>(count, (i) => {
    const shapes2D = ALL_SHAPES.filter((s) => !s.is3D);
    const shapes3D = ALL_SHAPES.filter((s) => s.is3D);

    if (level === 1 || level === 3) {
      const pool = level === 1 ? shapes2D : shapes3D;
      const target = pickOne(pool);
      const others = shuffle(ALL_SHAPES.filter((s) => s.kind !== target.kind)).slice(0, 3);
      const opts = shuffle([target, ...others]);
      const correctIndex = opts.findIndex((o) => o.kind === target.kind);

      return {
        signature: `shp-name-${target.kind}-${i % 2}`,
        item: {
          id: uid('shp', i),
          kind: 'fraction_or_shape',
          subKind: 'shape',
          shape: target.kind,
          options: opts.map((o) => o.name),
          correctIndex,
          prompt: {
            en: level === 1 ? 'What is the name of this 2D shape?' : 'What is the name of this 3D solid shape?',
            ar: level === 1 ? 'ما اسم هذا الشكل الهندسي؟' : 'ما اسم هذا المجسم ثلاثي الأبعاد؟',
          },
          hint: {
            en: target.is3D
              ? `This 3D solid has ${target.sidesOrFaces} flat faces!`
              : `Count its sides: ${target.sidesOrFaces} sides and ${target.vertices} vertices!`,
            ar: target.is3D
              ? `لهذا المجسم ${target.sidesOrFaces} أوجه مستوية!`
              : `عدّ أضلاعه: له ${target.sidesOrFaces} أضلاع و ${target.vertices} رؤوس!`,
          },
        },
      };
    }

    const pool = level === 2 ? shapes2D : level === 4 ? shapes3D : ALL_SHAPES;
    const target = pickOne(pool);
    const askVertices = level === 5 && Math.random() < 0.45;
    const answerNum = askVertices ? target.vertices : target.sidesOrFaces;
    const numOpts = buildNumberOptions(answerNum, [-2, -1, 1, 2, 3], 0);
    const correctIndex = numOpts.indexOf(answerNum);

    const unitEn = askVertices ? 'vertices' : target.is3D ? 'flat faces' : 'sides';
    const unitAr = askVertices ? 'رؤوس' : target.is3D ? 'أوجه' : 'أضلاع';

    return {
      signature: `shp-attr-${target.kind}-${askVertices ? 'v' : 's'}`,
      item: {
        id: uid('shp', i),
        kind: 'fraction_or_shape',
        subKind: 'shape',
        shape: target.kind,
        options: numOpts.map((n) => ({ en: `${n} ${unitEn}`, ar: `${n} ${unitAr}` })),
        correctIndex,
        prompt: {
          en: `How many ${unitEn} does this ${target.name.en} have?`,
          ar: `كم عدد ${unitAr} هذا ${target.name.ar}؟`,
        },
        hint: {
          en: `Tap Hint to inspect: a ${target.name.en} has ${answerNum} ${unitEn}!`,
          ar: `عدد ${unitAr} ${target.name.ar} هو ${answerNum}!`,
        },
      },
    };
  });
}

function fractionName(num: number, den: number): BilingualText {
  const namesEn: Record<string, string> = {
    '1/2': '1/2 (Half)',
    '1/3': '1/3 (Third)',
    '2/3': '2/3 (Two Thirds)',
    '1/4': '1/4 (Quarter)',
    '2/4': '2/4 (Two Quarters)',
    '3/4': '3/4 (Three Quarters)',
  };
  const namesAr: Record<string, string> = {
    '1/2': '١/٢ (نصف)',
    '1/3': '١/٣ (ثلث)',
    '2/3': '٢/٣ (ثلثان)',
    '1/4': '١/٤ (ربع)',
    '2/4': '٢/٤ (ربعان)',
    '3/4': '٣/٤ (ثلاثة أرباع)',
  };
  const key = `${num}/${den}`;
  return {
    en: namesEn[key] ?? key,
    ar: namesAr[key] ?? key,
  };
}

function genFractions(level: LevelNumber, count: number): WorkshopQuestion[] {
  const denPool: Record<LevelNumber, number[]> = {
    1: [2, 4],
    2: [3, 4],
    3: [5, 6],
    4: [8],
    5: [2, 3, 4, 5, 6, 8],
  };

  return generateUniqueList<WorkshopQuestion>(count, (i) => {
    const den = pickOne(denPool[level]);
    const num = randInt(1, den - 1);
    const ansKey = `${num}/${den}`;

    const distractorKeys = new Set<string>([ansKey]);
    let safety = 0;
    while (distractorKeys.size < 4 && safety < 50) {
      safety++;
      const dDen = pickOne([2, 3, 4, 5, 6, 8]);
      const dNum = randInt(1, dDen - 1);
      // Avoid mathematically equivalent distractors like 2/4 when answer is 1/2
      if (dNum * den !== num * dDen) {
        distractorKeys.add(`${dNum}/${dDen}`);
      }
    }
    const keys = shuffle(Array.from(distractorKeys));
    const correctIndex = keys.indexOf(ansKey);

    return {
      signature: `frac-${num}-${den}`,
      item: {
        id: uid('frac', i),
        kind: 'fraction_or_shape',
        subKind: 'fraction',
        fractionTotalParts: den,
        fractionShadedParts: num,
        options: keys.map((k) => {
          const [n, d] = k.split('/').map(Number);
          return fractionName(n, d);
        }),
        correctIndex,
        prompt: {
          en: 'What fraction of the circle is shaded?',
          ar: 'ما الكسر الذي يمثل الجزء المظلل من الدائرة؟',
        },
        hint: {
          en: `${num} shaded out of ${den} equal parts = ${num}/${den}!`,
          ar: `${num} جزء مظلل من إجمالي ${den} أجزاء متساوية = ${num}/${den}!`,
        },
      },
    };
  });
}

const GRAPH_CATEGORIES: { label: BilingualText; color: string }[][] = [
  [
    { label: { en: 'Mango', ar: 'مانجو' }, color: '#F59E0B' },
    { label: { en: 'Dates', ar: 'تمر' }, color: '#B45309' },
    { label: { en: 'Figs', ar: 'تين' }, color: '#8B5CF6' },
  ],
  [
    { label: { en: 'Boats', ar: 'قوارب' }, color: '#0284C7' },
    { label: { en: 'Camels', ar: 'جمال' }, color: '#D97706' },
    { label: { en: 'Lanterns', ar: 'فوانيس' }, color: '#0D9488' },
  ],
];

function genGraphs(level: LevelNumber, count: number): WorkshopQuestion[] {
  return generateUniqueList<WorkshopQuestion>(count, (i) => {
    const palette = pickOne(GRAPH_CATEGORIES);
    // Pick 3 strictly distinct counts so max/min are always unambiguous!
    const nums = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
    const bars = palette.map((p, idx) => ({ ...p, count: nums[idx] }));

    const mode =
      level === 1
        ? 'most'
        : level === 2
        ? 'least'
        : level === 3
        ? 'diff'
        : level === 4
        ? 'total'
        : pickOne(['diff', 'total', 'most'] as const);

    if (mode === 'most' || mode === 'least') {
      const sorted = [...bars].sort((a, b) =>
        mode === 'most' ? b.count - a.count : a.count - b.count
      );
      const winner = sorted[0];
      const opts = shuffle(bars);
      const correctIndex = opts.findIndex((b) => b.label.en === winner.label.en);

      return {
        signature: `gr-${mode}-${nums.join('-')}`,
        item: {
          id: uid('gr', i),
          kind: 'fraction_or_shape',
          subKind: 'graph',
          graphBars: bars,
          options: opts.map((b) => ({
            en: `${b.label.en} (${b.count})`,
            ar: `${b.label.ar} (${b.count})`,
          })),
          correctIndex,
          prompt:
            mode === 'most'
              ? {
                  en: 'Which item has the MOST on the bar graph?',
                  ar: 'أي عمود يمثل العدد الأكثر في الرسم البياني؟',
                }
              : {
                  en: 'Which item has the LEAST on the bar graph?',
                  ar: 'أي عمود يمثل العدد الأقل في الرسم البياني؟',
                },
          hint:
            mode === 'most'
              ? {
                  en: `Look for the tallest bar: ${winner.label.en} has ${winner.count}!`,
                  ar: `انظر لأطول عمود: ${winner.label.ar} عدده ${winner.count}!`,
                }
              : {
                  en: `Look for the shortest bar: ${winner.label.en} has ${winner.count}!`,
                  ar: `انظر لأقصر عمود: ${winner.label.ar} عدده ${winner.count}!`,
                },
        },
      };
    }

    if (mode === 'diff') {
      const [a, b] = shuffle(bars).slice(0, 2);
      const bigger = a.count > b.count ? a : b;
      const smaller = a.count > b.count ? b : a;
      const diff = bigger.count - smaller.count;
      const numOpts = buildNumberOptions(diff, [-2, -1, 1, 2, 3], 1);
      const correctIndex = numOpts.indexOf(diff);

      return {
        signature: `gr-diff-${bigger.count}-${smaller.count}-${bigger.label.en}`,
        item: {
          id: uid('gr', i),
          kind: 'fraction_or_shape',
          subKind: 'graph',
          graphBars: bars,
          options: numOpts.map((n) => ({ en: `${n}`, ar: `${n}` })),
          correctIndex,
          prompt: {
            en: `How many more ${bigger.label.en} than ${smaller.label.en} are shown?`,
            ar: `بكم يزيد ${bigger.label.ar} عن ${smaller.label.ar} في الرسم البياني؟`,
          },
          hint: {
            en: `Subtract the smaller bar from the larger bar: ${bigger.count} − ${smaller.count}!`,
            ar: `اطرح العمود الأصغر من الأكبر: ${bigger.count} − ${smaller.count}!`,
          },
        },
      };
    }

    const total = bars.reduce((s, b) => s + b.count, 0);
    const numOpts = buildNumberOptions(total, [-3, -2, -1, 1, 2, 3], 3);
    const correctIndex = numOpts.indexOf(total);

    return {
      signature: `gr-tot-${nums.join('-')}`,
      item: {
        id: uid('gr', i),
        kind: 'fraction_or_shape',
        subKind: 'graph',
        graphBars: bars,
        options: numOpts.map((n) => ({ en: `${n}`, ar: `${n}` })),
        correctIndex,
        prompt: {
          en: 'How many items are shown altogether on the bar graph?',
          ar: 'كم إجمالي العناصر معًا في الرسم البياني؟',
        },
        hint: {
          en: `Add all three bars: ${bars.map((b) => b.count).join(' + ')}!`,
          ar: `اجمع الأعمدة الثلاثة: ${bars.map((b) => b.count).join(' + ')}!`,
        },
      },
    };
  });
}

/* ============================================================================
   UNIFIED PROCEDURAL EXAM GENERATOR (CALLED ON EVERY GAME START & REPLAY)
   ============================================================================ */
export function generateSubjectQuestions(
  subjectId: SubjectId,
  levelNumber: LevelNumber,
  count: number
): ActiveQuestion[] {
  switch (subjectId) {
    case 'place_value':
      return genPlaceValue(levelNumber, count).map((data) => ({ stage: 'bazaar', data }));
    case 'money':
      return genMoney(levelNumber, count).map((data) => ({ stage: 'bazaar', data }));
    case 'vertical_math':
      return genVerticalMath(levelNumber, count).map((data) => ({ stage: 'nile', data }));
    case 'arrays':
      return genArrays(levelNumber, count).map((data) => ({ stage: 'nile', data }));
    case 'clock':
      return genClock(levelNumber, count).map((data) => ({ stage: 'clock', data }));
    case 'calendar':
      return genCalendar(levelNumber, count).map((data) => ({ stage: 'clock', data }));
    case 'length':
      return genLength(levelNumber, count).map((data) => ({ stage: 'workshop', data }));
    case 'capacity':
      return genCapacity(levelNumber, count).map((data) => ({ stage: 'workshop', data }));
    case 'mass':
      return genMass(levelNumber, count).map((data) => ({ stage: 'workshop', data }));
    case 'shapes':
      return genShapes(levelNumber, count).map((data) => ({ stage: 'workshop', data }));
    case 'fractions':
      return genFractions(levelNumber, count).map((data) => ({ stage: 'workshop', data }));
    case 'graphs':
      return genGraphs(levelNumber, count).map((data) => ({ stage: 'workshop', data }));
  }
}
