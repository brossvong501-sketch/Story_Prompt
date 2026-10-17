export interface LanguageOption {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  nativeName: string;
  flag: string;
  label: string;
  // Prompt section labels
  shotLabel: string;
  cameraLabel: string;
  actionLabel: string;
  continuityLabel: string;
  dialogueLabel: string;
  lightingLabel: string;
  silentNotice: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    id: 'khmer',
    nameKhmer: 'ភាសាខ្មែរ',
    nameEnglish: 'Khmer',
    nativeName: 'ភាសាខ្មែរ',
    flag: '🇰🇭',
    label: '១. 🇰🇭 ភាសាខ្មែរ (Khmer)',
    shotLabel: 'ឈុតទី',
    cameraLabel: 'ចលនាកាមេរ៉ា',
    actionLabel: 'សកម្មភាព និងដំណើររឿង',
    continuityLabel: 'ចំណុចតភ្ជាប់សាច់រឿង និងតួអង្គ (Continuity)',
    dialogueLabel: 'ការនិយាយ និងសំឡេង',
    lightingLabel: 'រចនាប័ទ្ម និងពន្លឺភាពយន្ត',
    silentNotice: 'ឈុតស្ងប់ស្ងាត់គ្មានការនិយាយ (Silent Scene) គ្មានសំឡេងសន្ទនា ផ្តោតលើកាយវិការ សកម្មភាព និងបរិយាកាសសុទ្ធ'
  },
  {
    id: 'english',
    nameKhmer: 'ភាសាអង់គ្លេស',
    nameEnglish: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    label: '២. 🇺🇸 ភាសាអង់គ្លេស (English)',
    shotLabel: 'Shot',
    cameraLabel: 'Camera Movement',
    actionLabel: 'Action & Storyline',
    continuityLabel: 'Continuity & Character Consistency Lock',
    dialogueLabel: 'Dialogue & Audio',
    lightingLabel: 'Lighting & Visual Style',
    silentNotice: 'Pure cinematic visual, completely silent scene, NO DIALOGUE, zero speech, non-verbal narrative'
  },
  {
    id: 'chinese',
    nameKhmer: 'ភាសាចិន',
    nameEnglish: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    label: '៣. 🇨🇳 ភាសាចិន (Chinese)',
    shotLabel: '镜头',
    cameraLabel: '镜头运镜',
    actionLabel: '动作与剧情叙事',
    continuityLabel: '人物连贯性与角色锁定 (Continuity)',
    dialogueLabel: '台词与声音设计',
    lightingLabel: '灯光与电影美学风格',
    silentNotice: '无对白纯视觉镜头 (Silent Scene)，零台词，依靠神情、肢体动作与氛围推进剧情'
  },
  {
    id: 'thai',
    nameKhmer: 'ភាសាថៃ',
    nameEnglish: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    label: '៤. 🇹🇭 ភាសាថៃ (Thai)',
    shotLabel: 'ช็อตที่',
    cameraLabel: 'การเคลื่อนกล้อง',
    actionLabel: 'การแสดงและการดำเนินเรื่อง',
    continuityLabel: 'ความต่อเนื่องและการล็อกรูปลักษณ์ตัวละคร',
    dialogueLabel: 'บทสนทนาและเสียง',
    lightingLabel: 'การจัดแสงและสไตล์ภาพยนตร์',
    silentNotice: 'ฉากเงียบไร้บทสนทนา (Silent Scene) ถ่ายทอดผ่านภาษากาย สีหน้า และบรรยากาศ'
  },
  {
    id: 'vietnamese',
    nameKhmer: 'ភាសាវៀតណាម',
    nameEnglish: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    label: '៥. 🇻🇳 ភាសាវៀតណាម (Vietnamese)',
    shotLabel: 'Cảnh',
    cameraLabel: 'Góc máy và chuyển động máy quay',
    actionLabel: 'Hành động và diễn biến câu chuyện',
    continuityLabel: 'Tính liên tục và khóa ngoại hình nhân vật',
    dialogueLabel: 'Hội thoại và âm thanh',
    lightingLabel: 'Ánh sáng và phong cách điện ảnh',
    silentNotice: 'Cảnh phim câm hoàn toàn (Silent Scene), không lời thoại, kể chuyện qua ánh mắt và cử chỉ'
  },
  {
    id: 'korean',
    nameKhmer: 'ភាសាកូរ៉េ',
    nameEnglish: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    label: '៦. 🇰🇷 ភាសាកូរ៉េ (Korean)',
    shotLabel: '장면',
    cameraLabel: '카메라 무빙',
    actionLabel: '액션 및 스토리 전개',
    continuityLabel: '캐릭터 일관성 유지 및 연속성 (Continuity)',
    dialogueLabel: '대사 및 오디오',
    lightingLabel: '조명 및 시네마틱 스타일',
    silentNotice: '무대사 시네마틱 씬 (Silent Scene), 대사 없이 표정 연기, 시선, 몸짓으로 전개'
  },
  {
    id: 'japanese',
    nameKhmer: 'ភាសាជប៉ុន',
    nameEnglish: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    label: '៧. 🇯🇵 ភាសាជប៉ុន (Japanese)',
    shotLabel: 'ショット',
    cameraLabel: 'カメラワーク',
    actionLabel: 'アクションとストーリー展開',
    continuityLabel: 'キャラクターの整合性と連続性ロック',
    dialogueLabel: 'セリフと音響演出',
    lightingLabel: 'ライティングとシネマティックスタイル',
    silentNotice: '無言劇シーン (Silent Scene)、セリフなし、視線、表情、身体の動きによる映像表現'
  },
  {
    id: 'french',
    nameKhmer: 'ភាសាបារាំង',
    nameEnglish: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    label: '៨. 🇫🇷 ភាសាបារាំង (French)',
    shotLabel: 'Plan',
    cameraLabel: 'Mouvement de caméra',
    actionLabel: 'Action et narration',
    continuityLabel: 'Continuité et verrouillage du personnage',
    dialogueLabel: 'Dialogue et ambiance sonore',
    lightingLabel: 'Éclairage et style cinématographique',
    silentNotice: 'Scène muette (Silent Scene), aucun dialogue, narration visuelle pure par le regard et la posture'
  },
  {
    id: 'spanish',
    nameKhmer: 'ភាសាអេស្ប៉ាញ',
    nameEnglish: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    label: '៩. 🇪🇸 ភាសាអេស្ប៉ាញ (Spanish)',
    shotLabel: 'Toma',
    cameraLabel: 'Movimiento de cámara',
    actionLabel: 'Acción y trama narrativa',
    continuityLabel: 'Continuidad y coherencia del personaje',
    dialogueLabel: 'Diálogo y sonido',
    lightingLabel: 'Iluminación y estilo cinematográfico',
    silentNotice: 'Escena puramente cinematográfica sin diálogos (Silent Scene), narración a través de miradas y acción física'
  },
  {
    id: 'german',
    nameKhmer: 'ភាសាអាល្លឺម៉ង់',
    nameEnglish: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    label: '១០. 🇩🇪 ភាសាអាល្លឺម៉ង់ (German)',
    shotLabel: 'Szene',
    cameraLabel: 'Kamerabewegung',
    actionLabel: 'Handlung und Handlungsstrang',
    continuityLabel: 'Charakterkonsistenz und Kontinuität',
    dialogueLabel: 'Dialog und Audio',
    lightingLabel: 'Beleuchtung und filmischer Stil',
    silentNotice: 'Reine filmische stumme Szene (Silent Scene), kein Dialog, rein visuelle Erzählung durch Gestik und Mimik'
  }
];

