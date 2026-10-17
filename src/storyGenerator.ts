/**
 * Fully procedural, dynamic story generator.
 * Generates unique story titles, descriptions, character locks,
 * and cinematic settings purely on the fly from combinatorial narrative pools.
 */

export interface GeneratedStory {
  title: string;
  description: string;
  characters: string;
  categoryId: 'human' | 'animals' | 'plants' | 'toys_3d' | 'mythical';
  characterTypeId: string;
  visualStyle: string;
  dialogueMode: 'with_dialogue' | 'without_dialogue';
  totalDuration: number;
  durationPerPrompt: number;
  promptLanguage: string;
  characterSpokenLanguage: string;
  genreLabel: string;
}

// Procedural building blocks
interface GenreBlueprint {
  id: string;
  label: string;
  categoryIds: Array<'human' | 'animals' | 'plants' | 'toys_3d' | 'mythical'>;
  characterTypeIds: string[];
  titlePrefixes: string[];
  titleCores: string[];
  titleSuffixes: string[];
  settings: string[];
  incidents: string[];
  actions: string[];
  climaxes: string[];
  visualStyles: string[];
  characterTemplates: Array<{
    name: string;
    role: string;
    details: string;
    promptEn: string;
    characterTypeId: string;
    categoryId: 'human' | 'animals' | 'plants' | 'toys_3d' | 'mythical';
  }>;
}

