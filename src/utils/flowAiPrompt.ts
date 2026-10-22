/**
 * Flow AI Prompt Formatter & Validator
 *
 * Flow AI (along with Kling AI, Runway Gen-3, Luma Dream Machine, Sora, and Pika)
 * enforces strict text-to-video prompt rules:
 * 1. NO bullet points (`•`, `*`, `-`, `▪`)
 * 2. NO headers (e.g. `Shot 1:`, `ឈុត 1:`, `Scene 1:`)
 * 3. NO timestamps or duration counters (`00:00 - 00:10`, `(10s)`)
 * 4. NO structural labels (`Camera:`, `Action:`, `Continuity:`, `Dialogue:`, `Lighting:`)
 * 5. Single cohesive cinematic paragraph in English (or clean description)
 * 6. Safe character length: strictly kept under 600-800 characters to prevent "Prompt Exceeds Maximum Limit" or "Prompt Error".
 */

export interface FlowAiPromptParams {
  actionDesc?: string;
  cameraMotion?: string;
  characters?: string;
  visualStyle?: string;
  dialogue?: string;
  sceneNumber?: number;
  isKhmer?: boolean;
}

/**
 * Builds a pristine, single-paragraph Flow AI prompt from structured components.
 */
export function buildFlowAiPrompt(params: FlowAiPromptParams): string {
  const {
    actionDesc = '',
    cameraMotion = '',
    characters = '',
    visualStyle = 'Cinematic 8K, photorealistic masterpiece',
    dialogue = '',
    sceneNumber = 1,
    isKhmer = false
  } = params;

  // Strict language isolation: ONLY use Khmer template if isKhmer is explicitly true
  const useKhmer = Boolean(isKhmer);

  if (useKhmer) {
    const cleanKhmerChar = (characters || '').trim() || 'តួអង្គសំខាន់';
    let cleanKhmerAction = (actionDesc || '').trim()
      .replace(/^Shot\s*\d+\s*:?/i, '')
      .replace(/^ឈុត\s*\d+\s*:?/i, '')
      .replace(/\[SILENT[^\]]*\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanKhmerAction) {
      cleanKhmerAction = `តួអង្គឈានជើងចូលក្នុងទិដ្ឋភាពនៃឈុតទី ${sceneNumber} ដោយការយកចិត្តទុកដាក់ និងទឹកមុខរស់រវើក`;
    }

    let speechNoteKhmer = '';
    if (dialogue && dialogue !== '[SILENT SCENE - NO DIALOGUE]' && !dialogue.includes('SILENT')) {
      const cleanDiag = dialogue.replace(/^[«"'“\s]+|[»"'”\s]+$/g, '').trim();
      if (cleanDiag) {
        speechNoteKhmer = ` តួអង្គនិយាយដោយទឹកមុខរស់រវើក និងចលនាបបូរមាត់ត្រូវគ្នា៖ «${cleanDiag}»។`;
      }
    }

    let khmerCamera = (cameraMotion || '').trim()
      .replace(/^•?\s*(Camera|ចលនាកាមេរ៉ា)\s*[:៖]/gi, '')
      .trim();
    if (!khmerCamera) {
      khmerCamera = 'ចលនាកាមេរ៉ារលូនកម្រិតភាពយន្ត ផ្តោតលើតួអង្គយ៉ាងច្បាស់';
    }

    let khmerStyle = (visualStyle || '').trim()
      .replace(/[🧸🎬🎨✨]/g, '')
      .trim();
    if (!khmerStyle) {
      khmerStyle = 'រូបភាពភាពយន្តកម្រិត 8K, ពន្លឺធម្មជាតិច្បាស់ត្រជាក់ភ្នែក';
    }

    const khmerPrompt = `ប្លង់ភាពយន្តនៃ ${cleanKhmerChar}, ដៃទំនេរតាមធម្មជាតិ។ ${cleanKhmerAction}។${speechNoteKhmer} ${khmerCamera}។ ${khmerStyle}។`;
    return khmerPrompt.replace(/\s+/g, ' ').replace(/។{2,}/g, '។').trim();
  }

  // 1. Clean character description: ensure 100% English for English prompt
  let cleanChar = (characters || '').trim();
  const engInBrackets = cleanChar.match(/\(([^)]*[a-zA-Z]{3,}[^)]*)\)/);
  if (engInBrackets) {
    cleanChar = engInBrackets[1].trim();
  } else {
    const withoutKhmer = cleanChar.replace(/[\u1780-\u17FF]/g, '').replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, '').trim();
    if (withoutKhmer.length >= 3) {
      cleanChar = withoutKhmer;
    } else {
      cleanChar = 'The main character';
    }
  }

  // 2. Clean action description: ensure 100% English for English prompt
  let cleanAction = (actionDesc || '').trim()
    .replace(/^Shot\s*\d+\s*:?/i, '')
    .replace(/^ឈុត\s*\d+\s*:?/i, '')
    .replace(/\[SILENT[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If cleanAction contains both English and Khmer, strip Khmer characters
  if (/[a-zA-Z]{5,}/.test(cleanAction) && /[\u1780-\u17FF]/.test(cleanAction)) {
    cleanAction = cleanAction.replace(/[\u1780-\u17FF]/g, '').replace(/\s+/g, ' ').trim();
  }

  if (!cleanAction || (!/[a-zA-Z]{3,}/.test(cleanAction))) {
    cleanAction = `The character advances dynamically through Shot ${sceneNumber}, fully engaged with the unfolding scene`;
  }

  // 3. Clean camera motion: 100% English
  let cleanCamera = (cameraMotion || '').trim()
    .replace(/^•?\s*(Camera Movement|Camera Motion|ចលនាកាមេរ៉ា)\s*[:៖]/gi, '')
    .replace(/[\u1780-\u17FF]/g, '')
    .trim();
  if (!cleanCamera || cleanCamera.length < 5) {
    cleanCamera = 'Smooth cinematic camera tracking shot with shallow depth of field';
  }

  // 4. Clean visual style: 100% English
  let cleanStyle = (visualStyle || '').trim()
    .replace(/[🧸🎬🎨✨]/g, '')
    .replace(/[\u1780-\u17FF]/g, '')
    .trim();
  if (!cleanStyle || cleanStyle.length < 3) {
    cleanStyle = 'Cinematic 8K, photorealistic masterpiece, 35mm lens, volumetric lighting';
  }

  // 5. Clean dialogue / speech representation:
  // English carrier sentence ("The character speaks..."), with ONLY the dialogue in quotes in the user's chosen spoken language!
  let speechNote = '';
  if (dialogue && dialogue !== '[SILENT SCENE - NO DIALOGUE]' && !dialogue.includes('SILENT')) {
    const cleanDiagText = dialogue.replace(/^[«"'“\s]+|[»"'”\s]+$/g, '').trim();
    if (cleanDiagText) {
      speechNote = ` The character speaks with natural emotion and synchronized lip movements: "${cleanDiagText}".`;
    }
  }

  // Assemble single fluid English paragraph
  let prompt = `Cinematic shot of ${cleanChar}, hands naturally free and empty. ${cleanAction}.${speechNote} ${cleanCamera}. ${cleanStyle}, highly detailed, vibrant atmospheric lighting, 8k resolution.`;

  // Final cleanup: remove multiple spaces, illegal chars, and clamp under safe limit
  prompt = prompt.replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').trim();

  if (prompt.length > 750) {
    const trimmed = prompt.slice(0, 740);
    const lastPeriod = trimmed.lastIndexOf('.');
    if (lastPeriod > 300) {
      prompt = trimmed.slice(0, lastPeriod + 1);
    } else {
      prompt = trimmed.trim() + '...';
    }
  }

  return prompt;
}

/**
 * Takes ANY raw prompt text (with bullets, headers, timestamps, labels)
 * and cleans it into an error-free Flow AI prompt string.
 */
export function cleanRawPromptForFlowAi(
  rawPrompt: string,
  fallbackStyle?: string,
  characters?: string,
  isKhmer?: boolean
): string {
  if (!rawPrompt || typeof rawPrompt !== 'string') return '';

  let text = rawPrompt.trim();

  // Remove Shot headers e.g. "Shot 1: ...", "ឈុតទី 1: ...", "=== [Shot 1] ==="
  text = text.replace(/===?\s*\[?Shot\s*\d+[^\]]*\]?\s*===?/gi, ' ');
  text = text.replace(/===?\s*\[?ឈុត\s*\d+[^\]]*\]?\s*===?/gi, ' ');
  text = text.replace(/^Shot\s*\d+\s*:[^\n]*/gim, ' ');
  text = text.replace(/^ឈុត\s*\d+\s*:[^\n]*/gim, ' ');

  // Remove timestamps e.g. "00:00 - 00:10 (10s)", "00:00 - 00:10 (10 វិនាទី)"
  text = text.replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*(\([^\)]*\))?/g, ' ');

  // Remove section bullets and labels in both English & Khmer
  const labelPatterns = [
    /•?\s*(Camera Movement|Camera Motion|ចលនាកាមេរ៉ា)\s*[:៖]/gi,
    /•?\s*(Action & Storyline|Action|សកម្មភាព និងដំណើររឿង|សកម្មភាព)\s*[:៖]/gi,
    /•?\s*(Continuity & Character Consistency Lock|Continuity|ការតភ្ជាប់តួអង្គ|ចំណុចតភ្ជាប់សាច់រឿង និងតួអង្គ)\s*[:៖]/gi,
    /•?\s*(Dialogue & Audio|Dialogue|ការនិយាយ និងសំឡេង|ការសន្ទនា)\s*[:៖]/gi,
    /•?\s*(Lighting & Visual Style|Lighting|រចនាប័ទ្ម និងពន្លឺភាពយន្ត|ពន្លឺ និងរចនាប័ទ្ម)\s*[:៖]/gi,
    /•?\s*🤖\s*ALL-IN-ONE MASTER PROMPT\s*[:៖]?/gi,
    /•?\s*📖\s*ដំណើររឿង\s*[:៖]?/gi,
    /•?\s*🎥\s*Camera Motion\s*[:៖]?/gi,
    /•?\s*🛡️\s*Continuity Lock\s*[:៖]?/gi,
    /•?\s*Character speaks in [^:]+:/gi,
  ];

  for (const pat of labelPatterns) {
    text = text.replace(pat, ' ');
  }

  // Remove bullet symbols
  text = text.replace(/[•▪►*#]/g, ' ');

  // Remove [SILENT SCENE - NO DIALOGUE] or similar bracketed notices
  text = text.replace(/\[SILENT[^\]]*\]/gi, ' ');

  // Normalize whitespace & line breaks to a single space, preserving integrated dialogue in quotes
  text = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  // If text is too short or emptied, generate a clean fallback
  if (text.length < 30) {
    return buildFlowAiPrompt({
      characters,
      visualStyle: fallbackStyle || (isKhmer ? 'រូបភាពភាពយន្តកម្រិត 8K' : 'Cinematic 8K, photorealistic masterpiece'),
      actionDesc: isKhmer
        ? 'តួអង្គឈានជើងចូលក្នុងទិដ្ឋភាពដោយការយកចិត្តទុកដាក់ ដៃទំនេរតាមធម្មជាតិ'
        : 'The character steps forward into the dramatic scene with natural focus and expression, hands naturally free.',
      cameraMotion: isKhmer
        ? 'ចលនាកាមេរ៉ារលូនកម្រិតភាពយន្ត ផ្តោតលើតួអង្គ'
        : 'Smooth continuous cinematic camera glide',
      isKhmer
    });
  }

  // Ensure hands-free rule is maintained if not already mentioned
  if (!text.toLowerCase().includes('hands') && !text.toLowerCase().includes('holding')) {
    // Insert "hands naturally free and empty" after the first period or comma
    const commaIndex = text.indexOf(',');
    if (commaIndex > 10 && commaIndex < 100) {
      text = text.slice(0, commaIndex) + ', hands naturally free and empty' + text.slice(commaIndex);
    }
  }

  // Clamp length strictly under 750 characters to prevent Flow AI length errors
  if (text.length > 750) {
    const trimmed = text.slice(0, 740);
    const lastPeriod = trimmed.lastIndexOf('.');
    if (lastPeriod > 250) {
      text = trimmed.slice(0, lastPeriod + 1);
    } else {
      const lastSpace = trimmed.lastIndexOf(' ');
      text = (lastSpace > 250 ? trimmed.slice(0, lastSpace) : trimmed) + '.';
    }
  }

  return text.trim();
}

/**
 * Validates whether a prompt meets Flow AI compliance standards.
 */
export function validateFlowAiPrompt(promptText: string): {
  valid: boolean;
  charCount: number;
  maxChars: number;
  issues: string[];
} {
  const maxChars = 800;
  const charCount = (promptText || '').length;
  const issues: string[] = [];

  if (!promptText || charCount === 0) {
    issues.push('Prompt is empty');
  }
  if (charCount > maxChars) {
    issues.push(`Prompt exceeds ${maxChars} character limit (current: ${charCount})`);
  }
  if (/[•▪►]/.test(promptText)) {
    issues.push('Contains bullet symbols (•) which cause Flow AI parsing errors');
  }
  if (/Shot\s*\d+\s*:/i.test(promptText) || /ឈុត\s*\d+\s*:/i.test(promptText)) {
    issues.push('Contains Shot headers which cause Flow AI prompt rejection');
  }
  if (/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/.test(promptText)) {
    issues.push('Contains timestamps which Flow AI cannot parse');
  }
  if (/[\r\n]{2,}/.test(promptText)) {
    issues.push('Contains multiple line breaks (Flow AI requires a single continuous paragraph)');
  }

  return {
    valid: issues.length === 0,
    charCount,
    maxChars,
    issues
  };
}