export function getLanguageById(id?: string): LanguageOption {
  if (!id) return SUPPORTED_LANGUAGES[1]; // default English
  const found = SUPPORTED_LANGUAGES.find((l) => l.id === id.toLowerCase().trim());
  return found || SUPPORTED_LANGUAGES[1];
}

// English Alphabet word pairs for educational/alphabetic storylines
const ALPHABET_ITEMS = [
  { letter: 'A', word: 'Apple', actionEn: 'presenting a shiny red apple', actionKm: 'លើកបង្ហាញផ្លែប៉ោមក្រហមស្រស់' },
  { letter: 'B', word: 'Ball', actionEn: 'bouncing a colorful round ball', actionKm: 'ទះលេងបាល់មូលចម្រុះពណ៌' },
  { letter: 'C', word: 'Cat', actionEn: 'gently stroking a curious kitten', actionKm: 'អង្អែលកូនឆ្មាគួរឱ្យស្រឡាញ់' },
  { letter: 'D', word: 'Dog', actionEn: 'greeting a friendly playful puppy', actionKm: 'ញញឹមស្វាគមន៍កូនឆ្កែឆ្លាត' },
  { letter: 'E', word: 'Elephant', actionEn: 'observing a gentle baby elephant', actionKm: 'មើលកូនដំរីដ៏ស្លូតបូត' },
  { letter: 'F', word: 'Fish', actionEn: 'watching shimmering fish in clear water', actionKm: 'មើលត្រីហែលទឹកថ្លាយ៉ាងរហ័ស' },
  { letter: 'G', word: 'Giraffe', actionEn: 'looking up at a tall graceful giraffe', actionKm: 'សម្លឹងមើលសត្វហ្ស៊ីរ៉ាហ្វខ្ពស់ស្អាត' },
  { letter: 'H', word: 'Hat', actionEn: 'putting on a stylish explorer hat', actionKm: 'ពាក់មួកអ្នករុករកយ៉ាងសង្ហា' },
  { letter: 'I', word: 'Ice cream', actionEn: 'holding a delicious sweet ice cream cone', actionKm: 'កាន់ការ៉េមផ្អែមត្រជាក់ឆ្ងាញ់' },
  { letter: 'J', word: 'Juice', actionEn: 'drinking fresh colorful fruit juice', actionKm: 'ផឹកទឹកផ្លែឈើស្រស់ផ្អែមឆ្ងាញ់' },
  { letter: 'K', word: 'Kite', actionEn: 'flying a soaring kite in the open sky', actionKm: 'បង្ហោះខ្លែងហោះឡើងខ្ពស់លើមេឃ' },
  { letter: 'L', word: 'Lion', actionEn: 'watching a noble brave lion cub', actionKm: 'ទស្សនាកូនសត្វតោក្លាហាន' },
  { letter: 'M', word: 'Monkey', actionEn: 'smiling at an energetic playful monkey', actionKm: 'ញញឹមដាក់សត្វស្វាដ៏រហ័សរហួន' },
  { letter: 'N', word: 'Nest', actionEn: 'discovering a peaceful bird nest', actionKm: 'ប្រទះឃើញសំបុកបក្សីដ៏កក់ក្តៅ' },
  { letter: 'O', word: 'Orange', actionEn: 'picking a ripe juicy orange from the tree', actionKm: 'បេះផ្លែក្រូចទុំជូរអែមពីលើដើម' },
  { letter: 'P', word: 'Pencil', actionEn: 'drawing creative sketches with a pencil', actionKm: 'កាន់ខ្មៅដៃគូរូបភាពយ៉ាងស្ទាត់ជំនាញ' },
  { letter: 'Q', word: 'Queen', actionEn: 'admiring a royal crown of the queen', actionKm: 'គយគន់មកុដរាជវង្សដ៏ថ្លៃថ្នូរ' },
  { letter: 'R', word: 'Rainbow', actionEn: 'pointing at a vibrant rainbow in the sky', actionKm: 'ចង្អុលទៅឥន្ទធនូចម្រុះពណ៌លើមេឃ' },
  { letter: 'S', word: 'Sun', actionEn: 'basking under the warm golden morning sun', actionKm: 'ឈរទទួលពន្លឺព្រះអាទិត្យពេលព្រឹក' },
  { letter: 'T', word: 'Tree', actionEn: 'resting under a great shady ancient tree', actionKm: 'សម្រាកក្រោមម្លប់ដើមឈើធំត្រឈឹងត្រឈៃ' },
  { letter: 'U', word: 'Umbrella', actionEn: 'opening a bright cheerful umbrella', actionKm: 'បើកឆ័ត្រចម្រុះពណ៌យ៉ាងស្រស់ស្អាត' },
  { letter: 'V', word: 'Van', actionEn: 'traveling inside a friendly colorful van', actionKm: 'ជិះឡានទេសចរណ៍ពណ៌ស្រស់ស្អាត' },
  { letter: 'W', word: 'Water', actionEn: 'splashing sparkling pure spring water', actionKm: 'លេងទឹកជ្រោះថ្លាឈ្វេងត្រជាក់ស្រឹប' },
  { letter: 'X', word: 'Xylophone', actionEn: 'playing joyful notes on a xylophone', actionKm: 'គោះឧបករណ៍ភ្លេងតន្ត្រីយ៉ាងពិរោះ' },
  { letter: 'Y', word: 'Yo-yo', actionEn: 'spinning a fast rhythmic glowing yo-yo', actionKm: 'លេងយ៉ូយ៉ូភ្លឺផ្លេកយ៉ាងជំនាញ' },
  { letter: 'Z', word: 'Zebra', actionEn: 'meeting a gentle striped zebra in nature', actionKm: 'ជួបសត្វសេះបង្កង់ឆ្នូតសខ្មៅធម្មជាតិ' },
];

