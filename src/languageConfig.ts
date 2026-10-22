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
export interface NarrativeBeat {
  phaseTitleKhmer: string;
  phaseTitleEnglish: string;
  actionDescKhmer: string;
  actionDescEnglish: string;
  continuityKhmer: string;
  continuityEnglish: string;
  cameraKhmer: string;
  cameraEnglish: string;
}

/**
 * Dynamically builds contextually accurate in-character spoken dialogue for a specific scene,
 * strictly derived from story title, description, and episodic narrative progression.
 * Guarantees zero repetition between scenes and NO narrator clichés!
 */
export function buildContextualDialogue(
  title: string,
  description: string,
  sceneNumber: number,
  totalScenes: number,
  languageId: string = 'english',
  characterName: string = ''
): string {
  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();
  const lang = (languageId || 'english').toLowerCase().trim();
  const isKhmer = lang === 'khmer';
  const char = characterName && characterName.trim() ? characterName.trim() : (isKhmer ? 'តួអង្គ' : 'Character');

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
      return `«អក្សរ ${item.letter}! ${item.letter} តំណាងឱ្យពាក្យ ${item.word}! តោះយើងបញ្ចេញសំឡេងទាំងអស់គ្នា៖ ${item.word}!»`;
    }
    return `"${item.letter} is for ${item.word}! Look at this wonderful ${item.word.toLowerCase()}! Let's pronounce it: ${item.word}!"`;
  }

  // 2. Context: Numbers & Counting (1, 2, 3...)
  const isNumberStory =
    t.includes('រាប់លេខ') ||
    t.includes('counting') ||
    t.includes('number') ||
    d.includes('រាប់លេខ');

  if (isNumberStory) {
    if (isKhmer) {
      return `«លេខ ${sceneNumber}! សូមក្រឡេកមើលចំនួនទី ${sceneNumber} នេះទាំងអស់គ្នា!»`;
    }
    return `"Number ${sceneNumber}! Let's count step ${sceneNumber} together right here!"`;
  }

  // 3. Context: Online Scam, Cybercrime, Fraud (ការឆបោក, លួចទិន្នន័យ, បោកបញ្ឆោត)
  const isScamOrCrime =
    t.includes('ឆបោក') ||
    t.includes('scam') ||
    t.includes('បោក') ||
    t.includes('លួច') ||
    t.includes('hacker') ||
    t.includes('លុយ') ||
    t.includes('គណនី') ||
    d.includes('ឆបោក') ||
    d.includes('scam') ||
    d.includes('បោកបញ្ឆោត');

  if (isScamOrCrime) {
    if (sceneNumber === 1) {
      return isKhmer
        ? `«សារនេះចម្លែកខ្លាំងណាស់... ពួកគេទាមទារលេខសម្ងាត់ OTP និងគណនីរបស់ខ្ញុំជាបន្ទាន់?»`
        : `"This urgent message looks suspicious... Why are they demanding my security OTP code immediately?"`;
    }
    if (sceneNumber === totalScenes) {
      return isKhmer
        ? `«ជោគជ័យហើយ! គណនីត្រូវបានការពារសុវត្ថិភាព ហើយភស្តុតាងទាំងអស់ត្រូវបានបញ្ជូនទៅអាជ្ញាធរ!»`
        : `"Success! The account is locked down safely, and all criminal evidence is secured for the cyber unit!"`;
    }
    const scamStepsKhmer = [
      `«កុំទាន់អាលចុចលើតំណភ្ជាប់នោះឱ្យសោះ! នេះគឺជាគេហទំព័រក្លែងបន្លំដើម្បីលួចទិន្នន័យ!»`,
      `«មើលទៅប្រព័ន្ធផ្ទេរប្រាក់! ពួកគេកំពុងព្យាយាមចូលប្រើប្រាស់ពីចម្ងាយ យើងត្រូវតែផ្តាច់អ៊ីនធឺណិតជាបន្ទាន់!»`,
      `«ខ្ញុំបានកត់ត្រាអាសយដ្ឋាន IP និងលេខគណនីក្លែងក្លាយនេះទុកជាភស្តុតាងរួចរាល់ហើយ!»`,
      `«រារាំងការផ្ទេរប្រាក់ភ្លាម! យើងមិនអាចបណ្តោយឱ្យជនឆបោកនេះរួចខ្លួនបានជាដាច់ខាត!»`,
      `«ប្រព័ន្ធសុវត្ថិភាពកំពុងបញ្ច្រាសទិន្នន័យត្រឡប់មកវិញ! យើងជិតតាមទាន់ប្រភពដើមរបស់ពួកគេហើយ!»`,
    ];
    const scamStepsEn = [
      `"Do not click that link! It's a phishing trap designed to steal personal banking credentials!"`,
      `"Look at the unauthorized access attempt! They are trying to siphon funds remotely, cut the connection now!"`,
      `"I've traced the rogue IP address and logged the transaction trail for immediate enforcement!"`,
      `"Freeze the transaction immediately! We will not let these scammers exploit another victim!"`,
      `"Firewalls are holding! We are reversing the breach and isolating the fraud network!"`,
    ];
    const idx = (sceneNumber - 2) % scamStepsKhmer.length;
    return isKhmer ? scamStepsKhmer[idx] : scamStepsEn[idx];
  }

  // 4. Context: Ghost, Horror, Haunted, Mystery (ខ្មោច, ព្រលឹង, ផ្ទះចាស់, អាថ៌កំបាំង)
  const isHorrorOrMystery =
    t.includes('ខ្មោច') ||
    t.includes('ព្រលឹង') ||
    t.includes('ផ្ទះចាស់') ||
    t.includes('រន្ធត់') ||
    t.includes('ghost') ||
    t.includes('horror') ||
    t.includes('haunted') ||
    t.includes('mystery') ||
    t.includes('zombie') ||
    d.includes('ខ្មោច') ||
    d.includes('ព្រឺសម្បុរ');

  if (isHorrorOrMystery) {
    if (sceneNumber === 1) {
      return isKhmer
        ? `«ផ្ទះនេះស្ងាត់ជ្រងំគួរឱ្យព្រឺសម្បុរណាស់... តើអ្នកណាទុកទ្វារចំហបែបនេះ?»`
        : `"This place is deathly silent... Who could have left that heavy wooden door wide open?"`;
    }
    if (sceneNumber === totalScenes) {
      return isKhmer
        ? `«ទីបំផុតយើងបានរួចផុតពីទីនេះហើយ... អាថ៌កំបាំងដ៏រន្ធត់ត្រូវបានលាតត្រដាងក្នុងពន្លឺព្រះអាទិត្យ!»`
        : `"We made it out alive... The ancient haunting mystery is finally put to rest in the morning light!"`;
    }
    const horrorStepsKhmer = [
      `«ឮសំឡេងជើងដើរនៅជាន់ខាងលើទេ? ដូចជាមាននរណាម្នាក់កំពុងសម្លឹងមើលយើងពីទីងងឹត...»`,
      `«ពន្លឺភ្លើងស្រាប់តែរលត់! កុំបែកគ្នាឱ្យសោះ កាន់ពិលឱ្យជាប់ ហើយមើលជុំវិញខ្លួន!»`,
      `«ស្រមោលនោះ... វាហាក់ដូចជាកំពុងចង្អុលបង្ហាញផ្លូវសម្ងាត់ ឬជាការដាស់តឿនយើង?»`,
      `«ខ្យល់ត្រជាក់ស្រឹបបក់កាត់... យើងត្រូវតែស្វែងរកច្រកចេញឱ្យឃើញមុនពេលយប់ជ្រៅ!»`,
      `«កុំងាកក្រោយ! រត់ឆ្ពោះទៅកាន់ពន្លឺនៅមាត់ទ្វារខាងក្រៅឱ្យលឿនបំផុត!»`,
    ];
    const horrorStepsEn = [
      `"Did you hear those footsteps creaking upstairs? Something is watching us from the shadows..."`,
      `"The lights just flickered out! Stay together, keep your flashlight pointed forward!"`,
      `"That silhouette... Is it guarding an escape passage or warning us to turn back?"`,
      `"The temperature just plunged to freezing... We must uncover the key before midnight strikes!"`,
      `"Don't look back! Run toward the doorway into the open air right now!"`,
    ];
    const idx = (sceneNumber - 2) % horrorStepsKhmer.length;
    return isKhmer ? horrorStepsKhmer[idx] : horrorStepsEn[idx];
  }

  // 5. Context: Superhero, Rescue, Urban Mission (វីរបុរស, សង្គ្រោះ, ប្រយុទ្ធ)
  const isSuperhero =
    t.includes('superman') ||
    t.includes('spiderman') ||
    t.includes('iron man') ||
    t.includes('batman') ||
    t.includes('វីរបុរស') ||
    t.includes('ពាសដែក') ||
    t.includes('ពីងពាង') ||
    t.includes('titan') ||
    d.includes('superhero') ||
    d.includes('សង្គ្រោះទីក្រុង');

  if (isSuperhero) {
    if (sceneNumber === 1) {
      return isKhmer
        ? `«សញ្ញាអាសន្នបានបន្លឺឡើង! ទីក្រុងត្រូវការយើង ខ្ញុំត្រូវតែទៅសង្គ្រោះឥឡូវនេះ!»`
        : `"Emergency beacon detected! The city needs us, launching into action immediately!"`;
    }
    if (sceneNumber === totalScenes) {
      return isKhmer
        ? `«ទីក្រុងមានសុវត្ថិភាពហើយ! យុត្តិធម៌និងសន្តិភាពត្រូវបានការពារយ៉ាងពេញលេញ!»`
        : `"The city is safe once more! Justice and protection stand firm for everyone!"`;
    }
    const heroStepsKhmer = [
      `«ខ្ញុំបានមកដល់ចំណុចកណ្តាលនៃហេតុការណ៍ហើយ ត្រូវតែជម្លៀសពលរដ្ឋជាបន្ទាន់!»`,
      `«ផ្តោតថាមពលទាំងអស់! ខ្ញុំនឹងប្រើប្រាស់កម្លាំងពេញទំហឹងដើម្បីទប់ទល់គ្រោះថ្នាក់នេះ!»`,
      `«កុំបារម្ភអីអ្នករាល់គ្នា! ខ្ញុំកំពុងគ្រប់គ្រងស្ថានការណ៍ និងទប់លំនឹងអគារនេះ!»`,
      `«កម្ទេចឧបសគ្គចុងក្រោយ! គ្មានអ្វីអាចរារាំងការការពារទីក្រុងនេះបានឡើយ!»`,
    ];
    const heroStepsEn = [
      `"Arrived at ground zero! Securing civilian evacuation routes first!"`,
      `"Target acquired! Diverting maximum output to neutralize the incoming threat!"`,
      `"Stay calm everyone, you are safe! I've stabilized the perimeter structure!"`,
      `"Final strike! Nothing will stand in the way of protecting this world!"`,
    ];
    const idx = (sceneNumber - 2) % heroStepsKhmer.length;
    return isKhmer ? heroStepsKhmer[idx] : heroStepsEn[idx];
  }

  // 6. Context: Adventure, Ancient Temple, Quest, Jungle (ដំណើរផ្សងព្រេង, ប្រាសាទ, ព្រៃជ្រៅ)
  const isAdventure =
    t.includes('ផ្សងព្រេង') ||
    t.includes('ប្រាសាទ') ||
    t.includes('ព្រៃ') ||
    t.includes('រូងភ្នំ') ||
    t.includes('កំណប់') ||
    t.includes('adventure') ||
    t.includes('temple') ||
    t.includes('jungle') ||
    t.includes('treasure') ||
    d.includes('ផ្សងព្រេង') ||
    d.includes('រុករក');

  if (isAdventure) {
    if (sceneNumber === 1) {
      return isKhmer
        ? `«ទីតាំងក្នុងផែនទីបុរាណគឺនៅត្រង់នេះហើយ... ដំណើររុករកអាថ៌កំបាំងបានចាប់ផ្តើម!»`
        : `"The coordinates from the ancient map lead directly here... The expedition begins now!"`;
    }
    if (sceneNumber === totalScenes) {
      return isKhmer
        ? `«យើងបានរកឃើញហើយ! របកគំហើញប្រវត្តិសាស្ត្រដ៏អស្ចារ្យនេះនឹងត្រូវចងចាំជារៀងរហូត!»`
        : `"We found it! This extraordinary historical discovery will inspire generations forever!"`;
    }
    const advStepsKhmer = [
      `«មើលចម្លាក់បុរាណលើផ្ទាំងថ្មនេះចុះ! វាជាសញ្ញាសម្ងាត់ប្រាប់ពីច្រកចូលខាងក្នុង!»`,
      `«ប្រយ័ត្នជើង! ថ្មនៅត្រង់នេះរអិលខ្លាំងណាស់ កាន់ខ្សែពួរឱ្យជាប់ ហើយឈានទៅមុខយឺតៗ!»`,
      `«ពន្លឺចាំងផ្លេកនៅខាងមុខ... នោះប្រហែលជាវត្ថុបុរាណដែលកប់ទុកជាច្រើនសតវត្សរ៍!»`,
      `«ជិតដល់ហើយ! ប្រើប្រាស់កម្លាំងចុងក្រោយដើម្បីបើកទ្វារថ្មដ៏ធំនេះ!»`,
    ];
    const advStepsEn = [
      `"Examine these stone glyphs! They reveal the hidden mechanism to unlock the inner sanctum!"`,
      `"Watch your footing on this slippery ledge! Hold the rope firm and advance carefully!"`,
      `"A golden gleam reflects in the distance... That must be the long-lost artifact of the ancients!"`,
      `"Almost there! Together, we turn the celestial stone dial to unveil the inner chamber!"`,
    ];
    const idx = (sceneNumber - 2) % advStepsKhmer.length;
    return isKhmer ? advStepsKhmer[idx] : advStepsEn[idx];
  }

  // 7. Context: Romance, Emotional Drama, Friendship (មនោសញ្ចេតនា, មិត្តភាព, ស្នេហា)
  const isRomanceOrDrama =
    t.includes('ស្នេហា') ||
    t.includes('មិត្តភាព') ||
    t.includes('គ្រួសារ') ||
    t.includes('នឹក') ||
    t.includes('ស្រឡាញ់') ||
    t.includes('romance') ||
    t.includes('love') ||
    t.includes('drama') ||
    d.includes('មនោសញ្ចេតនា') ||
    d.includes('អារម្មណ៍');

  if (isRomanceOrDrama) {
    if (sceneNumber === 1) {
      return isKhmer
        ? `«យូរហើយដែលយើងមិនបានជួបគ្នា... ទីកន្លែងនេះនៅតែដដែល មិនប្រែប្រួលឡើយ។»`
        : `"It's been so long since we stood here... Yet this place hasn't changed a bit."`;
    }
    if (sceneNumber === totalScenes) {
      return isKhmer
        ? `«ចាប់ពីពេលនេះទៅ យើងនឹងដើរលើផ្លូវជីវិតនេះជាមួយគ្នាដោយស្នាមញញឹម និងក្តីសង្ឃឹម។»`
        : `"From this moment forward, we walk this journey together with trust and renewed hope."`;
    }
    const dramaStepsKhmer = [
      `«ខ្ញុំចាំបាននូវរាល់ពាក្យសន្យា និងអនុស្សាវរីយ៍ដែលយើងធ្លាប់ឆ្លងកាត់ជាមួយគ្នា។»`,
      `«ទោះបីជាមានការយល់ច្រឡំកន្លងមក ក៏ខ្ញុំមិនដែលបោះបង់ជំនឿចិត្តលើអ្នកឡើយ។»`,
      `«សូមស្តាប់ការបកស្រាយពីបេះដូងពិតរបស់ខ្ញុំ... អ្វីគ្រប់យ៉ាងគឺធ្វើឡើងដើម្បីការពារអ្នក។»`,
      `«ទឹកភ្នែកនេះជាសញ្ញានៃការយល់ចិត្តគ្នា... អរគុណដែលនៅតែឈរក្បែរខ្ញុំក្នុងគ្រាលំបាក។»`,
    ];
    const dramaStepsEn = [
      `"I remember every promise and memory we shared beneath these very skies."`,
      `"Despite past misunderstandings, I never stopped believing in what we built."`,
      `"Listen to what's truly in my heart... Everything I did was to keep our bond safe."`,
      `"These tears mean forgiveness and healing... Thank you for staying by my side."`,
    ];
    const idx = (sceneNumber - 2) % dramaStepsKhmer.length;
    return isKhmer ? dramaStepsKhmer[idx] : dramaStepsEn[idx];
  }

  // 8. General Narrative Storyline Flow:
  // Strictly in-character dialogue anchored to the story situation, zero meta clichés!
  if (sceneNumber === 1) {
    return isKhmer
      ? `«យើងបានមកដល់ចំណុចចាប់ផ្តើមហើយ... ត្រូវតែប្រុងប្រយ័ត្ន និងផ្តោតលើគោលដៅ!»`
      : `"We've reached the starting coordinates... Keep your eyes sharp and stay focused on the mission."`;
  }

  if (sceneNumber === totalScenes) {
    return isKhmer
      ? `«ទីបំផុតយើងបានសម្រេចគោលដៅហើយ! ការខិតខំទាំងអស់ពិតជាទទួលបានលទ្ធផលដ៏គាប់ប្រសើរ!»`
      : `"We finally accomplished the objective! Every ounce of effort was truly worth this victory!"`;
  }

  const generalProgressiveKhmer = [
    `«មើលចំណុចនេះ! នេះជាតម្រុយសំខាន់ដែលតភ្ជាប់ទៅកាន់ជំហានបន្ទាប់!»`,
    `«ឧបសគ្គកាន់តែស្មុគស្មាញឡើង ត្រូវតែរក្សាភាពស្ងប់ស្ងាត់ ហើយធ្វើតាមផែនការ!»`,
    `«ស្ថានការណ៍កំពុងផ្លាស់ប្តូរលឿនណាស់ ចូរប្រមូលកម្លាំងដើម្បីដោះស្រាយចំណុចនេះ!»`,
    `«គ្មានពេលរារែកទៀតទេ! ជំហាននេះជាចំណុចរបត់ដ៏សំខាន់នៃដំណើររឿង!»`,
    `«ជិតដល់ទីបញ្ចប់ហើយ! មួយជំហានទៀតប៉ុណ្ណោះ យើងនឹងដោះស្រាយរឿងនេះបានជោគជ័យ!»`,
  ];

  const generalProgressiveEn = [
    `"Examine this breakthrough! It directly links us to the next crucial step!"`,
    `"The challenge is deepening, maintain composure and follow the operational plan!"`,
    `"The momentum is shifting rapidly, let's combine our focus right now!"`,
    `"There's no hesitation left! This pivotal maneuver changes the outcome of everything!"`,
    `"The final resolution is within reach! One more decisive move and we prevail!"`,
  ];

  const midIdx = (sceneNumber - 2) % generalProgressiveKhmer.length;
  return isKhmer ? generalProgressiveKhmer[midIdx] : generalProgressiveEn[midIdx];
}