const GENRE_BLUEPRINTS: GenreBlueprint[] = [
  // 1. Cyber & Modern Investigation
  {
    id: 'cyber_investigation',
    label: 'ស៊ើបអង្កេត & បច្ចេកវិទ្យាទំនើប (Cyber Thriller)',
    categoryIds: ['human'],
    characterTypeIds: ['human_young_man', 'human_young_woman', 'human_warrior'],
    titlePrefixes: ['អន្ទាក់នៃ', 'អាថ៌កំបាំងបណ្តាញ', 'ការស៊ើបអង្កេតសម្ងាត់', 'វិបត្តិប្រព័ន្ធ', 'ការទម្លាយទិន្នន័យ'],
    titleCores: ['ការឆបោកតាមអនឡាញ', 'បន្ទប់កុំព្យូទ័រខ្មៅ', 'ឯកសារសម្ងាត់', 'កូដឌីជីថលគ្រោះថ្នាក់', 'បណ្តាញឧក្រិដ្ឋជន'],
    titleSuffixes: ['នៅរាជធានី', 'ក្នុងពិភពងងឹត', 'កណ្តាលអធ្រាត្រ', 'នាទសវត្សរ៍ថ្មី', 'គ្មានផ្លូវគេច'],
    settings: [
      'បន្ទប់កុំព្យូទ័រជួលកណ្តាលក្រុងដែលមានពន្លឺអេក្រង់ភ្លឹបភ្លែតៗ',
      'អគារការិយាល័យខ្ពស់កប់ពពកនាពេលយប់ស្ងាត់',
      'ហាងកាហ្វេស្ងប់ស្ងាត់ដែលមានភ្លើងភ្លឺស្រទន់ និងសម្លេងវាយក្តារចុច'
    ],
    incidents: [
      'បានទទួលសារសម្ងាត់បញ្ជាក់ពីការបោកបញ្ឆោតប្រាក់រាប់លានដុល្លារ',
      'បានដឹងថាគណនីសំខាន់ត្រូវបានក្រុម Hacker វាយប្រហារបិទខ្ទប់',
      'បានរកឃើញភស្តុតាងវីដេអូក្លែងក្លាយ (Deepfake) ដែលបង្កើតដោយ AI គ្មានច្បាប់'
    ],
    actions: [
      'ប្រញាប់លួចចម្លងទិន្នន័យដាក់ចូល Flash Drive មុនពេលប្រព័ន្ធសុវត្ថិភាពបិទទ្វារស្វ័យប្រវត្តិ',
      'ប្រើចំណេះដឹងផ្នែកកូដដើម្បីតាមដានទីតាំង IP Address របស់មេក្លោងពិតប្រាកដ',
      'រត់គេចខ្លួនកាត់តាមច្រកទ្វារក្រោយ និងទូរស័ព្ទរាយការណ៍ជូនសមត្ថកិច្ចជំនាញ'
    ],
    climaxes: [
      'ឈានដល់ការទម្លាយមុខមេក្លោង និងជួយសង្គ្រោះជនរងគ្រោះរាប់រយនាក់ទាន់ពេលវេលា។',
      'បញ្ចប់ដោយជោគជ័យក្នុងការបញ្ជូនឯកសារភស្តុតាង និងបិទប្រព័ន្ធបោកប្រាស់ទាំងស្រុង។',
      'ទម្លុះទ្វារគេចខ្លួនផុតពីការតាមប្រមាញ់ និងប្រគល់ទិន្នន័យដល់អាជ្ញាធរ។'
    ],
    visualStyles: [
      'Cinematic 8K Realistic Film, moody neon cyan and deep amber lighting, 35mm lens, intense thriller atmosphere',
      'Cinematic 8K Masterpiece, dramatic high-contrast lighting, reflective wet asphalt, dark corporate aesthetic',
      'Cinematic 8K Photorealistic, shallow depth of field, cool blue tones, authentic lens flare'
    ],
    characterTemplates: [
      {
        name: 'សុខា (Sokha)',
        role: 'អ្នកវិភាគទិន្នន័យ',
        details: 'យុវជនខ្មែរអាយុ ២៥ ឆ្នាំ រាងស្គមខ្ពស់ សក់ខ្លីខ្មៅស្អាតបាត ពាក់វ៉ែនតាស្តើង អាវយឺតខ្មៅដៃខ្លី និងកាតាបស្ពាយ ភ្នែកមុតស្រួចបង្ហាញការតក់ស្លុត',
        promptEn: 'Photorealistic Asian young man, 25 years old, athletic slender build, wearing casual black t-shirt and slim glasses, expressive worried eyes, cinematic lighting, 8k',
        characterTypeId: 'human_young_man',
        categoryId: 'human'
      },
      {
        name: 'រស្មី (Reaksmey)',
        role: 'អ្នកស៊ើបអង្កេតឌីជីថល',
        details: 'យុវតីវ័យ ២៤ ឆ្នាំ សក់ចងខ្ពស់ ទឹកមុខម៉ឺងម៉ាត់ មានទំនុកចិត្ត ពាក់អាវធំអាវកាក់បែប Smart Casual ភ្នែកបង្ហាញការផ្តោតអារម្មណ៍ខ្ពស់លើអេក្រង់',
        promptEn: 'Photorealistic young Asian woman, 24 years old, determined sharp gaze, neat high ponytail, smart blazer, screen reflections in eyes, 8k cinematic lighting',
        characterTypeId: 'human_young_woman',
        categoryId: 'human'
      }
    ]
  },

  // 2. Ancient Angkor & Archaeological Exploration
  {
    id: 'angkor_adventure',
    label: 'ប្រាសាទបុរាណ & រុករកសម្ងាត់ (Ancient Ruins Quest)',
    categoryIds: ['human'],
    characterTypeIds: ['human_young_woman', 'human_young_man', 'human_warrior'],
    titlePrefixes: ['អាថ៌កំបាំងនៃ', 'ទ្វារថ្មសម្ងាត់', 'កំណប់ដែលកប់បាត់', 'ដំណើររុករក', 'ពន្លឺព្រះសូរិយាលើ'],
    titleCores: ['ប្រាសាទបុរាណអង្គរ', 'បន្ទាយថ្មព្រៃជ្រៅ', 'សិលាចារឹកពិសិដ្ឋ', 'រូបសំណាកនាគរាជ', 'រូងភ្នំព្រះវិហារ'],
    titleSuffixes: ['កណ្តាលព្រៃព្រឹក្សា', 'ដែលកប់រាប់ពាន់ឆ្នាំ', 'នៃដែនដីអច្ឆរិយៈ', 'នាពេលព្រលប់', 'រដូវវស្សា'],
    settings: [
      'ប្រាសាទថ្មបុរាណដែលកប់ជ្រៅក្នុងព្រៃព្រឹក្សា មានឫសឈើធំៗព័ទ្ធជុំវិញជញ្ជាំងថ្ម',
      'ច្រករបៀងថ្មបុរាណដែលមានពន្លឺព្រះអាទិត្យចាំងកាត់ធ្លុះដំបូលបាក់បែក',
      'បន្ទប់សម្ងាត់ក្រោមដីដែលមានចម្លាក់ក្បាច់ផ្កាឈូក និងរណ្តៅទឹកថ្លាដូចកញ្ចក់'
    ],
    incidents: [
      'បានប្រទះឃើញសិលាចារឹកបុរាណមួយផ្ទាំងដែលចង្អុលបង្ហាញផ្លូវចូលទីជម្រៅ',
      'បានធ្វើឱ្យយន្តការថ្មបុរាណរំកិលរបូតបង្ហាញផ្លូវចុះទៅក្រោមដី',
      'បានរកឃើញវត្ថុអនុស្សាវរីយ៍ធ្វើពីមាសសុទ្ធដែលចាំងពន្លឺក្នុងភាពងងឹត'
    ],
    actions: [
      'ប្រើពិលបំភ្លឺមើលគំនូរក្បាច់លើជញ្ជាំងថ្មយ៉ាងយកចិត្តទុកដាក់ និងគូសផែនទីចម្លងទុក',
      'បោះជំហានយ៉ាងប្រយ័ត្នប្រយែងលើផ្ទាំងថ្មរអិល ដើម្បីបញ្ចៀសការរអិលធ្លាក់',
      'ដោះសោយន្តការផ្គុំថ្មបីជ្រុងតាមក្បួនតារាសាស្ត្របុរាណដែលចារលើក្រាំង'
    ],
    climaxes: [
      'ទ្វារថ្មបានបើកចំហរទាំងស្រុង បង្ហាញពីបេតិកភណ្ឌប្រវត្តិសាស្ត្រដ៏អស្ចារ្យដែលមិនធ្លាប់មានអ្នកណាឃើញ។',
      'ការពារវត្ថុបុរាណពិសិដ្ឋឱ្យនៅគង់វង្ស និងស្រាវជ្រាវដឹងពីប្រភពដើមនៃអរិយធម៌។',
      'ជោគជ័យក្នុងការកត់ត្រាព័ត៌មានប្រវត្តិសាស្ត្រ និងវិលត្រឡប់មកក្រៅដោយសុវត្ថិភាព។'
    ],
    visualStyles: [
      'Cinematic 8K Adventure Epic, dramatic volumetric god rays through ancient temple stones, misty jungle atmosphere, 8k resolution',
      'Cinematic 8K National Geographic style, rich mossy stone textures, authentic golden sunlight, dust motes in air',
      'Cinematic 8K Mythological Discovery, mysterious dark stone corridors, warm lantern illumination, realistic depth'
    ],
    characterTemplates: [
      {
        name: 'ចាន់ណារី (Channary)',
        role: 'អ្នកបុរាណវិទូ',
        details: 'យុវតីអ្នកស្រាវជ្រាវវ័យ ២៦ ឆ្នាំ សក់បួងស្អាត ពាក់អាវកាក់ Safari ពណ៌កាគី ស្ពាយកាតាបស្បែកឧបករណ៍វាស់វែង ទឹកមុខឆ្លាតវៃពោរពេញដោយភាពក្លាហាន',
        promptEn: 'Photorealistic female archaeologist, 26 years old, high ponytail, khaki safari vest, holding ancient parchment and flashlight, dust motes in sunbeams, 8k cinematic',
        characterTypeId: 'human_young_woman',
        categoryId: 'human'
      },
      {
        name: 'វីរៈ (Vireak)',
        role: 'អ្នករុករកព្រៃ',
        details: 'យុវជនខ្មែររាងមាំមួន អាយុ ២៧ ឆ្នាំ សម្បុរស្រអែម ពាក់អាវយឺតដៃខ្លី និងកន្សែងក្រមាលើក កាន់ត្រីវិស័យនិងពិល ភ្នែកមុតស្រួច',
        promptEn: 'Photorealistic rugged young explorer, 27 years old, sun-tanned skin, traditional krama, holding compass and field flashlight, determined expression, 8k',
        characterTypeId: 'human_young_man',
        categoryId: 'human'
      }
    ]
  },

  // 3. Wildlife & Nature Adventure
  {
    id: 'wildlife_nature',
    label: 'សត្វព្រៃ & ដំណើរផ្សងព្រេងធម្មជាតិ (Wildlife & Nature)',
    categoryIds: ['animals'],
    characterTypeIds: ['animal_elephant', 'animal_tiger', 'animal_monkey', 'animal_lion'],
    titlePrefixes: ['ដំណើរផ្សងព្រេងរបស់', 'មិត្តភាពកណ្តាលព្រៃនៃ', 'បេសកកម្មសង្គ្រោះរបស់', 'រឿងរ៉ាវអស្ចារ្យនៃ', 'ភាពក្លាហានរបស់'],
    titleCores: ['កូនដំរីឈ្មោះគិរី', 'កូនខ្លាព្រៃឆ្លាត', 'មេហ្វូងស្វាភ្នំ', 'ស្តេចតោរាជ', 'សត្វស្លាបពណ៌មាស'],
    titleSuffixes: ['ក្បែរទឹកជ្រោះជ្រៅ', 'ក្នុងរដូវផ្លាស់ទី', 'កាត់ជ្រលងភ្នំខ្ពស់', 'កណ្តាលព្រៃត្រូពិក', 'ស្វែងរកជម្រក'],
    settings: [
      'ជ្រលងភ្នំព្រៃទឹកភ្លៀងត្រូពិកដែលមានទឹកជ្រោះហូរធ្លាក់កាត់ផ្ទាំងថ្មបៃតង',
      'វាលស្មៅព្រៃធំល្វឹងល្វើយក្រោមកម្តៅថ្ងៃរៀបលិចពណ៌មាសក្រហម',
      'មាត់ទន្លេថ្លាឆ្វង់ដែលមានដើមឈើធំៗគ្របម្លប់ត្រឈឹងត្រឈៃ'
    ],
    incidents: [
      'បានវង្វេងចេញពីហ្វូងដោយសារការដេញតាមមេអំបៅពណ៌ភ្លឺចិញ្ចាច',
      'បានជួបប្រទះនឹងទឹកជំនន់ហូរកាត់ផ្លូវដើរប្រចាំថ្ងៃ',
      'បានឃើញកូនសត្វមួយក្បាលទៀតកំពុងជាប់លើមែកឈើបាក់កណ្តាលទឹកហូរ'
    ],
    actions: [
      'ខិតខំប្រើកម្លាំងជើងនិងប្រមោយតោងមែកឈើយ៉ាងក្លាហានដើម្បីឆ្លងកាត់ទឹកជ្រោះ',
      'បន្លឺសំឡេងហៅរកសមាជិកហ្វូង និងស្តាប់សូរខ្យល់បក់តាមស្លឹកឈើ',
      'ជួយទាញកូនសត្វតូចឱ្យរួចផុតពីគ្រោះថ្នាក់ដោយសេចក្តីមេត្តា'
    ],
    climaxes: [
      'បានជួបជុំហ្វូងវិញយ៉ាងកក់ក្តៅ និងទទួលបានក្តីស្រឡាញ់ពីមេហ្វូង។',
      'ក្លាយជាមិត្តភក្តិល្អ និងបានរកឃើញប្រភពទឹកស្អាតថ្មីសម្រាប់សត្វទាំងអស់។',
      'ឆ្លងកាត់ឧបសគ្គធម្មជាតិដោយជោគជ័យ និងក្លាយជាសត្វក្លាហានក្នុងព្រៃ។'
    ],
    visualStyles: [
      'Cinematic 8K Wildlife Documentary, National Geographic style, warm golden hour, lush tropical rainforest, natural animal fur texture',
      'Cinematic 8K Nature Masterpiece, crystal clear water splashes, atmospheric morning mist, vibrant green flora',
      'Cinematic 8K Wildlife Epic, sunset savanna backlighting, realistic biological details, dynamic motion'
    ],
    characterTemplates: [
      {
        name: 'គិរី (Kiri)',
        role: 'កូនដំរីក្លាហាន',
        details: 'កូនដំរីព្រៃតូចអាយុ ២ ឆ្នាំ ស្បែកជ្រួញពណ៌ប្រផេះធម្មជាតិ ភ្នែកមូលធំស្លូតបូតគួរឱ្យស្រឡាញ់ ប្រមោយតូចរហ័សរហួន',
        promptEn: 'Photorealistic cute baby Asian elephant, 2 years old, soft wrinkled grey skin, big expressive innocent eyes, curious agile trunk, 8k wildlife documentary',
        characterTypeId: 'animal_elephant',
        categoryId: 'animals'
      },
      {
        name: 'រីកូ (Riko)',
        role: 'កូនស្វាឆ្លាតវៃ',
        details: 'សត្វស្វាព្រៃរោមពណ៌ត្នោតមាស ភ្នែកមូលភ្លឺឆ្លាត ចលនារហ័សរហួន តោងមែកឈើដោយភាពប៉ិនប្រសប់',
        promptEn: 'Photorealistic agile young monkey, detailed golden-brown fur texture, sparkling intelligent eyes, swinging on jungle branch, 8k nature',
        characterTypeId: 'animal_monkey',
        categoryId: 'animals'
      }
    ]
  },

  // 4. Cyberpunk & Futuristic Sci-Fi
  {
    id: 'cyberpunk_scifi',
    label: 'ទីក្រុងអនាគត & Sci-Fi (Cyberpunk 2088)',
    categoryIds: ['human', 'toys_3d'],
    characterTypeIds: ['human_warrior', 'toy_mini_robot', 'toy_drone'],
    titlePrefixes: ['បេសកកម្មចុងក្រោយនៅ', 'អ្នកការពារទីក្រុង', 'ពន្លឺនេអុងលើ', 'ការបះបោរនៃ', 'ប្រតិបត្តិការ'],
    titleCores: ['ទីក្រុងអនាគត ២០៨៨', 'ប្រព័ន្ធមេឃស្វ័យប្រវត្ត', 'ស្នូលថាមពល Quantum', 'មនុស្សយន្ត Sentinel', 'អគារមេឃខ្ពស់កប់ពពក'],
    titleSuffixes: ['ក្រោមភ្លៀងធ្លាក់', 'នៃយុគសម័យថ្មី', 'ក្នុងរាត្រីគ្មានថ្ងៃរះ', 'ល្បឿនលឿន', 'កម្រិតពិភពលោក'],
    settings: [
      'ទីក្រុងមេឃអនាគតដែលពោរពេញដោយរថយន្តហោះ ផ្ទាំងពាណិជ្ជកម្ម Hologram និងភ្លៀងធ្លាក់លើផ្លូវកៅស៊ូ',
      'បន្ទប់បញ្ជាកណ្តាលប្រព័ន្ធស្វ័យប្រវត្តដែលមានពន្លឺភ្លើង Neon ខៀវ និងផ្ទាំងកញ្ចក់ថ្លា',
      'ដំបូលអគារខ្ពស់កប់ពពកដែលមើលឃើញទេសភាពទីក្រុងទាំងមូលភ្លឺចែងចាំង'
    ],
    incidents: [
      'ប្រព័ន្ធការពារកូដស្នូលត្រូវបានមេរោគមិនស្គាល់អត្តសញ្ញាណចូលលួច',
      'ដ្រូនសន្តិសុខបាត់បង់ការគ្រប់គ្រង និងចាប់ផ្តើមស្កេនចាប់អ្នកដំណើរទូទៅ',
      'ថាមពលភ្លើងទីក្រុងទាំងមូលប្រឈមនឹងការដាច់ដោយសារការបំផ្លាញម៉ាស៊ីនភ្លើងកណ្តាល'
    ],
    actions: [
      'ប្រើដៃដែក Cybernetic តភ្ជាប់ខ្សែកាបល្បឿនលឿនដើម្បីស្តារទិន្នន័យឡើងវិញ',
      'រត់ផ្លោះពីលើដំបូលអគារមួយទៅមួយទៀតក្រោមដំណក់ភ្លៀង និងគេចពីកាំរស្មីស្កេន',
      'បញ្ចូលកូដបន្សាបមេរោគចូលក្នុងម៉ាស៊ីនមេយ៉ាងប្រញាប់ប្រញាល់'
    ],
    climaxes: [
      'ការពារទីក្រុងទាំងមូលឱ្យរួចផុតពីភាពងងឹត និងស្តារសន្តិសុខជូនប្រជាជន។',
      'បិទប្រព័ន្ធគ្រោះថ្នាក់ទាន់ពេល និងការពារទិន្នន័យសម្ងាត់បានដោយសុវត្ថិភាព។',
      'ក្លាយជាអ្នកការពារយុត្តិធម៌នៃទីក្រុងអនាគតដោយគ្មាននរណាដឹងឈ្មោះពិត។'
    ],
    visualStyles: [
      'Cinematic 8K Cyberpunk Sci-Fi, Blade Runner aesthetic, glowing neon reflections on wet asphalt, anamorphic lens flare, deep shadows',
      'Cinematic 8K Futuristic Masterpiece, high-tech holographic UI, sleek titanium materials, dynamic volumetric rain',
      'Cinematic 8K Tech Thriller, sharp blue and purple neon rim lights, photorealistic textures, motion blur'
    ],
    characterTemplates: [
      {
        name: 'តារា-X (Dara-X)',
        role: 'អ្នកប្រយុទ្ធបច្ចេកវិទ្យា',
        details: 'យុវជនវ័យ ២៧ ឆ្នាំ ដៃស្តាំជាអាវក្រោះដែក Titanium ឆ្លាក់ភ្លើង Neon ខៀវ ពាក់អាវស្បែកវែង Tactical Trench Coat ភ្នែកឆ្វេងជា Cybernetic HUD',
        promptEn: 'Photorealistic cyberpunk operative, 27 years old, titanium cybernetic arm glowing cyan, futuristic tactical trench coat, rain-slicked city reflections, 8k',
        characterTypeId: 'human_warrior',
        categoryId: 'human'
      },
      {
        name: 'ស្ផាកឃី (Sparky)',
        role: 'មនុស្សយន្តជំនួយការ',
        details: 'មនុស្សយន្តតូចរាងមូល ដែកពណ៌សលាយលឿង ភ្នែកអេក្រង់ LED បញ្ចេញទឹកមុខញញឹម ដៃជើងដែកតូចៗហោះហើរដោយកង្ហារមីក្រូ',
        promptEn: 'Cute miniature 3D companion robot, rounded metallic body, glowing LED screen face with happy expressions, hovering in cyberpunk environment, 8k',
        characterTypeId: 'toy_mini_robot',
        categoryId: 'toys_3d'
      }
    ]
  },

  // 5. Mythical & Fantasy Legends
  {
    id: 'mythical_legend',
    label: 'ទេវកថា & រឿងព្រេងខ្មែរ (Khmer Mythology & Fantasy)',
    categoryIds: ['mythical'],
    characterTypeIds: ['myth_dragon', 'myth_angel', 'myth_giant', 'myth_garuda'],
    titlePrefixes: ['រឿងព្រេងនៃ', 'មហិទ្ធិឫទ្ធិ', 'គុជពិសិដ្ឋរបស់', 'ដំណើរយាងនៃ', 'អព្ភូតហេតុ'],
    titleCores: ['ព្រះនាងនាគរាជ', 'ទេវតាប្រោះព្រំ', 'គ្រុឌមាសហោះកាត់មេឃ', 'យក្សកាន់ដំបងពេជ្រ', 'ទន្លេសួគ៌ពិសិដ្ឋ'],
    titleSuffixes: ['លើដែនដីអច្ឆរិយៈ', 'សង្គ្រោះដែនគោក', 'កណ្តាលពពកមាស', 'ក្នុងយប់ពេញបូណ៌មី', 'នៃពិភពបាតទឹក'],
    settings: [
      'រាជវាំងបាតសមុទ្រដែលមានផ្កាថ្មបញ្ចេញពន្លឺចែងចាំង និងរលកទឹកថ្លាដូចកញ្ចក់',
      'កំពូលភ្នំពិសិដ្ឋដែលគ្របដណ្តប់ដោយពពកសដូចសំឡី និងពន្លឺថ្ងៃរស្មីពណ៌មាស',
      'បឹងទឹកពិសិដ្ឋដែលមានផ្កាឈូកយក្សរីកបញ្ចេញក្លិនក្រអូបទូទាំងដែនដី'
    ],
    incidents: [
      'ដែនដីគោកជួបគ្រោះរាំងស្ងួតយូរអង្វែង ធ្វើឱ្យប្រជារាស្ត្រស្រេកឃ្លាន',
      'គុជសួគ៌ពិសិដ្ឋត្រូវបានបិសាចស្រមោលព្យាយាមលួចយកទៅលាក់ក្នុងរូងភ្នំ',
      'មានខ្យល់ព្យុះអាក្រក់កើតឡើងគំរាមកំហែងដល់សេចក្តីសុខសាន្តនៃពិភពទាំងពីរ'
    ],
    actions: [
      'ព្រះនាងនាគីយាងឡើងលើផ្ទៃទឹក និងលើកគុជពិសិដ្ឋបួងសួងសុំទឹកភ្លៀង',
      'ហោះហើរយ៉ាងរហ័សកាត់ពពក និងបញ្ចេញរស្មីពណ៌មាសកម្ចាត់ភាពងងឹត',
      'ប្រើមេត្តាធម៌និងប្រាជ្ញាដើម្បីពន្យល់សម្របសម្រួល និងនាំមកនូវសេចក្តីសុខ'
    ],
    climaxes: [
      'ទឹកភ្លៀងដ៏ត្រជាក់បានធ្លាក់ចុះមក ធ្វើឱ្យធម្មជាតិរីកស្រស់បំព្រង និងប្រជារាស្ត្រសប្បាយរីករាយ។',
      'គុជពិសិដ្ឋត្រឡប់មកកន្លែងដើមវិញ ហើយពន្លឺសន្តិភាពបានគ្របដណ្តប់ទូទាំងពិភពលោក។',
      'ដែនដីទាំងពីរក្លាយជាមិត្តនឹងគ្នា និងរស់នៅប្រកបដោយសុភមង្គល។'
    ],
    visualStyles: [
      'Cinematic 8K Khmer Fantasy Mythology, magical golden and jade aura, ethereal mist, rich traditional details, 8k resolution',
      'Cinematic 8K Divine Fantasy, soft celestial glow, floating lotus petals and light rays, majestic royal architecture',
      'Cinematic 8K Mythological Masterpiece, mystical glowing mist, volumetric epic light, intricate temple carvings'
    ],
    characterTemplates: [
      {
        name: 'ព្រះនាងនាគី (Princess Neang Neak)',
        role: 'ព្រះនាងនាគរាជ',
        details: 'ទេវតានាគរាជស្រស់សោភា គ្រងគ្រឿងអលង្ការមាសបុរាណខ្មែរ ក្បាលពាក់មកុដរាជ ភ្នែកភ្លឺដូចត្បូងមរកត ស្បៃសូត្រពណ៌បៃតងរំលេចក្បាច់មាស',
        promptEn: 'Photorealistic mythical Khmer Naga princess, royal golden crown, emerald silk sampot, divine radiant aura, floating mystical particles, 8k',
        characterTypeId: 'myth_dragon',
        categoryId: 'mythical'
      },
      {
        name: 'ទេវតាធីតា (Celestial Devata)',
        role: 'ទេវតាប្រោះព្រំ',
        details: 'ទេវតាស្រស់ស្អាត ទឹកមុខទន់ភ្លន់បរិសុទ្ធ ពាក់ម្កុដរាជវង្សនិងគ្រឿងអលង្ការទេពអប្សរ បញ្ចេញរស្មីពណ៌មាសជុំវិញខ្លួន',
        promptEn: 'Celestial divine Devata / Angel, ethereal glowing aura, traditional ornate celestial jewelry and crown, radiant peaceful expression, floating gracefully, 8k',
        characterTypeId: 'myth_angel',
        categoryId: 'mythical'
      }
    ]
  },

  // 6. 3D Animation & Chibi Toy
  {
    id: 'chibi_animation',
    label: 'តុក្កតា 3D & កំប្លែង (3D Animation & Chibi Toy)',
    categoryIds: ['toys_3d'],
    characterTypeIds: ['toy_chibi_doll', 'toy_teddy_bear', 'toy_plastic_car', 'toy_gift_box'],
    titlePrefixes: ['បេសកកម្មដ៏អស្ចារ្យរបស់', 'ដំណើរផ្សងព្រេងកំប្លែងនៃ', 'ពិភពវេទមន្តរបស់', 'ការហោះហើរផ្កាយនៃ', 'ថ្ងៃដ៏រីករាយរបស់'],
    titleCores: ['កូនឆ្មាតុក្កតាឡាក់គី', 'ខ្លាឃ្មុំរោមទន់បូបូ', 'ឡានក្រហមក្លាហាន', 'ប្រអប់កាដូរត់លឿន', 'តុក្កតាក្បាលមូល'],
    titleSuffixes: ['លើភពស្ករគ្រាប់', 'ក្នុងបន្ទប់លេងកុមារ', 'រដូវបុណ្យរីករាយ', 'ស្វែងរកផ្កាយធ្លាក់', 'ចុងសប្តាហ៍'],
    settings: [
      'បន្ទប់គេងកុមារដ៏កក់ក្តៅដែលមានប្រដាប់ក្មេងលេងចម្រុះពណ៌ និងពន្លឺថ្ងៃព្រឹកចាំងកាត់បង្អួច',
      'ភពស្ករគ្រាប់ 3D ដែលមានភ្នំសូកូឡា និងស្ទឹងទឹកដោះគោផ្អែមត្រជាក់',
      'សួនកម្សាន្តតូចមួយដែលមានកង់វិលខ្នាតតូច និងពពកស្ករកៅស៊ូ'
    ],
    incidents: [
      'បានឃើញផ្កាយតូចមួយធ្លាក់មកទើរលើកំពូលទូសៀវភៅខ្ពស់',
      'បានរកឃើញសោរមាសវេទមន្តដែលត្រូវដោះស្រាយដើម្បីបើកប្រអប់ស្ករគ្រាប់',
      'មិត្តភក្តិតុក្កតាដទៃទៀតត្រូវការជំនួយក្នុងការសង់ស្ពានឆ្លងស្ទឹងទឹកដោះគោ'
    ],
    actions: [
      'ប្រើជើងតូចៗរត់ផ្លោះពីលើសៀវភៅមួយទៅមួយទៀតដោយកាយវិការកំប្លុកកំប្លែង',
      'ប្រើកន្ទុយរលាស់និងបង្វិលខ្លួនដើម្បីទប់លំនឹងលើបន្ទះឈើ',
      'សហការជាមួយមិត្តភក្តិដោយការរុញប្រអប់ប្លុកផ្គុំតម្រៀបគ្នាធ្វើជាជណ្តើរ'
    ],
    climaxes: [
      'បានយកផ្កាយត្រឡប់មកដាក់លើមេឃវិញ និងទទួលបានស្នាមញញឹមពីមិត្តភក្តិទាំងអស់។',
      'ដោះសោរប្រអប់វេទមន្តជោគជ័យ និងចែករំលែកបង្អែមផ្អែមឆ្ងាញ់ជាមួយគ្នា។',
      'បញ្ចប់ថ្ងៃដ៏សប្បាយរីករាយ និងគេងលង់លក់យ៉ាងកក់ក្តៅក្នុងជម្រក។'
    ],
    visualStyles: [
      '3D Vinyl Art Toy, Pop Mart style, Octane Render, smooth studio lighting, bright saturated pastel colors, 8k render',
      '3D Pixar Disney Style Animation, adorable volumetric character lighting, fluffy fur textures, warm cinematic feel',
      '3D Stylized Stop-Motion aesthetic, tactile clay and felt materials, vibrant cheerful atmosphere'
    ],
    characterTemplates: [
      {
        name: 'ឡាក់គី (Lucky)',
        role: 'កូនឆ្មាអវកាស Chibi',
        details: 'កូនឆ្មាតុក្កតា 3D Chibi ភ្នែកធំៗរលោង រោមសលាយទឹកក្រូចទន់ៗដូចសំឡី ពាក់មួកអវកាសយានិកខ្នាតតូច កន្ទុយរលាស់ញ័រៗ',
        promptEn: 'Ultra cute 3D Chibi doll cat astronaut, big glossy expressive eyes, collectible vinyl toy finish, vibrant colors, 8k render',
        characterTypeId: 'toy_chibi_doll',
        categoryId: 'toys_3d'
      },
      {
        name: 'បូបូ (BoBo)',
        role: 'តុក្កតាខ្លាឃ្មុំចិត្តល្អ',
        details: 'តុក្កតាខ្លាឃ្មុំរោមទន់ពណ៌ត្នោត ភ្នែកគ្រាប់ឃ្លីខ្មៅរលោង មានស្នាមដេរខ្សែអំបោះគួរឱ្យស្រឡាញ់ ពាក់បូកពណ៌ក្រហម',
        promptEn: 'Adorable vintage fluffy teddy bear toy, stitched seams, shiny button eyes, soft plush fur texture, warm cozy lighting, 8k',
        characterTypeId: 'toy_teddy_bear',
        categoryId: 'toys_3d'
      }
    ]
  },

  // 7. Khmer Rural Heritage & Warm Family Life
  {
    id: 'khmer_heritage',
    label: 'ជីវិត & វប្បធម៌ខ្មែរ (Khmer Heritage & Family)',
    categoryIds: ['human'],
    characterTypeIds: ['human_elder_woman', 'human_elder_man', 'human_farmer', 'human_boy'],
    titlePrefixes: ['អាថ៌កំបាំងស្នាដៃ', 'អនុស្សាវរីយ៍ក្បែរ', 'រឿងរ៉ាវផ្ទះបុរាណនៃ', 'ស្នាមញញឹមលើ', 'ភាពកក់ក្តៅនៃ'],
    titleCores: ['ទឹកគ្រឿងស្នាដៃម៉ែ', 'វាលស្រែពណ៌មាស', 'ស្ទឹងសង្កែរដូវវស្សា', 'ចង្ក្រានដីជនបទ', 'ចម្ការត្នោតបុរាណ'],
    titleSuffixes: ['ពេលព្រឹកព្រលឹម', 'នាស្រុកកំណើត', 'ដែលមិនអាចបំភ្លេច', 'កណ្តាលភូមិឋាន', 'រដូវច្រូតកាត់'],
    settings: [
      'ផ្ទះឈើបុរាណខ្មែរក្បែរមាត់ស្ទឹងដែលមានចង្ក្រានដីផ្សែងហុយទ្រលោម និងក្អមទឹកត្រជាក់',
      'វាលស្រែទុំពណ៌មាសល្វឹងល្វើយដែលមានដើមត្នោតខ្ពស់ត្រដែតឈរតម្រៀបគ្នា',
      'ក្រោមផ្ទះឈើដែលមានអង្រឹងយោល ឧបករណ៍នេសាទ និងកូនចៅជួបជុំគ្នា'
    ],
    incidents: [
      'រៀបចំពិធីជួបជុំគ្រួសារ និងចង់ចម្អិនម្ហូបប្រពៃណីខ្មែរដែលបន្សល់ពីដូនតា',
      'រដូវច្រូតកាត់បានមកដល់ ហើយត្រូវការជួយគ្នាប្រមូលផលស្រូវឱ្យទាន់មុនភ្លៀងធ្លាក់',
      'ចៅស្រីចង់រៀនចេះធ្វើម្ហូបបុរាណពីលោកយាយដើម្បីរក្សាកេរមរតក'
    ],
    actions: [
      'លោកយាយយកត្បាល់ថ្មមកបុកគ្រឿងស្លឹកគ្រៃ រមៀត និងម្ទេសយ៉ាងស្ទាត់ជំនាញ',
      'ញញឹមយ៉ាងកក់ក្តៅ និងពន្យល់ប្រាប់ចៅៗពីតម្លៃនៃការស្រឡាញ់គ្រួសារ និងដីស្រែ',
      'លើកចានម្ហូបក្តៅៗមកតម្រៀបលើកន្ទេល និងទទួលទានជុំគ្នាប្រកបដោយសេចក្តីសុខ'
    ],
    climaxes: [
      'ម្ហូបខ្មែរដ៏ឈ្ងុយឆ្ងាញ់បានចម្អិនរួចរាល់ ហើយគ្រប់គ្នាបានជួបជុំគ្នាយ៉ាងកក់ក្តៅ។',
      'ចៅស្រីយល់ច្បាស់ពីតម្លៃនៃវប្បធម៌ដូនតា និងប្តេជ្ញារក្សាទុកឱ្យគង់វង្ស។',
      'គ្រួសារទាំងមូលពោរពេញដោយស្នាមញញឹម និងសុភមង្គលក្នុងភូមិកំណើត។'
    ],
    visualStyles: [
      'Cinematic 8K Realistic Film, warm rustic wooden kitchen, morning golden sunlight, authentic food texture and wood grain',
      'Cinematic 8K Documenting Cambodia, sun-kissed rural fields, gentle breeze through rice paddies, authentic warm atmosphere',
      'Cinematic 8K Heritage Portrait, natural window lighting, 50mm portrait lens, emotional and heartfelt tone'
    ],
    characterTemplates: [
      {
        name: 'លោកយាយសុម៉ាលី (Grandmother Somaly)',
        role: 'លោកយាយមេចុងភៅ',
        details: 'វ័យ ៦៨ ឆ្នាំ សក់សកណ្តុរប្រផេះបួងស្អាត ទឹកមុខស្លូតបូតពោរពេញដោយក្តីស្រឡាញ់ ពាក់អាវប៉ាក់សនិងក្រមាលើស្មា កំពុងបុកគ្រឿង',
        promptEn: 'Photorealistic elderly grandmother, 68 years old, warm loving smile, gentle wrinkled face, traditional neat attire, soft ambient light, 8k',
        characterTypeId: 'human_elder_woman',
        categoryId: 'human'
      },
      {
        name: 'លោកតាគង់ (Grandfather Kong)',
        role: 'កសិករជើងចាស់',
        details: 'លោកតាវ័យ ៧០ ឆ្នាំ សម្បុរស្រអែម ពុកចង្កាស ស្លៀកពាក់អាវកកុកសនិងក្រមា កែវភ្នែកពោរពេញដោយបទពិសោធន៍និងប្រាជ្ញា',
        promptEn: 'Photorealistic elderly Cambodian grandfather, 70 years old, kind weathered face, silver beard, traditional neat krama, rural village lighting, 8k',
        characterTypeId: 'human_elder_man',
        categoryId: 'human'
      }
    ]
  },

  // 8. Superheroes & Epic Protectors (កំពូលវីរបុរស & អ្នកការពារផែនដី)
  {
    id: 'superheroes_epic',
    label: 'កំពូលវីរបុរស & អ្នកការពារពិភពលោក (Superheroes Epic)',
    categoryIds: ['human', 'toys_3d'],
    characterTypeIds: [
      'human_superman_realistic',
      'human_spiderman_realistic',
      'human_ironman_realistic',
      'human_titan_realistic',
      'toy_superman_3d',
      'toy_spiderman_3d',
      'toy_ironman_3d',
      'toy_blue_titan_3d',
      'toy_nezha_3d'
    ],
    titlePrefixes: ['បេសកកម្មសង្គ្រោះនៃ', 'ការក្រោកឡើងរបស់', 'ការប្រយុទ្ធការពារទីក្រុងនៃ', 'សម្ព័ន្ធភាពនៃ', 'ជ័យជម្នះរបស់'],
    titleCores: ['កំពូលបុរសដែកថែប', 'មនុស្សពីងពាងយុត្តិធម៌', 'បុរសពាសដែកបច្ចេកវិទ្យា', 'មនុស្សយក្សកម្លាំងមហិមា', 'ក្រុមវីរបុរសការពារភពផែនដី'],
    titleSuffixes: ['ប្រឆាំងមេកម្លាំងងងឹត', 'កណ្តាលទីក្រុងទំនើប', 'ការពារពលរដ្ឋស្លូតត្រង់', 'បេសកកម្មអន្តរពិភព', 'សង្គ្រាមចុងក្រោយ'],
    settings: [
      'ទីក្រុងធំទំនើបអមដោយអគារកប់ពពក និងពន្លឺថ្ងៃជះចាំងលើកញ្ចក់អគារ',
      'លើដំបូលអគារខ្ពស់កប់ពពកនាម៉ោងមាស ជាមួយខ្យល់បក់រំភើយលើអាវឃ្លុំ',
      'ទីលានប្រយុទ្ធបច្ចេកវិទ្យាខ្ពស់ដែលមានផ្សែងអ័ព្ទ និងកម្ទេចថ្មអណ្តែត'
    ],
    incidents: [
      'ប្រព័ន្ធការពារទីក្រុងបានផ្ញើសញ្ញាអាសន្នថាមានគ្រោះមហន្តរាយកំពុងកើតឡើង',
      'មនុស្សអាក្រក់បានប៉ុនប៉ងបំផ្លាញប្រភពថាមពលស្នូលរបស់ទីក្រុង',
      'ពលរដ្ឋស្លូតត្រង់ជាច្រើននាក់ជាប់គាំងលើអគារខ្ពស់ដែលកំពុងរង្គោះរង្គើ'
    ],
    actions: [
      'ប្រើកម្លាំងហោះហើរយ៉ាងលឿនទម្លុះពពក និងប្រើភ្នែកកាំរស្មីទប់ទល់នឹងឧបសគ្គ',
      'បាញ់ខ្សែពីងពាងយោលខ្លួនកាត់តាមចន្លោះអគារខ្ពស់ៗដើម្បីជួយសង្គ្រោះជនរងគ្រោះ',
      'បញ្ឆេះម៉ាស៊ីនរ៉ុក្កែតនៅលើជើងពាសដែក និងបញ្ចេញថាមពល Repulsor Beam រារាំងគ្រោះថ្នាក់'
    ],
    climaxes: [
      'ឈានដល់ការកម្ចាត់ឧបសគ្គទាំងស្រុង និងជួយសង្គ្រោះទីក្រុងដោយសុវត្ថិភាព។',
      'ទប់លំនឹងអគារទាន់ពេលវេលា និងទទួលបានការអបអរសាទរយ៉ាងកងរំពងពីប្រជាជន។',
      'ការពារពិភពលោកបានជោគជ័យ និងហោះហើរឡើងទៅលើមេឃបង្ហាញពីនិមិត្តរូបនៃក្តីសង្ឃឹម។'
    ],
    visualStyles: [
      'Cinematic 8K Realistic Film, Hollywood cinematic movie style, dramatic lighting, anamorphic lens flare',
      'Photorealistic Marvel MCU Aesthetic, high-tech tactical suit textures, gleaming metallic armor, dynamic depth of field',
      'Pixar and DreamWorks 3D animated movie character style, vibrant heroic colors, soft volumetric lighting, Octane render'
    ],
    characterTemplates: [
      {
        name: 'កំពូលបុរសដែកថែប (Superman)',
        role: 'មេដឹកនាំវីរបុរស',
        details: 'Iconic superhero in classic blue suit with red cape, athletic muscular build, strong heroic jawline, photorealistic Hollywood cinematic movie style, dramatic lighting.',
        promptEn: 'Iconic superhero in classic blue suit with red cape, athletic muscular build, strong heroic jawline, photorealistic Hollywood cinematic movie style, dramatic lighting.',
        characterTypeId: 'human_superman_realistic',
        categoryId: 'human'
      },
      {
        name: 'មនុស្សពីងពាង (Spider-Man)',
        role: 'អ្នកយាមល្បាតទីក្រុង',
        details: 'Heroic vigilante wearing a high-tech red and dark-blue spider-web textured tactical suit with sleek white eye lenses, agile athletic build, photorealistic Marvel cinematic style.',
        promptEn: 'Heroic vigilante wearing a high-tech red and dark-blue spider-web textured tactical suit with sleek white eye lenses, agile athletic build, photorealistic Marvel cinematic style.',
        characterTypeId: 'human_spiderman_realistic',
        categoryId: 'human'
      },
      {
        name: 'បុរសពាសដែក (Iron Man)',
        role: 'វិស្វករបច្ចេកវិទ្យាកំពូល',
        details: 'Armored high-tech superhero in sleek crimson-red and metallic gold powered exoskeleton armor, glowing blue arc reactor chest piece and illuminated helmet eye slits, photorealistic MCU aesthetic.',
        promptEn: 'Armored high-tech superhero in sleek crimson-red and metallic gold powered exoskeleton armor, glowing blue arc reactor chest piece and illuminated helmet eye slits, photorealistic MCU aesthetic.',
        characterTypeId: 'human_ironman_realistic',
        categoryId: 'human'
      },
      {
        name: 'មនុស្សយក្សកម្លាំងមហិមា (Titan)',
        role: 'កម្លាំងការពារមហិមា',
        details: 'Massive towering muscular titan hero, deep cyan-blue thick textured skin, intense glowing eyes, raw brute strength, torn rugged pants, photorealistic cinematic monster scale.',
        promptEn: 'Massive towering muscular titan hero, deep cyan-blue thick textured skin, intense glowing eyes, raw brute strength, torn rugged pants, photorealistic cinematic monster scale.',
        characterTypeId: 'human_titan_realistic',
        categoryId: 'human'
      }
    ]
  }
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let lastGenreId = '';

/**
 * Procedurally generates an entirely new story with dynamic title,
 * full description, character consistency details, category, style, and settings.
 */
export function generateFullyRandomStory(): GeneratedStory {
  // 1. Pick a random blueprint (avoid repeating same genre sequentially)
  const availableBlueprints = GENRE_BLUEPRINTS.filter((b) => b.id !== lastGenreId);
  const blueprint = availableBlueprints.length > 0 ? pickRandom(availableBlueprints) : pickRandom(GENRE_BLUEPRINTS);
  lastGenreId = blueprint.id;

  // 2. Procedurally construct title
  const prefix = pickRandom(blueprint.titlePrefixes);
  const core = pickRandom(blueprint.titleCores);
  const suffix = pickRandom(blueprint.titleSuffixes);
  const title = `${prefix}${core} ${suffix}`.trim();

  // 3. Pick or assemble character
  const charTemplate = pickRandom(blueprint.characterTemplates);
  const characters = `${charTemplate.name}, ${charTemplate.details} (${charTemplate.promptEn})។`;

  // 4. Procedurally construct narrative description
  const setting = pickRandom(blueprint.settings);
  const incident = pickRandom(blueprint.incidents);
  const action = pickRandom(blueprint.actions);
  const climax = pickRandom(blueprint.climaxes);

  // Dialogue mode: dynamically chosen or weighted
  const isDialogue = Math.random() > 0.35; // 65% dialogue, 35% silent visual
  const dialogueMode: 'with_dialogue' | 'without_dialogue' = isDialogue ? 'with_dialogue' : 'without_dialogue';

  const dialogueNotice = isDialogue
    ? `សាច់រឿងមានកិច្ចសន្ទនាពាក្យសម្តីចំៗតាមដំណាក់កាល ទឹកមុខស្របតាមអារម្មណ៍ និងការបញ្ចេញសំឡេងយ៉ាងរស់រវើក។`
    : `ឈុតឆាកស្ងប់ស្ងាត់គ្មានការនិយាយ (Silent Narrative) ផ្តោតលើសកម្មភាពរហ័សរហួន ក្រសែភ្នែក និងបរិយាកាសភាពយន្តសុទ្ធ។`;

  const description =
    `ដំណើររឿងចាប់ផ្តើមនៅ${setting}។ ` +
    `${charTemplate.name} ${incident}។ ` +
    `ដើម្បីដោះស្រាយបញ្ហានេះ គាត់បាន${action}។ ` +
    `${climax} ${dialogueNotice}`;

  // 5. Visual style & duration
  const visualStyle = pickRandom(blueprint.visualStyles);
  const totalDuration = pickRandom([60, 60, 90, 120]);

  return {
    title,
    description,
    characters,
    categoryId: charTemplate.categoryId,
    characterTypeId: charTemplate.characterTypeId,
    visualStyle,
    dialogueMode,
    totalDuration,
    durationPerPrompt: 10,
    promptLanguage: 'english',
    characterSpokenLanguage: 'khmer',
    genreLabel: blueprint.label
  };
}
