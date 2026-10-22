import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SUPPORTED_LANGUAGES, getLanguageById, buildContextualDialogue, buildSequentialNarrativeBeat } from './src/languageConfig';
import { buildFlowAiPrompt, cleanRawPromptForFlowAi } from './src/utils/flowAiPrompt';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure WebSocket errors in Vite dev client are ignored as required by environment constraints
try {
  const targetFiles = [
    path.resolve(__dirname, 'node_modules/vite/dist/client/bundledDevClient.mjs'),
    path.resolve(__dirname, 'node_modules/vite/dist/client/client.mjs'),
  ];
  for (const f of targetFiles) {
    if (fs.existsSync(f)) {
      let content = fs.readFileSync(f, 'utf8');
      if (content.includes('reject(/* @__PURE__ */ new Error("WebSocket closed without opened."))')) {
        content = content.replaceAll('reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));', 'resolve();');
        fs.writeFileSync(f, content, 'utf8');
      }
    }
  }
} catch {
  // Ignore filesystem errors
}

const app = express();
const PORT = 3000;

app.use(express.json());

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const CANDIDATE_GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function callGeminiWithRetry(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config?: any;
  }
): Promise<any> {
  let lastError: any = null;

  for (const model of CANDIDATE_GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model "${model}" (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          console.log(`[Gemini API] Successfully generated with model "${model}"`);
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err?.status || JSON.stringify(err));
        const isUnavailable =
          errStr.includes('503') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('high demand') ||
          errStr.includes('Spikes in demand');
        const isRateLimit = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED');

        console.warn(`[Gemini API] Issue on model "${model}" (attempt ${attempt}):`, errStr);

        if (attempt === 1 && (isUnavailable || isRateLimit)) {
          // Quick wait before 1 retry on the same model
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          // Immediately try the next candidate model
          break;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini model candidates are currently experiencing high demand.');
}

interface GenerateRequestBody {
  title: string;
  totalDurationSeconds: number;
  durationPerPromptSeconds: number;
  description: string;
  characters?: string;
  characterType?: string;
  characterCount?: number;
  visualStyle?: string;
  promptLanguage?: string;
  characterSpokenLanguage?: string;
  dialogueMode?: 'with_dialogue' | 'without_dialogue';
}

function buildFallbackScenes(body: GenerateRequestBody) {
  const {
    title,
    totalDurationSeconds = 60,
    durationPerPromptSeconds = 10,
    description,
    characters = 'តួអង្គសំខាន់',
    characterCount = 1,
    visualStyle = 'Cinematic 8K Realistic Film',
    promptLanguage = 'english',
    characterSpokenLanguage = 'khmer',
    dialogueMode = 'with_dialogue'
  } = body;

  const count = Math.max(2, Math.min(50, Math.round(totalDurationSeconds / durationPerPromptSeconds)));
  const scenes = [];
  const pLang = getLanguageById(promptLanguage);
  const sLang = getLanguageById(characterSpokenLanguage);
  const isWithDialogue = dialogueMode === 'with_dialogue';
  const isKhmerPrompt = pLang.id === 'khmer';

  const lowerTitle = (title || '').toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  const isAlphabet =
    lowerTitle.includes('a ដល់ z') ||
    lowerTitle.includes('a to z') ||
    lowerTitle.includes('alphabet') ||
    lowerTitle.includes('អក្ខរក្រម') ||
    lowerTitle.includes('រៀនអក្សរ') ||
    lowerDesc.includes('a ដល់ z');

  for (let i = 1; i <= count; i++) {
    const startSec = (i - 1) * durationPerPromptSeconds;
    const endSec = i * durationPerPromptSeconds;
    const formatTime = (s: number) => {
      const mins = Math.floor(s / 60).toString().padStart(2, '0');
      const secs = (s % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };
    const timeRange = `${formatTime(startSec)} - ${formatTime(endSec)}`;

    // Contextual Dialogue dynamically generated based on title, description, and scene progression
    const spokenDialogue = isWithDialogue
      ? buildContextualDialogue(title, description, i, count, characterSpokenLanguage, characters)
      : '';

    let phaseTitle = '';
    let actionDesc = '';
    let cameraMotion = '';
    let continuityText = '';

    if (isAlphabet) {
      const alphabetLetter = String.fromCharCode(65 + ((i - 1) % 26));
      if (isKhmerPrompt) {
        phaseTitle = `រៀនអក្សរ ${alphabetLetter} (${alphabetLetter} is for ...)`;
        actionDesc = `${characters} បង្ហាញនិងបញ្ចេញសំឡេងអក្សរ ${alphabetLetter} ដោយក្តីរីករាយ និងចង្អុលទៅកាន់វត្ថុតំណាងអក្សរនេះយ៉ាងរស់រវើកក្នុងទិដ្ឋភាព ${description}។`;
        cameraMotion = `ចលនាកាមេរ៉ារំកិលចូលជិត ផ្តោតលើតួអង្គនិងអក្សរ ${alphabetLetter}`;
        continuityText = `រក្សាតួអង្គ ${characters} មុខមាត់ សម្លៀកបំពាក់ ម៉ូតសក់ដដែល ១០០% តភ្ជាប់ពីអក្សរមុន។`;
      } else {
        phaseTitle = `Learning Letter ${alphabetLetter}`;
        actionDesc = `${characters} cheerfully introduces and pronounces Letter ${alphabetLetter}, interacting directly with the object representing this letter in the setting of ${description}.`;
        cameraMotion = `Cinematic medium close-up pan-in focusing on character presenting Letter ${alphabetLetter}`;
        continuityText = `Lock character ${characters} face, clothing, and seamless educational continuity.`;
      }
    } else {
      const beat = buildSequentialNarrativeBeat(i, count, title, description, characters, isWithDialogue);
      if (isKhmerPrompt) {
        phaseTitle = beat.phaseTitleKhmer;
        actionDesc = beat.actionDescKhmer;
        cameraMotion = beat.cameraKhmer;
        continuityText = beat.continuityKhmer;
      } else {
        phaseTitle = beat.phaseTitleEnglish;
        actionDesc = beat.actionDescEnglish;
        cameraMotion = beat.cameraEnglish;
        continuityText = beat.continuityEnglish;
      }
    }

    let dialogueLine = '';
    if (isWithDialogue) {
      if (isKhmerPrompt) {
        dialogueLine = `• ${pLang.dialogueLabel}៖ តួអង្គនិយាយជា${sLang.nameKhmer} (${sLang.nameEnglish})៖ ${spokenDialogue} ដោយមានចលនាបបូរមាត់ត្រូវគ្នា និងទឹកមុខរស់រវើកតាមសាច់រឿង។`;
      } else {
        dialogueLine = `• ${pLang.dialogueLabel}: Character speaks in ${sLang.nameEnglish} (${sLang.nameKhmer}): ${spokenDialogue} with synchronized lip movement, natural vocal cadence, and expressive facial performance.`;
      }
    } else {
      dialogueLine = `• ${pLang.dialogueLabel}: ${pLang.silentNotice}`;
    }

    let aiPrompt = '';
    if (isKhmerPrompt) {
      aiPrompt = `${pLang.shotLabel} ${i}: ${phaseTitle}
${timeRange} (${durationPerPromptSeconds} វិនាទី)
• ${pLang.cameraLabel}៖ ${cameraMotion}
• ${pLang.actionLabel}៖ ${actionDesc}
• ${pLang.continuityLabel}៖ ${continuityText}
${dialogueLine}
• ${pLang.lightingLabel}៖ ${visualStyle}, រូបភាពភាពយន្តកម្រិតខ្ពស់, ពន្លឺធម្មជាតិច្បាស់ត្រជាក់ភ្នែក`;
    } else {
      aiPrompt = `${pLang.shotLabel} ${i}: ${phaseTitle}
${timeRange} (${durationPerPromptSeconds}s)
• ${pLang.cameraLabel}: ${cameraMotion}
• ${pLang.actionLabel}: ${actionDesc}
• ${pLang.continuityLabel}: ${continuityText}
${dialogueLine}
• ${pLang.lightingLabel}: ${visualStyle}, Cinematic 8K, photorealistic masterpiece, 35mm lens, dramatic volumetric lighting.`;
    }

    const flowAiPrompt = buildFlowAiPrompt({
      actionDesc,
      cameraMotion,
      characters,
      visualStyle,
      dialogue: isWithDialogue ? spokenDialogue : '',
      sceneNumber: i,
      isKhmer: isKhmerPrompt
    });

    scenes.push({
      sceneNumber: i,
      scene_number: i,
      timeRange,
      title_context: title,
      sceneTitleKhmer: `${pLang.shotLabel} ${i}: ${phaseTitle}`,
      sceneStoryKhmer: actionDesc,
      aiVideoPrompt: aiPrompt,
      visual_prompt: aiPrompt,
      flow_ai_prompt: flowAiPrompt,
      dialogue: isWithDialogue ? spokenDialogue : '[SILENT SCENE - NO DIALOGUE]',
      voiceover: actionDesc,
      cameraMotion,
      continuityNotes: continuityText
    });
  }

  return {
    storyTitle: title,
    style: visualStyle,
    charactersSummary: characters,
    totalScenes: count,
    scenes
  };
}

app.post('/api/generate-story', async (req: Request, res: Response) => {
  try {
    const {
      title,
      totalDurationSeconds = 60,
      durationPerPromptSeconds = 10,
      description,
      characters,
      characterType,
      characterCount = 1,
      visualStyle = 'Cinematic 8K Realistic Film',
      promptLanguage = 'english',
      characterSpokenLanguage = 'khmer',
      dialogueMode = 'with_dialogue'
    } = req.body as GenerateRequestBody;

    if (!title || !description) {
      return res.status(400).json({ error: 'សូមបញ្ជាក់ចំណងជើង និងការពិពណ៌នាសាច់រឿង (Title & description required)' });
    }

    const sceneCount = Math.max(2, Math.min(50, Math.round(totalDurationSeconds / durationPerPromptSeconds)));
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackData = buildFallbackScenes(req.body);
      return res.json(fallbackData);
    }

    const selectedPromptLangObj = getLanguageById(promptLanguage);
    const selectedSpokenLangObj = getLanguageById(characterSpokenLanguage);
    const isWithDialogue = dialogueMode === 'with_dialogue';

    const systemInstruction = `
You are a world-class AI video prompt director, screenwriter, and dialogue specialist.
Your mission is to generate a sequential series of AI video prompts for advanced video generation models (Kling AI, Runway Gen-3 Alpha, Sora, Midjourney, Pika, Luma Dream Machine).

MANDATORY RULES FOR STORY & CONTEXTUAL DIALOGUE GENERATION:

0. HANDS-FREE BASELINE & 100% VISUAL IDENTITY CONSISTENCY:
   - HANDS-FREE DEFAULT: Characters' hands MUST BE NATURAL AND EMPTY by default (hands free, not holding clapperboard, tablet, or props) UNLESS the narrative action of this specific scene explicitly dictates that they hold or interact with a particular object!
   - STRICT 100% FACE & APPEARANCE CONSISTENCY: Strictly preserve 100% identical facial features, face shape, eye shape, hairstyle, skin tone, and clothing across every single scene.

1. REMOVE ALL HARDCODED / CANNED FALLBACK DIALOGUES:
   - FORBIDDEN to use cliché generic phrases (e.g., NEVER write "Don't give up", "កុំអស់សង្ឃឹម", or identical repetitive lines).
   - Every dialogue line must be authentic, fresh, and specifically conceived for this exact moment.

2. CONTEXTUAL DIALOGUE FLOW (ស៊ីសង្វាក់គ្នាតាម SCENE នីមួយៗ):
   - You MUST generate dialogue strictly and dynamically based on:
     * Story Title ("${title}")
     * User Synopsis / Input Topic ("${description}")
     * The actual progression and action occurring specifically in THIS scene.
   - Example 1: If the story is about "Learning English Alphabet A to Z" (ការរៀនអក្សរអង់គ្លេស A ដល់ Z):
     * Scene 1 (Letter A): The dialogue MUST explicitly articulate "A is for Apple..." and the action must show the character presenting a shiny apple.
     * Scene 2 (Letter B): The dialogue MUST advance to "B is for Ball..." and the action must show the character bouncing a ball.
     * Scene 3 (Letter C): The dialogue MUST advance to "C is for Cat..."
     * FORBIDDEN to create dialogue diverging from the specific subject of that scene!
   - Example 2: If the story is an investigation, adventure, or superhero mission:
     * Scene 1: Opening arrival / discovering the challenge.
     * Scene 2: Tactical step / deciphering the clue / activating powers.
     * Scene 3: Climax or resolution.

3. STRICT ANTI-REPETITION RULE:
   - FORBIDDEN to repeat identical or similar dialogue lines across scenes.
   - The dialogue MUST dynamically change and progress from one scene to the next based on the unfolding story.

4. STRICT DUAL-LANGUAGE ISOLATION SYSTEM (បែងចែកភាសា Prompt និងភាសានិយាយឱ្យដាច់ពីគ្នា ១០០%):
   - "PROMPT LANGUAGE" (FOR ALL VISUAL PROMPTS, ACTIONS, CAMERA, LIGHTING, CONTINUITY & FLOW_AI_PROMPT): "${selectedPromptLangObj.nameEnglish}" (${selectedPromptLangObj.label}).
     * ALL narrative actions, camera movements, continuity descriptions, visual styles, and prompt framing in "visual_prompt" and "flow_ai_prompt" MUST BE WRITTEN ENTIRELY IN ${selectedPromptLangObj.nameEnglish}!
   - "CHARACTER SPOKEN LANGUAGE" (FOR SPOKEN DIALOGUE ONLY): "${selectedSpokenLangObj.nameEnglish}" (${selectedSpokenLangObj.label}).
     * ONLY the spoken words inside the quotation marks ("...") in the "dialogue" field and within the prompt MUST BE WRITTEN IN ${selectedSpokenLangObj.nameEnglish}!
   - CRITICAL EXAMPLE:
     * If Prompt Language is English and Character Spoken Language is Khmer:
       The prompt result, actions, camera, style, and speech carrier sentence MUST BE 100% IN ENGLISH, and ONLY the spoken dialogue line inside quotes is in Khmer!
       E.g.: 'Cinematic shot of the protagonist, hands naturally free and empty. The character looks at the phone screen discovering a fraudulent SMS. The character speaks expressively with synchronized lip movements: "[Khmer spoken dialogue in quotes]". Smooth cinematic medium tracking shot. Cinematic 8K, photorealistic masterpiece, 35mm lens, volumetric lighting.'
     * When dialogueMode === "without_dialogue":
       - "dialogue" field MUST BE "[SILENT SCENE - NO DIALOGUE]".
       - Storytelling is 100% non-verbal (facial expressions, eye contact, body gestures).

5. ALL-IN-ONE UNIFIED PROMPT ("visual_prompt"):
   Every scene's "visual_prompt" MUST combine all information into ONE SINGLE unified prompt string with this structure:
   ${selectedPromptLangObj.id === 'khmer' ? `
   ${selectedPromptLangObj.shotLabel} [N]: [ចំណងជើងឈុត]
   [Time Range] ([Duration]s)
   • ${selectedPromptLangObj.cameraLabel}៖ [ចលនាកាមេរ៉ា]
   • ${selectedPromptLangObj.actionLabel}៖ [សកម្មភាពដែលប្រទាក់សាច់រឿងចំប្រធានបទ]
   • ${selectedPromptLangObj.continuityLabel}៖ [ការចាក់សោរតួអង្គ ${characters || ''} និងការតភ្ជាប់ពីឈុតមុន]
   • ${selectedPromptLangObj.dialogueLabel}៖ [${isWithDialogue ? `តួអង្គនិយាយជា${selectedSpokenLangObj.nameKhmer} (${selectedSpokenLangObj.nameEnglish})៖ "[ពាក្យសម្តីជាក់លាក់]"` : selectedPromptLangObj.silentNotice}]
   • ${selectedPromptLangObj.lightingLabel}៖ [${visualStyle}, ពន្លឺ និងរចនាប័ទ្ម]
   ` : `
   ${selectedPromptLangObj.shotLabel} [N]: [Scene Phase Title]
   [Time Range] ([Duration]s)
   • ${selectedPromptLangObj.cameraLabel}: [Camera Movement]
   • ${selectedPromptLangObj.actionLabel}: [Continuous narrative action directly anchored to the specific topic]
   • ${selectedPromptLangObj.continuityLabel}: [Character consistency lock for ${characters || 'character'} and seamless transition from previous shot]
   • ${selectedPromptLangObj.dialogueLabel}: [${isWithDialogue ? `Character speaks in ${selectedSpokenLangObj.nameEnglish}: "[Exact contextual dialogue in ${selectedSpokenLangObj.nameEnglish}]"` : selectedPromptLangObj.silentNotice}]
   • ${selectedPromptLangObj.lightingLabel}: [${visualStyle}, Cinematic 8K, lighting, camera lens and style tags]
   `}

6. FLOW AI ERROR-FREE VIDEO PROMPT ("flow_ai_prompt"):
   In addition to "visual_prompt", each scene object MUST provide a dedicated "flow_ai_prompt":
   - STRICT FLOW AI & VIDEO GENERATOR COMPLIANCE:
     * Flow AI directly rejects prompts containing bullet points, timestamps, shot headers, or excessive length!
     * "flow_ai_prompt" MUST BE a SINGLE continuous, cohesive cinematic paragraph under 450-700 characters.
     * ABSOLUTELY FORBIDDEN: NO bullet points (NO •, NO *), NO timestamps (NO 00:00 - 00:10), NO shot headers (NO "Shot 1:", NO "ឈុត 1:"), NO structural labels (NO "Camera Movement:", NO "Action:").
     * Seamlessly combines: [Subject description with hands naturally free] + [Specific narrative action in this scene] + [Spoken dialogue embedded in quotes with lip movements] + [Camera motion] + [Visual style, atmosphere, and lighting].
     * PROGRESSIVE STORYTELLING & NO REPETITION: Every single shot MUST have unique progressive narrative action and unique dialogue advancing the story. FORBIDDEN to repeat identical or generic prompts across scenes!
     * DIALOGUE INTEGRATION: When dialogue is present, embed it directly into the paragraph: e.g. 'The character speaks expressively with synchronized lip movements: "[Dialogue]"' or 'តួអង្គនិយាយដោយទឹកមុខរស់រវើក និងចលនាបបូរមាត់ត្រូវគ្នា៖ «[Dialogue]»។'.
     * Guarantees 0% error when pasted into Flow AI, Kling AI, Runway Gen-3, Luma Dream Machine, or Sora.

7. OUTPUT JSON FORMAT:
   You MUST return a JSON Array of exactly ${sceneCount} Scene objects:
   [
     {
       "scene_number": 1,
       "title_context": "${title}",
       "visual_prompt": "[All-in-one complete prompt string]",
       "flow_ai_prompt": "[Single cohesive cinematic paragraph under 700 characters with action, dialogue in quotes, camera and style, zero bullets, zero timestamps, and zero headers]",
       "dialogue": "[Exact contextual spoken dialogue line in ${selectedSpokenLangObj.nameEnglish} matching the visual action, or empty if silent]",
       "voiceover": "[Voiceover narration or audio soundscape description in ${selectedPromptLangObj.nameEnglish}]"
     }
   ]
`;

    const promptText = `
Story Parameters:
- Story Title: "${title}"
- Description / Topic: "${description}"
- Total Duration: ${totalDurationSeconds}s (${sceneCount} scenes of ${durationPerPromptSeconds}s each)
- Dialogue Mode: ${dialogueMode}
- Number of Characters: ${characterCount || 1}
- Character Appearance Lock: ${characters || 'Consistent Protagonist'}
- Visual Style: ${visualStyle}
- Visual Prompt Language: ${selectedPromptLangObj.nameEnglish}
- Character Spoken Language: ${selectedSpokenLangObj.nameEnglish}

Generate exactly ${sceneCount} scenes in a JSON Array matching the requested schema:
[
  {
    "scene_number": 1,
    "title_context": "${title}",
    "visual_prompt": "...",
    "flow_ai_prompt": "...",
    "dialogue": "...",
    "voiceover": "..."
  }
]
`;

    const response = await callGeminiWithRetry(ai, {
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = buildFallbackScenes(req.body);
      }
    }

    // Extract scenes array from either direct Array or Object with scenes property
    let rawScenes: any[] = [];
    if (Array.isArray(parsedData)) {
      rawScenes = parsedData;
    } else if (Array.isArray(parsedData?.scenes)) {
      rawScenes = parsedData.scenes;
    } else {
      rawScenes = [];
    }

    if (rawScenes.length === 0) {
      return res.json(buildFallbackScenes(req.body));
    }

    const normalizedScenes = rawScenes.map((s: any, idx: number) => {
      const num = Number(s.scene_number || s.sceneNumber || idx + 1);
      const startSec = (num - 1) * durationPerPromptSeconds;
      const endSec = num * durationPerPromptSeconds;
      const formatTime = (sec: number) => {
        const mins = Math.floor(sec / 60).toString().padStart(2, '0');
        const secs = (sec % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
      };
      const timeRange = s.timeRange || `${formatTime(startSec)} - ${formatTime(endSec)}`;
      let visPrompt = (s.visual_prompt || s.aiVideoPrompt || '').trim();
      const diag = (s.dialogue || '').trim();
      const vo = (s.voiceover || s.sceneStoryKhmer || '').trim();

      // Ensure spoken dialogue is seamlessly unified inside visPrompt if not already present
      if (diag && diag !== '[SILENT SCENE - NO DIALOGUE]' && !visPrompt.includes(diag)) {
        if (selectedPromptLangObj.id === 'khmer') {
          visPrompt += `\n• ${selectedPromptLangObj.dialogueLabel}៖ ${diag}`;
        } else {
          visPrompt += `\n• ${selectedPromptLangObj.dialogueLabel}: Character speaks in ${selectedSpokenLangObj.nameEnglish}: "${diag}"`;
        }
      }

      const sceneTitle = s.title_context
        ? `${selectedPromptLangObj.shotLabel} ${num}: ${s.title_context}`
        : (s.sceneTitleKhmer || `${selectedPromptLangObj.shotLabel} ${num}`);

      const isKhmerPrompt = selectedPromptLangObj.id === 'khmer';
      const rawFlow = (s.flow_ai_prompt || '').trim();
      let flowAiPrompt = rawFlow && !/[•▪►]/.test(rawFlow) && !/Shot\s*\d+\s*:/i.test(rawFlow) && !/ឈុត\s*\d+\s*:/i.test(rawFlow) && rawFlow.length <= 800
        ? rawFlow
        : cleanRawPromptForFlowAi(visPrompt, visualStyle, characters, isKhmerPrompt);

      // Guarantee dialogue is embedded inside flowAiPrompt with lip-sync in quotes
      if (diag && diag !== '[SILENT SCENE - NO DIALOGUE]' && !diag.includes('SILENT')) {
        const cleanDiag = diag.replace(/^[«"'“\s]+|[»"'”\s]+$/g, '').trim();
        if (cleanDiag && !flowAiPrompt.includes(cleanDiag)) {
          if (isKhmerPrompt) {
            flowAiPrompt += ` តួអង្គនិយាយដោយទឹកមុខរស់រវើក និងចលនាបបូរមាត់ត្រូវគ្នា៖ «${cleanDiag}»។`;
          } else {
            flowAiPrompt += ` The character speaks with natural emotion and synchronized lip movements: "${cleanDiag}".`;
          }
        }
      }
      flowAiPrompt = flowAiPrompt.replace(/\s+/g, ' ').trim();

      return {
        sceneNumber: num,
        scene_number: num,
        timeRange,
        title_context: s.title_context || title,
        sceneTitleKhmer: sceneTitle,
        sceneStoryKhmer: vo || diag || sceneTitle,
        aiVideoPrompt: visPrompt,
        visual_prompt: visPrompt,
        flow_ai_prompt: flowAiPrompt,
        dialogue: diag,
        voiceover: vo,
        cameraMotion: s.cameraMotion || '',
        continuityNotes: s.continuityNotes || ''
      };
    });

    return res.json({
      storyTitle: title,
      style: visualStyle,
      charactersSummary: characters || '',
      totalScenes: normalizedScenes.length,
      scenes: normalizedScenes
    });
  } catch (error) {
    console.warn('Gemini API high demand / error. Generating smart contextual scenes fallback:', error);
    const fallbackData = buildFallbackScenes(req.body);
    return res.json({
      ...fallbackData,
      isFallback: true,
      fallbackReason: 'Gemini model high demand (503)'
    });
  }
});

function buildFallbackDescription(title: string, characters?: string, dialogueMode: string = 'with_dialogue', characterCount: number = 1): string {
  const char = characters && characters.trim() ? characters.trim() : (characterCount === 1 ? 'តួអង្គសំខាន់ម្នាក់ឯង' : `តួអង្គទាំង ${characterCount} នាក់`);
  const isDialogue = dialogueMode === 'with_dialogue';

  // Smart context generator for scam / crime / general titles
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('ឆបោក') || lowerTitle.includes('scam') || lowerTitle.includes('លួច') || lowerTitle.includes('អន្ទាក់')) {
    if (isDialogue) {
      return `ដំណើររឿង «${title}» ឆ្លុះបញ្ចាំងពីបរិយាកាសតានតឹងនៃពិភពបច្ចេកវិទ្យាងងឹត នៅក្នុងបន្ទប់ពោរពេញដោយពន្លឺអេក្រង់កុំព្យូទ័រ និងសារជូនដំណឹងក្លែងក្លាយជាច្រើន។ ${char} ត្រូវប្រឈមមុខនឹងអន្ទាក់នៃការបោកបញ្ឆោតតាមបណ្តាញសង្គម ដោយមានការសន្ទនាយ៉ាងស្វិតស្វាញ ទាំងការបញ្ចុះបញ្ចូល ការគំរាមកំហែង និងការតស៊ូទម្លាយការពិតដើម្បីកុំឱ្យធ្លាក់ចូលក្នុងកលល្បិចរបស់ក្រុមឧក្រិដ្ឋជន។`;
    } else {
      return `ដំណើររឿង «${title}» បង្ហាញពីបរិយាកាសដ៏ស្ងប់ស្ងាត់គួរឱ្យភ័យខ្លាចនៃបន្ទប់ប្រតិបត្តិការឆបោកអនឡាញ ដែលមានតែពន្លឺភ្លឹបភ្លែតពីម៉ូនីទ័រ និងសារហិរញ្ញវត្ថុក្លែងក្លាយរាប់សិប។ (ឈុតគ្មានការនិយាយ) ${char} សម្តែងតាមរយៈក្រសែភ្នែកស្រពិចស្រពិល ការញ័រដៃពេលចុចគ្រាប់ចុច និងកាយវិការតានតឹងឆ្លុះបញ្ចាំងពីភាពអន្ទះអន្ទែងក្នុងការរត់គេចពីអន្ទាក់បច្ចេកវិទ្យាដ៏គ្រោះថ្នាក់នេះ។`;
    }
  }

  if (isDialogue) {
    return `ដំណើររឿង «${title}» ផ្តោតលើដំណើររឿងដ៏ស៊ីជម្រៅរបស់ ${char} ដែលបានឈានជើងចូលទៅក្នុងទិដ្ឋភាពដែលត្រូវនឹងប្រធានបទនេះយ៉ាងច្បាស់លាស់។ នៅក្នុងបរិយាកាសដ៏រស់រវើក តួអង្គមានការសន្ទនានិយាយចំៗសាច់រឿង ផ្លាស់ប្តូរពាក្យសម្តីយ៉ាងមានទម្ងន់ ប្រឈមមុខនឹងឧបសគ្គចំពោះមុខ និងតស៊ូដើម្បីសម្រេចគោលដៅនៃដំណើររឿង។`;
  } else {
    return `ដំណើររឿង «${title}» បង្ហាញពីបរិយាកាសដ៏អស្ចារ្យ និងមានភាពអាថ៌កំបាំងដែលត្រូវនឹងប្រធានបទនេះយ៉ាងពេញលេញ។ តាមរយៈឈុតគ្មានការនិយាយ (Silent Narrative) ${char} ធ្វើដំណើរឆ្លងកាត់ទីកន្លែងដ៏ទាក់ទាញដោយប្រើកាយវិការ ទឹកមុខម៉ឺងម៉ាត់ និងសកម្មភាពរហ័សរហួន ដើម្បីជំនះឧបសគ្គនិងសម្រេចគោលដៅ ដោយផ្តល់នូវទិដ្ឋភាពភាពយន្តដ៏ទាក់ទាញគ្រប់វិនាទី។`;
  }
}

app.post('/api/generate-description', async (req: Request, res: Response) => {
  try {
    const { title, characters, characterType, characterCount = 1, visualStyle, dialogueMode = 'with_dialogue' } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackDesc = buildFallbackDescription(title, characters, dialogueMode, characterCount);
      return res.json({ description: fallbackDesc });
    }

    const isWithDialogue = dialogueMode === 'with_dialogue';

    const promptText = `
You are a master cinematic screenwriter and creative story director in Khmer.
Your task is to write a highly tailored, dramatic, and captivating story description (ការពិពណ៌នាសាច់រឿង) for an AI video series that DIRECTLY matches the Story Title and theme:

INPUT DETAILS:
- ចំណងជើងរឿង (Story Title): "${title}"
- ចំនួនតួអង្គក្នុងរឿង (Character Count): ${characterCount} តួអង្គ (${characterCount === 1 ? 'ទោល / Solo protagonist' : characterCount === 2 ? 'គូ ឬ ដៃគូ / Duo characters interacting' : `ក្រុម ${characterCount} នាក់ / Group of ${characterCount} characters`})
- ប្រភេទការសន្ទនា (Dialogue Mode): ${isWithDialogue ? 'មានការនិយាយ (With Dialogue / Spoken Lines)' : 'គ្មានការនិយាយ (No Dialogue / Pure Silent Cinematic Action)'}
- ប្រភេទតួអង្គ (Character Type): "${characterType || 'General'}"
- តួអង្គសំខាន់ (Characters): "${characters || ''}"
- រចនាប័ទ្ម (Style): "${visualStyle || ''}"

CRITICAL INSTRUCTIONS:
1. MATCH THE TITLE AND THEME PRECISELY (ត្រូវតែត្រូវតាមប្រធានបទចំណងជើងរឿង ១០០%):
   - Anchor strictly to the theme of "${title}".
   - Involve exactly ${characterCount} main character(s) in the narrative conflict and progression.

2. DIALOGUE SPECIFICATION:
   ${isWithDialogue 
     ? '- Highlight that the characters speak, interact with vocal dialogues, persuasive arguments, or urgent spoken exchanges that drive the story plot forward.' 
     : '- Explicitly frame this as a NO-DIALOGUE / SILENT SCENE series where storytelling relies purely on intense facial expressions, body language, atmospheric tension, and physical actions without spoken words.'}

3. FORMAT:
   - 3-4 vivid, natural, high-impact Khmer sentences.
   - Do NOT use Markdown headers or bullet points. Output ONLY the story description paragraph in Khmer.
`;

    const response = await callGeminiWithRetry(ai, {
      contents: promptText,
      config: {
        temperature: 0.7,
      },
    });

    const description = (response.text || '').trim();
    return res.json({ description: description || buildFallbackDescription(title, characters, dialogueMode, characterCount) });
  } catch (error) {
    console.warn('Gemini API high demand / error. Generating smart description fallback:', error);
    const fallbackDesc = buildFallbackDescription(req.body.title || '', req.body.characters, req.body.dialogueMode || 'with_dialogue', req.body.characterCount || 1);
    return res.json({
      description: fallbackDesc,
      isFallback: true,
      fallbackReason: 'Gemini model high demand (503)'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