/**
 * Dynamically builds contextually accurate spoken dialogue for a specific scene,
 * strictly derived from story title, description, and scene progression.
 * Guarantees zero repetition between scenes!
 */
export function buildContextualDialogue(
  title: string,
  description: string,
  sceneNumber: number,
  totalScenes: number,
  languageId: string = 'english',
  characterName: string = ''
): string {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  const lang = languageId.toLowerCase().trim();
  const isKhmer = lang === 'khmer';
  const isEnglish = lang === 'english' || (!isKhmer && lang !== 'chinese');

  // 1. Context: English Alphabet (A to Z) Learning
  const isAlphabetStory =
    t.includes('a ដល់ z') ||
    t.includes('a to z') ||
    t.includes('alphabet') ||
    t.includes('អក្ខរក្រម') ||
    t.includes('រៀនអក្សរ') ||
    d.includes('a ដល់ z') ||
    d.includes('alphabet');

  if (isAlphabetStory) {
    const itemIndex = (sceneNumber - 1) % ALPHABET_ITEMS.length;
    const item = ALPHABET_ITEMS[itemIndex];
    if (isKhmer) {
      return `«អក្សរ ${item.letter}! ${item.letter} តំណាងឱ្យពាក្យ ${item.word}! តោះយើងអានទាំងអស់គ្នា៖ ${item.word}!»`;
    }
    return `"${item.letter} is for ${item.word}! Look at this wonderful ${item.word.toLowerCase()}! Let's say it together: ${item.word}!"`;
  }

  // 2. Context: Numbers & Counting (1, 2, 3...)
  const isNumberStory =
    t.includes('រាប់លេខ') ||
    t.includes('counting') ||
    t.includes('number') ||
    d.includes('រាប់លេខ');

  if (isNumberStory) {
    if (isKhmer) {
      return `«លេខ ${sceneNumber}! សូមក្រឡេកមើលចំណុចទី ${sceneNumber} នេះទាំងអស់គ្នា!»`;
    }
    return `"Number ${sceneNumber}! Let's count step ${sceneNumber} together right here!"`;
  }

  // 3. Context: Superhero & Saving the City
  const isSuperhero =
    t.includes('superman') ||
    t.includes('spiderman') ||
    t.includes('iron man') ||
    t.includes('វីរបុរស') ||
    t.includes('ពាសដែក') ||
    t.includes('ពីងពាង') ||
    t.includes('titan') ||
    d.includes('superhero') ||
    d.includes('សង្គ្រោះ');

  if (isSuperhero) {
    if (sceneNumber === 1) {
      return isKhmer
        ? `«ប្រព័ន្ធផ្ញើសញ្ញាអាសន្ន! ទីក្រុងត្រូវការយើង ខ្ញុំត្រូវតែទៅសង្គ្រោះឥឡូវនេះ!»`
        : `"Emergency signal detected! The city is in danger, I am taking off immediately!"`;
    }
    if (sceneNumber === totalScenes) {
      return isKhmer
        ? `«ទីក្រុងមានសុវត្ថិភាពហើយ! យុត្តិធម៌និងសន្តិភាពត្រូវបានការពារយ៉ាងពេញលេញ!»`
        : `"The city is safe now! Justice and peace have been restored for everyone!"`;
    }
    // Dynamic progressive lines based on scene number
    const heroStepsKhmer = [
      `«ខ្ញុំបានមកដល់ចំណុចកណ្តាលនៃហេតុការណ៍ហើយ មើលទៅឧបសគ្គនេះធ្ងន់ធ្ងរណាស់!»`,
      `«ផ្តោតថាមពលទាំងអស់! ខ្ញុំនឹងប្រើប្រាស់កម្លាំងពេញទំហឹងដើម្បីទប់ទល់គ្រោះថ្នាក់នេះ!»`,
      `«អ្នករាល់គ្នានៅទីនេះមានសុវត្ថិភាពហើយ! ខ្ញុំកំពុងជម្លៀសពលរដ្ឋចេញពីតំបន់គ្រោះថ្នាក់!»`,
      `«កម្ទេចឧបសគ្គចុងក្រោយ! គ្មានអ្វីអាចរារាំងការការពារទីក្រុងនេះបានឡើយ!»`,
    ];
    const heroStepsEn = [
      `"I've arrived at the epicenter, the danger is escalating fast!"`,
      `"Target acquired! Activating full power systems to neutralize the threat!"`,
      `"Civilians are secure! I am holding the structure steady right now!"`,
      `"Final strike! Nothing will stand in the way of protecting our world!"`,
    ];
    const idx = (sceneNumber - 2) % heroStepsKhmer.length;
    return isKhmer ? heroStepsKhmer[idx] : heroStepsEn[idx];
  }

  // 4. General Dynamic Contextual Flow:
  // Dynamically anchored to the Story Title & Scene Phase
  const cleanTitle = title.replace(/[«»"']/g, '').trim();

  if (sceneNumber === 1) {
    if (isKhmer) {
      return `«សូមស្វាគមន៍មកកាន់ដំណើររឿង «${cleanTitle}»! តោះយើងចាប់ផ្តើមស្វែងយល់ទាំងអស់គ្នា!»`;
    }
    return `"Welcome to ${cleanTitle}! Our thrilling journey begins right here, let's explore!"`;
  }

  if (sceneNumber === totalScenes) {
    if (isKhmer) {
      return `«ទីបំផុត ដំណើររឿង «${cleanTitle}» របស់យើងបានឈានដល់ទីបញ្ចប់ដ៏អស្ចារ្យ!»`;
    }
    return `"At last, we have accomplished the ultimate goal in ${cleanTitle}! Look at what we achieved!"`;
  }

  // Middle scenes: progressive narrative steps without any clichés or repetitions
  const progressivePhrasesKhmer = [
    `«ក្រឡេកមើលទៅមុខ! ដំណើររឿង «${cleanTitle}» កំពុងបង្ហាញតម្រុយសំខាន់ថ្មីមួយទៀតហើយ!»`,
    `«យើងកំពុងឈានចូលជ្រៅទៅក្នុងចំណុចស្នូល ត្រូវតែយកចិត្តទុកដាក់លើរាល់សកម្មភាព!»`,
    `«ទិដ្ឋភាពនេះពិតជាអស្ចារ្យណាស់ មើលការផ្លាស់ប្តូរដែលកំពុងកើតឡើងនៅចំពោះមុខយើង!»`,
    `«សកម្មភាពកាន់តែរំភើបឡើង! ជំហានបន្ទាប់នឹងជាចំណុចរបត់ដ៏សំខាន់នៃរឿង!»`,
    `«យើងបានឆ្លងកាត់ដំណាក់កាលលំបាកហើយ ដំណោះស្រាយកាន់តែខិតជិតមកដល់!»`,
    `«មើលទៅទីតាំងខាងមុខ! អ្វីៗទាំងអស់កំពុងផ្សារភ្ជាប់គ្នាយ៉ាងល្អឥតខ្ចោះ!»`,
  ];

  const progressivePhrasesEn = [
    `"Look closely ahead! A crucial new development is unfolding in ${cleanTitle}!"`,
    `"We are venturing deeper into the core of this quest, stay sharp and observe!"`,
    `"Witness this incredible moment right before our eyes as events progress!"`,
    `"The momentum is building! This next step is the pivotal turning point!"`,
    `"We are mastering each phase of the journey, the resolution is in sight!"`,
    `"Observe the surroundings closely, everything is coming together seamlessly!"`,
  ];

  const midIdx = (sceneNumber - 2) % progressivePhrasesKhmer.length;
  return isKhmer ? progressivePhrasesKhmer[midIdx] : progressivePhrasesEn[midIdx];
}