/**
 * Builds sequential narrative beats ensuring an unbroken cause-and-effect progression
 * across scenes from Shot 1 to Shot N.
 */
export function buildSequentialNarrativeBeat(
  sceneNumber: number,
  totalScenes: number,
  title: string,
  description: string,
  characterName: string = 'តួអង្គសំខាន់',
  isDialogue: boolean = true
): NarrativeBeat {
  const cleanChar = characterName || 'តួអង្គសំខាន់';
  const cleanTitle = (title || 'ដំណើររឿង').trim();
  const cleanDesc = (description || '').trim();

  if (sceneNumber === 1) {
    return {
      phaseTitleKhmer: 'បើកឆាក និងជួបប្រទះហេតុការណ៍ដំបូង',
      phaseTitleEnglish: 'Inciting Incident & Environment Introduction',
      actionDescKhmer: `បង្ហាញពីវត្តមានដំបូងរបស់ ${cleanChar} នៅក្នុងបរិយាកាស ${cleanDesc || cleanTitle}។ តួអង្គឈានជើងចូលក្នុងទីតាំងដោយការប្រុងប្រយ័ត្ន ក្រឡេកមើលជុំវិញ ហើយប្រទះឃើញសញ្ញាដំបូងនៃបញ្ហាដែលត្រូវដោះស្រាយ។`,
      actionDescEnglish: `First introduction of ${cleanChar} within the setting of ${cleanDesc || cleanTitle}. The character steps forward with keen alertness, observing the surroundings and discovering the catalyst event of the story.`,
      continuityKhmer: `ចាក់សោរអត្តសញ្ញាណតួអង្គ ${cleanChar} មុខមាត់ ភ្នែក សក់ សម្លៀកបំពាក់ ១០០% ដដែល។ ដៃទទេតាមធម្មជាតិ មិនកាន់វត្ថុអ្វីឡើយ។`,
      continuityEnglish: `Strict 100% facial features, eye shape, hairstyle, and clothing consistency for ${cleanChar}. Hands naturally free and empty by default.`,
      cameraKhmer: 'ចលនាកាមេរ៉ារំកិលយឺតៗចូលជិត បង្ហាញទិដ្ឋភាពទូទៅរួមផ្សំជាមួយប្លង់មធ្យម',
      cameraEnglish: 'Slow cinematic pan-in from establishing wide shot into a focused medium shot'
    };
  }

  if (sceneNumber === totalScenes) {
    return {
      phaseTitleKhmer: 'ចំណុចកំពូល និងការសម្រេចគោលដៅជោគជ័យ',
      phaseTitleEnglish: 'Climactic Resolution & Triumph',
      actionDescKhmer: `បន្តផ្ទាល់ពីឈុតមុនបន្ទាប់ពីការតស៊ូដ៏ស្វិតស្វាញ ${cleanChar} ឈានដល់ដំណោះស្រាយចុងក្រោយនៃដំណើររឿង។ ដោយរក្សាសម្លៀកបំពាក់ និងទឹកមុខដដែល តួអង្គក្រឡេកមើលជុំវិញដោយក្តីសង្ឃឹម និងស្នាមញញឹមជ័យជម្នះ។`,
      actionDescEnglish: `Continuing directly from the previous scene after intense efforts, ${cleanChar} achieves the final resolution. Retaining identical appearance and attire, gazing outward with triumphant relief and renewed hope.`,
      continuityKhmer: `រក្សាតួអង្គ ${cleanChar} ទាំងសម្លៀកបំពាក់ ម៉ូតសក់ និងលក្ខណៈសម្គាល់ដដែល ១០០% ភ្ជាប់ពីឈុតមុនដោយគ្មាន jump-cut។`,
      continuityEnglish: `Lock 100% identical clothing, hairstyle, and character model for ${cleanChar}, seamless continuity with zero jump cuts.`,
      cameraKhmer: 'ចលនាកាមេរ៉ាប្លង់ទាបដកថយក្រោយយឺតៗ បង្ហាញទិដ្ឋភាពវីរភាពដ៏អស្ចារ្យ',
      cameraEnglish: 'Cinematic low-angle tracking shot pulling back slowly into a wide epic view'
    };
  }

  // Intermediate scenes: progressive narrative steps
  const progressRatio = sceneNumber / totalScenes;

  if (progressRatio <= 0.4) {
    return {
      phaseTitleKhmer: `ឈុតទី ${sceneNumber}៖ ការឆ្លើយតប និងស្វែងរកតម្រុយបន្ត`,
      phaseTitleEnglish: `Shot ${sceneNumber}: Investigation & First Clue Discovery`,
      actionDescKhmer: `បន្តផ្ទាល់ពីឈុតមុនដោយគ្មានការកាត់ចោល ${cleanChar} ឈានជើងចូលទៅកាន់ចំណុចកណ្តាលនៃ ${cleanDesc || 'ទីតាំង'} ដើម្បីពិនិត្យមើលតម្រុយ និងរៀបចំយុទ្ធសាស្ត្រដោះស្រាយ។`,
      actionDescEnglish: `Continuing immediately from the preceding moment without jump cuts, ${cleanChar} steps toward the center of the setting to inspect critical clues and formulate a strategy.`,
      continuityKhmer: `រក្សាតួអង្គ ${cleanChar} សម្លៀកបំពាក់ដដែល ម៉ូតសក់ដដែល បន្តចលនាពីឈុតមុនយ៉ាងរលូន។`,
      continuityEnglish: `Maintain identical attire, hairstyle, and props for ${cleanChar}, carrying forward motion seamlessly from previous shot.`,
      cameraKhmer: 'ចលនាកាមេរ៉ារំកិលតាមដានសកម្មភាពតួអង្គពីចំហៀងយ៉ាងរលូន',
      cameraEnglish: 'Smooth lateral tracking shot following the character motion with shallow depth of field'
    };
  } else if (progressRatio <= 0.7) {
    return {
      phaseTitleKhmer: `ឈុតទី ${sceneNumber}៖ ដំណើររឿងឈានចូលជ្រៅ និងឧបសគ្គស្មុគស្មាញ`,
      phaseTitleEnglish: `Shot ${sceneNumber}: Deepening Conflict & Rising Stakes`,
      actionDescKhmer: `បន្តពីឈុតមុនបន្ទាប់ពីបានរកឃើញតម្រុយ ស្រាប់តែឧបសគ្គថ្មីមួយបានលេចឡើងចំពោះមុខ ${cleanChar}។ តួអង្គប្រឈមមុខនឹងស្ថានភាពតានតឹងដោយទឹកមុខម៉ឺងម៉ាត់ និងប្រុងប្រយ័ត្នខ្ពស់។`,
      actionDescEnglish: `Picking up immediately from the discovery, a sudden new complication confronts ${cleanChar}. The character responds to the escalating tension with intense focus and tactical caution.`,
      continuityKhmer: `ចាក់សោររូបរាងតួអង្គ ${cleanChar} ដដែល ១០០% ស្របតាមបរិយាកាស និងពន្លឺនៃឈុតមុន។`,
      continuityEnglish: `Strict 100% character face and wardrobe consistency for ${cleanChar}, matching environmental lighting and atmosphere.`,
      cameraKhmer: 'ចលនាកាមេរ៉ារំកិលរង្វិលជុំវិញតួអង្គ បង្កើនភាពរំភើបនិងជម្រៅរូបភាព',
      cameraEnglish: 'Dynamic orbital camera arc intensifying spatial tension and emotional stakes'
    };
  } else {
    return {
      phaseTitleKhmer: `ឈុតទី ${sceneNumber}៖ ចំណុចរបត់ និងការប្តេជ្ញាចិត្តវាយលុក`,
      phaseTitleEnglish: `Shot ${sceneNumber}: Decisive Turning Point & Climax Setup`,
      actionDescKhmer: `បន្តផ្ទាល់ពីការប្រឈមមុខនៃឈុតមុន ${cleanChar} ប្រមូលកម្លាំងទាំងអស់ដើម្បីធ្វើសកម្មភាពដ៏ម៉ឺងម៉ាត់ ដោះស្រាយបញ្ហាស្នូលនៃដំណើររឿងមុនពេលឈានដល់ទីបញ្ចប់។`,
      actionDescEnglish: `Flowing directly from the standoff in the previous scene, ${cleanChar} executes a bold, decisive maneuver to overcome the core challenge before the final outcome.`,
      continuityKhmer: `រក្សាតួអង្គ ${cleanChar} ទាំងស្រុង គ្មានការផ្លាស់ប្តូររូបរាង ឬពណ៌សម្លៀកបំពាក់ឡើយ។`,
      continuityEnglish: `Full continuity lock for ${cleanChar}, preserving exact clothing colors and facial expressions.`,
      cameraKhmer: 'ចលនាកាមេរ៉ារុញចូលជិតយ៉ាងលឿន (Crash Zoom / Push-in) ផ្តោតលើការប្តេជ្ញាចិត្តនៃក្រសែភ្នែក',
      cameraEnglish: 'Fast cinematic push-in focusing closely on the character determined gaze and resolute stance'
    };
  }
}
