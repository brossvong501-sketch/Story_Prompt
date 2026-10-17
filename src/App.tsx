/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Copy,
  Check,
  Clock,
  Layers,
  User,
  Palette,
  Download,
  RotateCcw,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ShieldCheck,
  Video,
  ListOrdered,
  Paintbrush,
  BookOpen,
  Eye,
  HelpCircle,
  CheckCheck,
  FileText,
  Camera,
  History,
  Trash2,
  X,
  Wand2,
  AlertTriangle,
  Settings,
  Sun,
  Moon,
  MessageSquare,
  Volume2,
  Globe,
  Users,
  Plus,
  Edit3,
  SlidersHorizontal,
  Type
} from 'lucide-react';
import {
  COLOR_CATEGORIES,
  COLOR_PRESETS,
  ColorCategory,
  ColorItem
} from './colorPresets';
import {
  isLicenseValid,
  getSavedLicense,
  activateLicenseKey,
  deactivateLicenseKey,
  removeSavedLicense,
  getOrCreateDeviceId,
  getDeviceId,
  checkAndRestoreLicenseOnStartup,
  LicenseData
} from './licenseService';
import {
  getInitialHistory,
  loadPersistentHistory,
  persistNewHistoryItem,
  removeHistoryItem,
  clearAllHistory,
  saveLatestActiveStory,
  getLatestActiveStory,
} from './historyStorage';
import { SUPPORTED_LANGUAGES, getLanguageById, buildContextualDialogue } from './languageConfig';

interface Scene {
  sceneNumber: number;
  scene_number?: number;
  timeRange: string;
  title_context?: string;
  sceneTitleKhmer: string;
  sceneStoryKhmer: string;
  aiVideoPrompt: string;
  visual_prompt?: string;
  dialogue?: string;
  voiceover?: string;
  cameraMotion: string;
  continuityNotes: string;
}

interface StoryResult {
  storyTitle: string;
  style: string;
  charactersSummary: string;
  totalScenes: number;
  scenes: Scene[];
}

interface HistoryStory {
  id: string;
  title?: string;
  storyTitle: string;
  createdAt: number;
  timestamp?: number;
  dateFormatted: string;
  description: string;
  characters: string;
  visualStyle: string;
  totalScenes: number;
  shots?: number;
  duration?: string;
  totalDurationSeconds: number;
  durationPerPromptSeconds: number;
  prompts?: string[];
  result: StoryResult;
  sceneImages?: Record<number, string>;
}

interface ThemePreset {
  id: string;
  name: string;
  genre: string;
  emoji: string;
  menuBg: string;
  menuText: string;
  menuCardBg: string;
  menuInputBg: string;
  menuBorder: string;
  resultBg: string;
  resultText: string;
  resultCardBg: string;
  resultBorder: string;
  resultBoxBg: string;
  accent: string;
  headerBg: string;
  appBg: string;
}

// Helper: Ensure optimal high-contrast text on any dynamic background color
function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let c = hexColor.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '#ffffff';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  // Standard relative luminance
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? '#0f172a' : '#ffffff';
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'royal-angkor',
    name: 'ទេវកថា & រាជវង្សខ្មែរ',
    genre: 'បុរាណ/ទេវកថា (Royal Angkor)',
    emoji: '👑',
    menuBg: '#2e1065',
    menuText: '#fef08a',
    menuCardBg: '#3b0764',
    menuInputBg: '#4c1d95',
    menuBorder: '#eab308',
    resultBg: '#fefce8',
    resultText: '#4c1d95',
    resultCardBg: '#ffffff',
    resultBorder: '#fde047',
    resultBoxBg: '#fef9c3',
    accent: '#eab308',
    headerBg: 'linear-gradient(135deg, #1e0840 0%, #2e1065 50%, #78350f 100%)',
    appBg: '#fef9c3'
  },
  {
    id: 'cyberpunk-scifi',
    name: 'Sci-Fi & Cyberpunk',
    genre: 'បច្ចេកវិទ្យា/អនាគត (Neon Cyan)',
    emoji: '🚀',
    menuBg: '#030712',
    menuText: '#67e8f9',
    menuCardBg: '#0b1329',
    menuInputBg: '#111e3f',
    menuBorder: '#06b6d4',
    resultBg: '#070b14',
    resultText: '#38bdf8',
    resultCardBg: '#0f172a',
    resultBorder: '#0284c7',
    resultBoxBg: '#0b132b',
    accent: '#06b6d4',
    headerBg: 'linear-gradient(135deg, #020617 0%, #081630 60%, #0e7490 100%)',
    appBg: '#020617'
  },
  {
    id: 'cosmic-violet',
    name: 'កាឡាក់ស៊ី & វេទមន្ត',
    genre: 'វេទមន្ត/ចក្រវាល (Cosmic Galaxy)',
    emoji: '🔮',
    menuBg: '#1e0538',
    menuText: '#f3e8ff',
    menuCardBg: '#2d0954',
    menuInputBg: '#3b0d6d',
    menuBorder: '#a855f7',
    resultBg: '#faf5ff',
    resultText: '#6b21a8',
    resultCardBg: '#ffffff',
    resultBorder: '#d8b4fe',
    resultBoxBg: '#f3e8ff',
    accent: '#a855f7',
    headerBg: 'linear-gradient(135deg, #18032e 0%, #3b0764 50%, #9333ea 100%)',
    appBg: '#faf5ff'
  },
  {
    id: 'nature-forest',
    name: 'ព្រៃជ្រៅ & ផ្សងព្រេង',
    genre: 'ធម្មជាតិ/ផ្សងព្រេង (Emerald Forest)',
    emoji: '🌲',
    menuBg: '#064e3b',
    menuText: '#d1fae5',
    menuCardBg: '#043729',
    menuInputBg: '#065f46',
    menuBorder: '#10b981',
    resultBg: '#f0fdf4',
    resultText: '#064e3b',
    resultCardBg: '#ffffff',
    resultBorder: '#86efac',
    resultBoxBg: '#ecfdf5',
    accent: '#10b981',
    headerBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 60%, #047857 100%)',
    appBg: '#ecfdf5'
  },
  {
    id: 'sunset-horizon',
    name: 'ថ្ងៃលិច & វីរភាព',
    genre: 'វីរភាព/ថ្ងៃលិច (Sunset Glow)',
    emoji: '🌅',
    menuBg: '#450a0a',
    menuText: '#ffe4e6',
    menuCardBg: '#65131b',
    menuInputBg: '#881337',
    menuBorder: '#f43f5e',
    resultBg: '#fff5f5',
    resultText: '#881337',
    resultCardBg: '#ffffff',
    resultBorder: '#fecdd3',
    resultBoxBg: '#ffe4e6',
    accent: '#f43f5e',
    headerBg: 'linear-gradient(135deg, #38040e 0%, #9f1239 50%, #ea580c 100%)',
    appBg: '#fff5f5'
  },
  {
    id: 'classic-navy',
    name: 'បុរាណទឹកប៊ិច',
    genre: 'ស្តង់ដារដើម (Ocean Navy)',
    emoji: '🌊',
    menuBg: '#0B192C',
    menuText: '#FFFFFF',
    menuCardBg: '#0f2442',
    menuInputBg: '#132847',
    menuBorder: '#1e3a8a',
    resultBg: '#FFFFFF',
    resultText: '#0f2b5c',
    resultCardBg: '#FFFFFF',
    resultBorder: '#bfdbfe',
    resultBoxBg: '#f0f7ff',
    accent: '#3b82f6',
    headerBg: 'linear-gradient(135deg, #091528 0%, #0d1f38 60%, #1d4ed8 100%)',
    appBg: '#f1f5f9'
  },
  {
    id: 'horror-dark',
    name: 'ភ័យរន្ធត់ & អាថ៌កំបាំង',
    genre: 'ភ័យរន្ធត់/ខ្មោច (Horror Mystery)',
    emoji: '👻',
    menuBg: '#12070a',
    menuText: '#ffe4e6',
    menuCardBg: '#1c0c11',
    menuInputBg: '#2b1019',
    menuBorder: '#881337',
    resultBg: '#141417',
    resultText: '#fca5a5',
    resultCardBg: '#1f1f23',
    resultBorder: '#991b1b',
    resultBoxBg: '#27272a',
    accent: '#ef4444',
    headerBg: 'linear-gradient(135deg, #070203 0%, #1c060e 50%, #991b1b 100%)',
    appBg: '#09090b'
  },
  {
    id: 'golden-empire',
    name: 'ចក្រភពមាសប្រណីត',
    genre: 'ប្រណីត/ចក្រភព (Imperial Gold)',
    emoji: '🏛️',
    menuBg: '#362102',
    menuText: '#fef3c7',
    menuCardBg: '#543306',
    menuInputBg: '#6e4408',
    menuBorder: '#f59e0b',
    resultBg: '#fffdf5',
    resultText: '#78350f',
    resultCardBg: '#ffffff',
    resultBorder: '#fde68a',
    resultBoxBg: '#fef3c7',
    accent: '#f59e0b',
    headerBg: 'linear-gradient(135deg, #261501 0%, #543306 60%, #b45309 100%)',
    appBg: '#fffdf5'
  },
  {
    id: 'blossom-pink',
    name: 'ផ្កាឈូក & មនោសញ្ចេតនា',
    genre: 'មនោសញ្ចេតនា (Blossom Romance)',
    emoji: '🌸',
    menuBg: '#500724',
    menuText: '#fdf2f8',
    menuCardBg: '#700c35',
    menuInputBg: '#831843',
    menuBorder: '#ec4899',
    resultBg: '#fdf2f8',
    resultText: '#831843',
    resultCardBg: '#ffffff',
    resultBorder: '#fbcfe8',
    resultBoxBg: '#fce7f3',
    accent: '#ec4899',
    headerBg: 'linear-gradient(135deg, #3d051b 0%, #831843 60%, #db2777 100%)',
    appBg: '#fdf2f8'
  },
  {
    id: 'stealth-titanium',
    name: 'ទីតាញ៉ូម & ម៉ាហ្វីយ៉ា',
    genre: 'ទំនើប/ម៉ាហ្វីយ៉ា (Stealth Titanium)',
    emoji: '💎',
    menuBg: '#0f172a',
    menuText: '#f8fafc',
    menuCardBg: '#1e293b',
    menuInputBg: '#334155',
    menuBorder: '#64748b',
    resultBg: '#f8fafc',
    resultText: '#1e293b',
    resultCardBg: '#ffffff',
    resultBorder: '#cbd5e1',
    resultBoxBg: '#f1f5f9',
    accent: '#38bdf8',
    headerBg: 'linear-gradient(135deg, #020617 0%, #1e293b 60%, #475569 100%)',
    appBg: '#f8fafc'
  }
];

interface CharacterCategory {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
}

const CHARACTER_CATEGORIES: CharacterCategory[] = [
  { id: 'human', name: 'មនុស្ស', nameEn: 'Human', emoji: '👤' },
  { id: 'animals', name: 'សត្វ', nameEn: 'Animals & Creatures', emoji: '🐾' },
  { id: 'plants', name: 'រុក្ខជាតិ', nameEn: 'Plants & Nature Elements', emoji: '🌿' },
  { id: 'toys_3d', name: 'តុក្កតា & 3D', nameEn: 'Toys, Chibi & 3D Objects', emoji: '🧸' },
  { id: 'mythical', name: 'ទេវកថា & វិញ្ញាណ', nameEn: 'Mythical & Fantasy', emoji: '🐉' },
];

interface CharacterTypeItem {
  id: string;
  categoryId: 'human' | 'animals' | 'plants' | 'toys_3d' | 'mythical';
  categoryTitle: string;
  name: string;
  badge: string;
  emoji: string;
  description: string;
  defaultStyle: string;
}

const CHARACTER_TYPES: CharacterTypeItem[] = [
  // 1. មនុស្ស (Human)
  {
    id: 'human_boy',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'ក្មេងប្រុស',
    badge: 'មនុស្ស • Boy',
    emoji: '👦',
    description: 'ក្មេងប្រុសតូច អាយុ ១០ ឆ្នាំ កែវភ្នែកមូលធំភ្លឺថ្លា សក់ខ្លីខ្មៅ សម្បុរស្រអែម ស្លៀកពាក់អាវយឺតដៃខ្លីនិងខោខ្លីស្អាតបាត ទឹកមុខឆ្លាតវៃរួសរាយ រូបរាងមនុស្សពិត (Photorealistic Asian boy, 10 years old, natural dark hair, innocent curious eyes, casual t-shirt and shorts, 8k realistic cinematic lighting)។',
    defaultStyle: 'Cinematic 8K Realistic Film, natural soft lighting, authentic film grain'
  },
  {
    id: 'human_girl',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'ក្មេងស្រី',
    badge: 'មនុស្ស • Girl',
    emoji: '👧',
    description: 'ក្មេងស្រីតូចគួរឱ្យស្រឡាញ់ អាយុ ៨ ឆ្នាំ ចងសក់ទីទុយពីរ ភ្នែកមូលថ្លា ស្នាមញញឹមស្រស់ថ្លា ពាក់រ៉ូបពណ៌ភ្លឺស្អាតបាត រូបរាងមនុស្សពិត (Photorealistic young Asian girl, 8 years old, cute pigtails hairstyle, bright expressive eyes, cheerful smile, natural lighting, 8k)។',
    defaultStyle: 'Cinematic 8K Realistic Film, natural sunlight, 50mm portrait lens'
  },
  {
    id: 'human_young_man',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'យុវជន',
    badge: 'មនុស្ស • Young Man',
    emoji: '👨',
    description: 'យុវជនខ្មែរពិតប្រាកដ អាយុ ២៥ ឆ្នាំ រាងខ្ពស់សង្ហា សម្បុរស្រអែម សក់ម៉ូតស្អាតបាត កែវភ្នែកម៉ឺងម៉ាត់ មានទំនុកចិត្ត ស្លៀកពាក់អាវសឺមីនិងខោខូវប៊យ រូបរាងមនុស្សពិត ១០០% (Photorealistic Asian young man, 25 years old, athletic build, charismatic expression, authentic skin pores, 8k cinematic lighting)។',
    defaultStyle: 'Cinematic 8K Realistic Film, 35mm lens, atmospheric volumetric light'
  },
  {
    id: 'human_young_woman',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'យុវតី',
    badge: 'មនុស្ស • Young Woman',
    emoji: '👩',
    description: 'យុវតីខ្មែរពិតប្រាកដ វ័យ ២២ ឆ្នាំ សម្រស់ស្រស់សោភា សក់ខ្មៅរលោងវែងទម្លាក់ស្មា ភ្នែកស្រទន់ ទឹកមុខទន់ភ្លន់រួសរាយ ស្លៀកពាក់ថ្លៃថ្នូរសមរម្យ រូបរាងមនុស្សពិត (Photorealistic young Asian woman, 22 years old, natural radiant skin, expressive gentle eyes, elegant attire, 8k cinematic)។',
    defaultStyle: 'Cinematic 8K Realistic Film, 50mm portrait lens, natural soft lighting'
  },
  {
    id: 'human_elder_man',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'មនុស្សចាស់ (បុរស)',
    badge: 'មនុស្ស • Elder Man',
    emoji: '👴',
    description: 'លោកតាវ័យ ៧០ ឆ្នាំ សក់និងពុកចង្កាពណ៌សប្រាក់ មានស្នាមជ្រួញបង្ហាញពីបទពិសោធន៍ជីវិត កែវភ្នែកពោរពេញដោយក្តីមេត្តានិងប្រាជ្ញា ពាក់អាវកកុកស (Photorealistic elderly grandfather, 70 years old, weathered kind face, silver hair and beard, wise gentle eyes, authentic skin wrinkles, 8k)។',
    defaultStyle: 'Cinematic 8K Realistic Film, warm dramatic lighting, authentic textures'
  },
  {
    id: 'human_elder_woman',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'មនុស្សចាស់ (ស្ត្រី)',
    badge: 'មនុស្ស • Elder Woman',
    emoji: '👵',
    description: 'លោកយាយវ័យ ៦៨ ឆ្នាំ សក់សកណ្តុរប្រផេះបួងស្អាតបាត ទឹកមុខស្លូតបូតពោរពេញដោយក្តីស្រឡាញ់ ពាក់អាវប៉ាក់សនិងក្រមាលើស្មា (Photorealistic elderly grandmother, 68 years old, warm loving smile, gentle wrinkled face, traditional neat attire, soft ambient light, 8k)។',
    defaultStyle: 'Cinematic 8K Realistic Film, soft window light, warm tone, 8k detail'
  },
  {
    id: 'human_baby',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'ទារក',
    badge: 'មនុស្ស • Baby',
    emoji: '👶',
    description: 'ទារកតូចគួរឱ្យស្រឡាញ់ អាយុប្រហែល ១ ឆ្នាំ ថ្ពាល់ប៉ោងៗក្រហមព្រឿងៗ ភ្នែកមូលធំភ្លឺថ្លា សក់ទន់ៗ ស្លៀកពាក់ឈុតទារកកប្បាសទន់ (Photorealistic cute baby infant, 1 year old, chubby rosy cheeks, big sparkling innocent eyes, soft lighting, ultra high detail)។',
    defaultStyle: 'Cinematic 8K Realistic Film, soft golden hour lighting, macro portrait lens'
  },
  {
    id: 'human_warrior',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'អ្នកប្រយុទ្ធ / ទាហាន',
    badge: 'មនុស្ស • Warrior / Soldier',
    emoji: '⚔️',
    description: 'អ្នកចម្បាំង/ទាហានមាំមួន រាងកាយរឹងមាំ ស្លៀកពាក់ឯកសណ្ឋានអាវក្រោះប្រយុទ្ធ ទឹកមុខអង់អាចម៉ឺងម៉ាត់ មានស្នាមរបួសបន្តិចបន្តួចបង្ហាញពីភាពអង់អាច (Photorealistic rugged combat warrior / soldier, tactical weathered armor, intense focused gaze, athletic physique, cinematic 8k)។',
    defaultStyle: 'Cinematic 8K Historical Epic, dramatic high-contrast lighting, atmospheric smoke and grit'
  },
  {
    id: 'human_doctor',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'គ្រូពេទ្យ',
    badge: 'មនុស្ស • Doctor',
    emoji: '🩺',
    description: 'គ្រូពេទ្យជំនាញ ទឹកមុខស្ងប់ស្ងាត់និងមានមេត្តា ពាក់អាវកូតពណ៌សពេទ្យ និងមានកាសស្តាប់បេះដូងពាក់ជុំវិញក ភ្នែកបង្ហាញការយកចិត្តទុកដាក់ (Photorealistic professional doctor in clean white lab coat, stethoscope around neck, caring focused expression, clean clinic lighting, 8k)។',
    defaultStyle: 'Cinematic 8K Realistic Film, clean studio lighting, realistic depth of field'
  },
  {
    id: 'human_teacher',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'គ្រូបង្រៀន',
    badge: 'មនុស្ស • Teacher',
    emoji: '🧑‍🏫',
    description: 'គ្រូបង្រៀនដ៏មានគរុកោសល្យខ្ពស់ ទឹកមុខស្លូតបូតរួសរាយ ពោរពេញដោយក្តីមេត្តានិងចំណេះដឹង ពាក់វ៉ែនតានិងស្លៀកពាក់អាវសឺមីថ្លៃថ្នូរស្អាតបាត ដៃកាន់សៀវភៅបង្រៀន ឈរក្នុងបន្ទប់រៀន (Photorealistic dedicated teacher, warm kind smile, intelligent expression, wearing neat glasses and professional attire, holding teaching books, classroom environment, soft natural ambient lighting, 8k cinematic)។',
    defaultStyle: 'Cinematic 8K Realistic Film, soft classroom lighting, 50mm portrait lens, authentic atmosphere'
  },
  {
    id: 'human_farmer',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'កសិករ',
    badge: 'មនុស្ស • Farmer',
    emoji: '🌾',
    description: 'កសិករខ្មែរឧស្សាហ៍ព្យាយាម សម្បុរស្រអែមពីកម្ដៅថ្ងៃ ពាក់មួកស្លឹកត្នោត ក្រមាពានលើក អាវកាក់និងខោជើងវែង ទឹកមុខញញឹមរួសរាយនិងរឹងមាំ (Photorealistic rural Asian farmer, sun-kissed skin, straw hat, traditional krama scarf, genuine hardworking smile, rural field lighting, 8k)។',
    defaultStyle: 'Cinematic 8K Realistic Film, warm golden sunlight, authentic outdoor texture'
  },
  {
    id: 'human_fisherman',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'អ្នកនេសាទ',
    badge: 'មនុស្ស • Fisherman',
    emoji: '🎣',
    description: 'អ្នកនេសាទបទពិសោធន៍ខ្ពស់ សាច់ដុំមាំមួន សម្បុរស្រអែមទឹកសមុទ្រ កាន់សំណាញ់នេសាទ ឈរលើទូក ទឹកមុខម៉ឺងម៉ាត់តស៊ូ (Photorealistic weathered fisherman on wooden boat, sun-tanned skin, holding fishing net, ocean mist, determined gaze, 8k cinematic)។',
    defaultStyle: 'Cinematic 8K Realistic Film, morning sea mist, dynamic water reflections'
  },
  {
    id: 'human_king',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'ស្ដេច / មេដឹកនាំ',
    badge: 'មនុស្ស • King / Leader',
    emoji: '👑',
    description: 'ស្ដេចឬមេដឹកនាំដ៏មហិមា ស្លៀកពាក់ព្រះពស្ត្រក្បាច់ក្បូរមាសភ្លឺចិញ្ចែងចិញ្ចាច ពាក់មកុដរាជវង្ស ទឹកមុខមហិមា ពោរពេញដោយអំណាចនិងព្រះគុណ (Photorealistic majestic royal king / sovereign leader, ornate royal gold robes, magnificent crown, regal commanding posture, majestic palace lighting, 8k)។',
    defaultStyle: 'Cinematic 8K Royal Epic, majestic warm lighting, opulent golden glow'
  },
  // កំពូលវីរបុរសភាពយន្តមនុស្សពិត (Realistic Superheroes)
  {
    id: 'human_superman_realistic',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'កំពូលបុរសដែកថែប (Superman Style - Realistic)',
    badge: 'មនុស្ស • Superman Style',
    emoji: '🦸‍♂️',
    description: 'Iconic superhero in classic blue suit with red cape, athletic muscular build, strong heroic jawline, photorealistic Hollywood cinematic movie style, dramatic lighting.',
    defaultStyle: 'Cinematic 8K Realistic Film, Hollywood cinematic movie style, dramatic lighting'
  },
  {
    id: 'human_spiderman_realistic',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'មនុស្សពីងពាង (Spider-Man Style - Realistic)',
    badge: 'មនុស្ស • Spider-Man Style',
    emoji: '🕷️',
    description: 'Heroic vigilante wearing a high-tech red and dark-blue spider-web textured tactical suit with sleek white eye lenses, agile athletic build, photorealistic Marvel cinematic style.',
    defaultStyle: 'Cinematic 8K Realistic Film, photorealistic Marvel cinematic style, tactical suit textures'
  },
  {
    id: 'human_ironman_realistic',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'បុរសពាសដែកបច្ចេកវិទ្យា (Iron Man Style - Realistic)',
    badge: 'មនុស្ស • Iron Man Style',
    emoji: '🦾',
    description: 'Armored high-tech superhero in sleek crimson-red and metallic gold powered exoskeleton armor, glowing blue arc reactor chest piece and illuminated helmet eye slits, photorealistic MCU aesthetic.',
    defaultStyle: 'Cinematic 8K Realistic Film, photorealistic MCU aesthetic, glowing blue arc reactor'
  },
  {
    id: 'human_titan_realistic',
    categoryId: 'human',
    categoryTitle: 'មនុស្ស (Human)',
    name: 'មនុស្សយក្សកម្លាំងមហិមា (Giant Blue/Green Titan - Realistic)',
    badge: 'មនុស្ស • Giant Titan',
    emoji: '🦍',
    description: 'Massive towering muscular titan hero, deep cyan-blue thick textured skin, intense glowing eyes, raw brute strength, torn rugged pants, photorealistic cinematic monster scale.',
    defaultStyle: 'Cinematic 8K Realistic Film, photorealistic cinematic monster scale, intense dramatic lighting'
  },

  // 2. សត្វ (Animals & Creatures)
  {
    id: 'animal_monkey',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ស្វា',
    badge: 'សត្វ • Monkey',
    emoji: '🐒',
    description: 'សត្វស្វាព្រៃឆ្លាតវៃ រោមពណ៌ត្នោតក្រម៉ៅ ភ្នែកមូលភ្លឺឆ្លាត ចលនារហ័សរហួន កំពុងតោងមែកឈើ (Photorealistic wild monkey, detailed brown fur texture, expressive intelligent eyes, agile posture on jungle tree branch, 8k cinematic nature)។',
    defaultStyle: 'Cinematic 8K Wildlife Documentary, National Geographic style, natural jungle lighting'
  },
  {
    id: 'animal_tiger',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ខ្លា',
    badge: 'សត្វ • Tiger',
    emoji: '🐅',
    description: 'សត្វខ្លាធំដ៏កាចសាហាវ រោមឆ្នូតខ្មៅមាសភ្លឺរលោង សាច់ដុំរឹងមាំ ភ្នែកពណ៌លឿងភ្លឺថ្លាគួរឱ្យកោតខ្លាច (Photorealistic majestic Bengal tiger, vibrant orange and black striped fur, powerful muscular build, piercing amber eyes, 8k wildlife)។',
    defaultStyle: 'Cinematic 8K Wildlife Epic, dramatic high-contrast sunlight, dust particles'
  },
  {
    id: 'animal_lion',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'តោ',
    badge: 'សត្វ • Lion',
    emoji: '🦁',
    description: 'ស្តេចតោរាងធំមហិមា ស្កេករោមធំក្រាស់ពណ៌ទង់ដែង ក្រសែភ្នែកមហិមាឈរលើដីថ្មខ្ពស់ (Photorealistic majestic male lion, magnificent thick dark golden mane, commanding amber gaze, perched on rock, 8k cinematic documentary)។',
    defaultStyle: 'Cinematic 8K Wildlife Epic, golden savanna sunset lighting, rich textures'
  },
  {
    id: 'animal_elephant',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ដំរី',
    badge: 'សត្វ • Elephant',
    emoji: '🐘',
    description: 'ដំរីអាស៊ីដ៏មហិមា ស្បែកជ្រួញពណ៌ប្រផេះធម្មជាតិ ភ្លុកវែងកោងស្រួច ភ្នែកស្លូតបូត (Photorealistic giant Asian elephant, weathered wrinkled grey skin texture, magnificent ivory tusks, gentle wise eyes, 8k)។',
    defaultStyle: 'Cinematic 8K Wildlife Documentary, atmospheric jungle mist, volumetric light'
  },
  {
    id: 'animal_bear',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ខ្លាឃ្មុំ',
    badge: 'សត្វ • Bear',
    emoji: '🐻',
    description: 'សត្វខ្លាឃ្មុំព្រៃធំ រោមក្រាស់ពណ៌ត្នោតចាស់ រូបរាងមហិមា ឈរដោយអំណាចនៅមាត់ទឹក (Photorealistic massive grizzly bear, thick dense brown fur, powerful physique, standing near forest stream, water droplets, 8k)។',
    defaultStyle: 'Cinematic 8K Wildlife Film, realistic wilderness lighting, crisp forest textures'
  },
  {
    id: 'animal_wolf',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ឆ្កែចចក',
    badge: 'សត្វ • Wolf',
    emoji: '🐺',
    description: 'ឆ្កែចចកព្រៃ រោមពណ៌ប្រផេះលាយស ភ្នែកពណ៌ទឹកក្រូចមុតស្រួច ត្រចៀកបញ្ឈរ សម្លឹងមើលទៅមុខដោយភាពប្រុងប្រយ័ត្ន (Photorealistic wild wolf, detailed grey and white fur, piercing yellow eyes, alert predatory posture, misty forest, 8k)។',
    defaultStyle: 'Cinematic 8K Nature Film, misty atmospheric lighting, cool cinematic tone'
  },
  {
    id: 'animal_fox',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'កញ្ជ្រោង',
    badge: 'សត្វ • Fox',
    emoji: '🦊',
    description: 'កញ្ជ្រោងព្រៃដ៏ស្រស់ស្អាត រោមក្រហមទង់ដែង កន្ទុយធំវែងរលោង ច្រមុះស្រួច ភ្នែកឆ្លាតវៃ (Photorealistic wild red fox, vibrant bushy orange fur and tail, clever expressive eyes, autumn woodland setting, 8k)។',
    defaultStyle: 'Cinematic 8K Wildlife Macro, soft autumn sunlight, natural bokeh background'
  },
  {
    id: 'animal_eagle',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ឥន្ទ្រី',
    badge: 'សត្វ • Eagle',
    emoji: '🦅',
    description: 'សត្វឥន្ទ្រីយក្ស រោមស្លាបធំទូលាយ ចំពុះកោងស្រួចពណ៌លឿង ភ្នែកមុតស្រួចកាចសាហាវ កំពុងទំលើចុងថ្ម (Photorealistic majestic eagle, magnificent feather detail, razor-sharp yellow beak, intense piercing gaze, perched on high cliff, 8k)។',
    defaultStyle: 'Cinematic 8K Wildlife Epic, dramatic mountain peak lighting, windblown feathers'
  },
  {
    id: 'animal_snake',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ពស់',
    badge: 'សត្វ • Snake',
    emoji: '🐍',
    description: 'ពស់ថ្លាន់យក្ស ឬពស់វែក ស្រកាឆ្លុះពណ៌រលោង ភ្នែកបញ្ចេញពន្លឺ អណ្តាតបាញ់ចេញមកក្រៅ កំពុងរំកិលខ្លួនយ៉ាងស្ងៀមស្ងាត់ (Photorealistic giant serpent snake, iridescent detailed scales, mesmerizing slit-pupil eyes, flicking tongue, dense mossy jungle, 8k)។',
    defaultStyle: 'Cinematic 8K Nature Macro, damp rainforest rim lighting, shallow depth of field'
  },
  {
    id: 'animal_crocodile',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ក្រពើ',
    badge: 'សត្វ • Crocodile',
    emoji: '🐊',
    description: 'ក្រពើយក្សបាតទឹក ស្បែកគ្រើមរឹងដូចថ្ម ធ្មេញស្រួចៗត្រៀមត្រដាងមាត់ ភ្នែកលេចពីលើផ្ទៃទឹក (Photorealistic massive prehistoric crocodile, armored rough scaly hide, sharp jagged teeth, lurking at water surface, ripples, 8k)។',
    defaultStyle: 'Cinematic 8K Wildlife Documentary, swamp murky water reflections, dramatic mood'
  },
  {
    id: 'animal_horse',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'សេះ',
    badge: 'សត្វ • Horse',
    emoji: '🐎',
    description: 'សេះប្រណាំងដ៏ស្រស់ស្អាត រោមពណ៌ខ្មៅរលោង របោមកន្ទុយវែងរលាស់ សាច់ដុំមាំមួន រត់ដោយភាពរស់រវើក (Photorealistic magnificent black stallion horse, glossy coat, flowing mane and tail, muscular athletic build, galloping with grace, 8k)។',
    defaultStyle: 'Cinematic 8K Motion Film, dynamic running action, golden sunset backlight'
  },
  {
    id: 'animal_shark',
    categoryId: 'animals',
    categoryTitle: 'សត្វ (Animals & Creatures)',
    name: 'ត្រីឆ្លាម',
    badge: 'សត្វ • Shark',
    emoji: '🦈',
    description: 'ត្រីឆ្លាមសមុទ្រយក្ស ស្បែកពណ៌ប្រផេះរលោង ធ្មេញមុតស្រួច ព្រុយខ្នងកាត់ផ្ទៃទឹកហែលយ៉ាងលឿនក្នុងទឹកថ្លា (Photorealistic great shark swimming in deep turquoise ocean, smooth hydrodynamic skin, sharp predatory teeth, sun rays penetrating water, 8k)។',
    defaultStyle: 'Cinematic 8K Underwater Film, caustic light beams, clear oceanic depth'
  },

  // 3. រុក្ខជាតិ (Plants & Nature Elements)
  {
    id: 'plant_giant_tree',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ដើមឈើយក្ស',
    badge: 'រុក្ខជាតិ • Giant Tree',
    emoji: '🌳',
    description: 'ដើមឈើយក្សអាយុកាលរាប់ពាន់ឆ្នាំ ដើមធំមហិមា ឫសជ្រៅរាលដាលពាសពេញដី មែកស្លឹកធំគ្របដណ្តប់ផ្ទៃមេឃ មានពន្លឺចាំងកាត់ស្លឹក (Photorealistic ancient giant colossal tree, massive moss-covered trunk, sprawling roots, lush canopy filtering sunlight rays, 8k nature)។',
    defaultStyle: 'Cinematic 8K Nature Epic, atmospheric God rays, volumetric forest mist'
  },
  {
    id: 'plant_sprout',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'កូនពន្លកស្លឹកឈើ',
    badge: 'រុក្ខជាតិ • Sprout',
    emoji: '🌱',
    description: 'កូនពន្លកស្លឹកឈើតូចខ្ចី បញ្ចេញពណ៌បៃតងស្រស់ថ្លា ដុះចេញពីដីមានសំណើម មានតំណក់ទឹកសន្សើមលើស្លឹក (Photorealistic tiny tender plant sprout breaking through moist dark soil, glistening morning dew drops, translucent green leaves, macro shot, 8k)។',
    defaultStyle: 'Cinematic 8K Macro Photography, soft morning backlight, shallow depth of field'
  },
  {
    id: 'plant_monster_flower',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ផ្កាបិសាច',
    badge: 'រុក្ខជាតិ • Monster Flower',
    emoji: '🌺',
    description: 'ផ្កាយក្សបិសាច carnivorous flower ស្រទាប់ផ្កាពណ៌ក្រហមចាស់ មានធ្មេញមុតស្រួចនិងរំញោចវល្លិរស់ (Photorealistic menacing giant carnivorous monster flower, deep crimson petals, sharp jagged teeth, dripping nectar, alien exotic jungle, 8k)។',
    defaultStyle: 'Cinematic 8K Dark Fantasy, moody rim lighting, bioluminescent accents'
  },
  {
    id: 'plant_poison_mushroom',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ផ្សិតពិស',
    badge: 'រុក្ខជាតិ • Poison Mushroom',
    emoji: '🍄',
    description: 'ផ្សិតពិសចម្លែក មួកផ្សិតពណ៌ក្រហមឆ្អៅមានចំណុចស បញ្ចេញផ្សែងនិងពន្លឺចម្លែកៗពេលយប់ (Photorealistic exotic toxic glowing mushrooms, vibrant red cap with white spots, emitting subtle magical spores, mossy dark forest, 8k)។',
    defaultStyle: 'Cinematic 8K Fantasy Macro, glowing bioluminescence, magical forest ambiance'
  },
  {
    id: 'plant_thorn_melon',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ដើមត្រសក់ផ្អែម (បន្លា)',
    badge: 'រុក្ខជាតិ • Thorny Plant',
    emoji: '🌵',
    description: 'ដើមបន្លាត្រសក់ព្រៃ ឬរុក្ខជាតិបន្លាស្រួចៗ ផ្លែមានបន្លាព័ទ្ធជុំវិញ វល្លិបន្លារុំព័ទ្ធគ្នាស្អិតរមួត (Photorealistic thorny wild desert plant with sharp spines, intricate spiky fruit, intertwined thorny vines, harsh natural environment, 8k)។',
    defaultStyle: 'Cinematic 8K Macro Realistic, crisp sharp textures, harsh dramatic desert lighting'
  },
  {
    id: 'plant_living_vine',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'វល្លិរស់',
    badge: 'រុក្ខជាតិ • Living Vine',
    emoji: '🌿',
    description: 'វល្លិរស់មានចលនា រំកិលខ្លួនដូចពស់ ព័ទ្ធជុំវិញដើមឈើឬថ្មបុរាណ មានស្លឹកនិងបន្លាតូចៗ (Photorealistic sentient living creeper vines, creeping with serpentine motion around ancient stone ruins, textured bark, 8k fantasy nature)។',
    defaultStyle: 'Cinematic 8K Fantasy Nature, mystical jungle lighting, rich green textures'
  },
  {
    id: 'plant_dry_branch',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'មែកឈើស្ងួត',
    badge: 'រុក្ខជាតិ • Dry Branch',
    emoji: '🪵',
    description: 'មែកឈើស្ងួតបុរាណ រាងកោងកាច គ្មានស្លឹក ឈរយ៉ាងឯកោក្នុងអ័ព្ទ បង្ហាញពីភាពស្ងប់ស្ងាត់និងអាថ៌កំបាំង (Photorealistic weathered ancient gnarled dead branch, intricate dry wood grain and cracks, misty desolate background, 8k artistic)។',
    defaultStyle: 'Cinematic 8K Moody Atmosphere, monochromatic fog, high dynamic range'
  },
  {
    id: 'plant_magic_lotus',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ផ្កាឈូកវេទមន្ត',
    badge: 'រុក្ខជាតិ • Magic Lotus',
    emoji: '🪷',
    description: 'ផ្កាឈូកវេទមន្តរីកលើផ្ទៃទឹកថ្លា ស្រទាប់ផ្កាពណ៌ផ្កាឈូកនិងខៀវបញ្ចេញពន្លឺភ្លឺផ្លេកៗ រំលេចពន្លឺដូចត្បូង (Photorealistic glowing magical lotus blossom floating on crystal water, shimmering luminous petals, ethereal aura, floating water lilies, 8k)។',
    defaultStyle: 'Cinematic 8K Fantasy Myth, ethereal glowing water reflections, magical particles'
  },
  {
    id: 'plant_living_root',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ឫសឈើរស់',
    badge: 'រុក្ខជាតិ • Living Root',
    emoji: '🪴',
    description: 'ឫសឈើធំៗមានជីវិត ជ្រែកថ្មរូងភ្នំ ចលនាថ្នមៗដូចសរសៃប្រសាទធម្មជាតិ មានស្លែបៃតងរុំព័ទ្ធ (Photorealistic sentient living tree roots moving gently through mossy ancient rocks, intricate bark texture, damp earthy atmosphere, 8k)។',
    defaultStyle: 'Cinematic 8K Underground Fantasy, bioluminescent moss, deep shadows'
  },
  {
    id: 'plant_glowing_grass',
    categoryId: 'plants',
    categoryTitle: 'រុក្ខជាតិ (Plants & Nature Elements)',
    name: 'ស្មៅពន្លឺ',
    badge: 'រុក្ខជាតិ • Glowing Grass',
    emoji: '✨',
    description: 'វាលស្មៅបញ្ចេញពន្លឺពណ៌ខៀវនិងបៃតងភ្លឺផ្លេកៗពេលយប់ ពេលខ្យល់បក់រលកពន្លឺរត់កាត់វាល (Photorealistic glowing bioluminescent alien grass meadow at twilight, waves of cyan and emerald light rippling in breeze, fireflies, 8k)។',
    defaultStyle: 'Cinematic 8K Sci-Fi Fantasy, night bioluminescence, glowing magical particles'
  },

  // 4. តុក្កតា & 3D (Toys, Chibi & 3D Objects)
  {
    id: 'toy_teddy_bear',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'តុក្កតាខ្លាឃ្មុំ (Teddy Bear)',
    badge: 'តុក្កតា 3D • Teddy Bear',
    emoji: '🧸',
    description: 'តុក្កតាខ្លាឃ្មុំរោមទន់ពណ៌ត្នោត ភ្នែកគ្រាប់ឃ្លីខ្មៅរលោង មានស្នាមដេរខ្សែអំបោះគួរឱ្យស្រឡាញ់ ពាក់បូកតូច (Adorable vintage fluffy teddy bear toy, stitched seams, shiny button eyes, soft plush fur texture, warm cozy lighting, 8k)។',
    defaultStyle: '3D Animation / Warm Toy Photography, soft plush textures, macro depth of field'
  },
  {
    id: 'toy_wooden_puppet',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'អាយ៉ងឈើ',
    badge: 'តុក្កតា 3D • Wooden Puppet',
    emoji: '🪵',
    description: 'អាយ៉ងឈើតូចបុរាណ មានសន្លាក់ដៃជើងធ្វើពីឈើឆ្លាក់ ផ្ទៃឈើរលោងមានខ្សែចងបញ្ជា ទឹកមុខញញឹមកំប្លុកកំប្លែង (Charming crafted wooden puppet marionette, articulated joints, hand-carved wood grain, strings attached, expressive doll face, 8k)។',
    defaultStyle: 'Cinematic 3D Animation, detailed wood texture, warm artisanal workshop lighting'
  },
  {
    id: 'toy_cloth_doll',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'តុក្កតាក្រណាត់',
    badge: 'តុក្កតា 3D • Cloth Doll',
    emoji: '🧵',
    description: 'តុក្កតាក្រណាត់ធ្វើដោយដៃ សក់សរសៃអំបោះពណ៌លឿង ស្លៀកពាក់អាវក្រណាត់ផ្កាតូចៗ ភ្នែកដេរប៉ាក់គួរឱ្យស្រឡាញ់ (Handcrafted rag doll, yarn hair, stitched button eyes, charming patchwork dress, soft cloth textures, 8k)។',
    defaultStyle: 'Cute Stop-Motion Animation aesthetic, tactile felt and fabric textures, soft lighting'
  },
  {
    id: 'toy_chibi_doll',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'តុក្កតាក្បាលមូល (Chibi)',
    badge: 'តុក្កតា 3D • Chibi Doll',
    emoji: '🎎',
    description: 'តុក្កតាជ័រ 3D ក្បាលធំខ្លួនតូច បែប Chibi / Pop Mart ភ្នែកធំៗរលោង ផ្ទៃស្បែកជ័រម៉ដ្ឋរលោង ទឹកមុខគួរឱ្យស្រឡាញ់បំផុត (Ultra cute 3D Chibi doll, large glossy round head and eyes, miniature body, collectible vinyl art toy finish, vibrant colors, 8k)។',
    defaultStyle: '3D Vinyl Art Toy, Pop Mart style, Octane Render, smooth studio lighting'
  },
  {
    id: 'toy_mini_robot',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'មនុស្សយន្តតូច (Mini Robot)',
    badge: 'តុក្កតា 3D • Mini Robot',
    emoji: '🤖',
    description: 'មនុស្សយន្តតូច 3D គួរឱ្យស្រឡាញ់ មានក្បាលរាងមូល ភ្នែកអេក្រង់ LED បញ្ចេញទឹកមុខញញឹម ដៃជើងដែកតូចៗ (Cute miniature 3D companion robot, rounded metallic body, glowing LED screen face with happy expressions, cheerful stance, 8k)។',
    defaultStyle: '3D Pixar Sci-Fi Animation, clean metallic shaders, glowing LED effects, Octane Render'
  },
  {
    id: 'toy_drone',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'ដ្រូន (Drone)',
    badge: 'តុក្កតា 3D • Drone',
    emoji: '🛸',
    description: 'ដ្រូនតូចទំនើប 3D មានស្លាបកង្ហារបួន កាមេរ៉ាស្កេនភ្នែកមូលភ្លឺ ភ្លើងសញ្ញានៅស្លាប ហោះហើរបញ្ចេញចលនាស្វាហាប់ (High-tech miniature drone companion, quadcopter rotors, central glowing optical lens eye, sleek aerodynamic body, 8k 3D)។',
    defaultStyle: '3D Sci-Fi Tech Animation, high-gloss carbon fiber, neon indicator lights'
  },
  {
    id: 'toy_plastic_car',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'ឡានជ័រ / ឡានក្មេងលេង',
    badge: 'តុក្កតា 3D • Toy Car',
    emoji: '🚗',
    description: 'ឡានជ័រក្មេងលេង 3D ពណ៌ក្រហមឆ្អៅ កង់ធំៗមូល កញ្ចក់រលោង មានចរិតរួសរាយដូចក្នុងរឿង Cars (Charming stylized 3D toy car, vibrant glossy red paint, animated expressive headlights, chunky rubber tires, studio render, 8k)។',
    defaultStyle: '3D Pixar Cars Animation Style, shiny glossy plastic, studio depth of field'
  },
  {
    id: 'toy_gift_box',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'ប្រអប់កាដូមានជើង',
    badge: 'តុក្កតា 3D • Gift Box',
    emoji: '🎁',
    description: 'ប្រអប់កាដូពណ៌ចម្រុះមានជើងតូចៗរត់ មានបូពណ៌មាសលើក្បាល បើកគម្របចេញពន្លឺវេទមន្តគួរឱ្យភ្ញាក់ផ្អើល (Whimsical animated gift box creature with cute little walking legs, golden ribbon bow, glowing magical surprise inside, 8k 3D)។',
    defaultStyle: '3D Fairytale Animation, vibrant gift wrap textures, sparkling magical particles'
  },
  {
    id: 'toy_voxel_block',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'តួអង្គរាងជ្រុង (Voxel / Block)',
    badge: 'តុក្កតា 3D • Voxel Block',
    emoji: '🧱',
    description: 'តួអង្គរាងជ្រុងប្លុកបែប Voxel / Minecraft រាងកាយកាត់ជាដុំគូបពណ៌ចម្រុះ ចលនាកំប្លុកកំប្លែង (Stylized 3D Voxel block character, cubic geometric aesthetic, pixel-art textures, charming blocky animations, 8k)។',
    defaultStyle: 'Voxel 3D Art, MagicaVoxel render, crisp block textures, vibrant sunny lighting'
  },
  {
    id: 'toy_hologram',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'អង្គធាតុពន្លឺហូឡូក្រាម (Hologram)',
    badge: 'តុក្កតា 3D • Hologram',
    emoji: '🔮',
    description: 'រូបតំណាងហូឡូក្រាម 3D បញ្ចេញពន្លឺពណ៌ខៀវថ្លា មានបន្ទាត់ scanline និងពន្លឺភ្លឺផ្លេកអណ្តែតលើអាកាស (Futuristic translucent 3D holographic avatar, glowing cyan laser scanlines, flickering digital light particles, floating in mid-air, 8k)។',
    defaultStyle: 'Sci-Fi Cyberpunk Hologram, translucent neon shaders, digital glitch particles'
  },
  // កំពូលវីរបុរស 3D (Superheroes 3D Animated)
  {
    id: 'toy_superman_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'កំពូលបុរសដែកថែប 3D (Superman 3D Animated)',
    badge: 'តុក្កតា 3D • Superman 3D',
    emoji: '🦸‍♂️',
    description: 'Cute stylized 3D superhero in bright blue suit and flowing red cape, cheerful heroic face, Pixar and DreamWorks 3D animated movie character style, vibrant colors.',
    defaultStyle: 'Pixar and DreamWorks 3D animated movie character style, vibrant colors, soft volumetric lighting'
  },
  {
    id: 'toy_spiderman_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'មនុស្សពីងពាង 3D (Spider-Man 3D / Into The Spider-Verse)',
    badge: 'តុក្កតា 3D • Spider-Man 3D',
    emoji: '🕷️',
    description: 'Stylized 3D animated web-slinger hero in vivid red and blue spider suit, dynamic comic book shading, expressive big white mask eyes, Spider-Verse stylized 3D look.',
    defaultStyle: 'Spider-Verse stylized 3D look, dynamic comic book shading, vibrant animated colors'
  },
  {
    id: 'toy_ironman_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'បុរសពាសដែក 3D (Iron Man 3D / Chibi Mecha)',
    badge: 'តុក្កតា 3D • Iron Man 3D',
    emoji: '🦾',
    description: 'Cute glossy 3D metallic red and gold armor hero, big glowing round eyes, charming miniature robotic proportions, high-quality 3D toy animation render.',
    defaultStyle: 'High-quality 3D toy animation render, glossy metallic shaders, charming chibi mecha'
  },
  {
    id: 'toy_blue_titan_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'មនុស្សយក្សខៀវ 3D (Chubby Cute Blue Titan 3D)',
    badge: 'តុក្កតា 3D • Blue Titan 3D',
    emoji: '🦍',
    description: 'Charming giant blue titan monster, round friendly face, oversized muscular 3D stylized body, bright blue skin, adorable Disney Pixar animated character style.',
    defaultStyle: 'Adorable Disney Pixar animated character style, vibrant stylized 3D, cute monster render'
  },
  // តួអង្គគំនូរជីវចល 3D បន្ថែម (Additional 3D Animated Characters)
  {
    id: 'toy_wild_caveboy_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'កូនក្មេងព្រៃ 3D (Wild Caveboy)',
    badge: 'តុក្កតា 3D • Wild Caveboy',
    emoji: '👦',
    description: 'Cute wild caveboy character inspired by Spot, big green eyes, messy brown hair, crawling pose, leaf loincloth, Pixar 3D animation style.',
    defaultStyle: 'Pixar 3D animation style, lush prehistoric jungle, soft ambient daylight'
  },
  {
    id: 'toy_adventurer_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'អ្នកផ្សងព្រេង 3D (3D Adventurer)',
    badge: 'តុក្កតា 3D • 3D Adventurer',
    emoji: '🧔‍♂️',
    description: 'Stylized 3D adventurer man, neat beard, brown hair, green field shirt with suspenders, Disney Pixar 3D animated style.',
    defaultStyle: 'Disney Pixar 3D animated style, rich tactile textures, warm adventure lighting'
  },
  {
    id: 'toy_baby_rhino_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'កូនសត្វរមាស 3D (Baby Rhino Creature)',
    badge: 'តុក្កតា 3D • Baby Rhino Creature',
    emoji: '🦏',
    description: 'Adorable baby blue-grey rhino creature, smooth horn, cute stylized yellow chicks on top, Pixar 3D animation look.',
    defaultStyle: 'Pixar 3D animation look, smooth clay/vinyl character finish, sunny savanna lighting'
  },
  {
    id: 'toy_nezha_3d',
    categoryId: 'toys_3d',
    categoryTitle: 'តុក្កតា & 3D (Toys, Chibi & 3D Objects)',
    name: 'កុមារទេពណាចា (Nezha Style)',
    badge: 'តុក្កតា 3D • Nezha Style',
    emoji: '🥋',
    description: 'Stylized 3D Nezha character, mischievous face, twin hair buns, red vest, martial arts stance, Chinese 3D animation style.',
    defaultStyle: 'Chinese 3D animation style, dynamic martial arts aura, rich vivid colors'
  },

  // 5. ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)
  {
    id: 'myth_giant',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'យក្ស',
    badge: 'ទេវកថា • Giant (Yeak)',
    emoji: '👹',
    description: 'យក្សខ្មែរដ៏មហិមា សាច់ដុំធំមហិមា ពាក់គ្រឿងអលង្ការនិងមកុដបុរាណ កាន់ដំបងពេជ្រ ភ្នែកធំៗក្រឡោត ចង្កូមស្រួចកោង (Majestic ancient Khmer Yeak (Giant), colossal muscular titan, traditional ornate gold armor and crown, glowing fierce eyes, holding diamond mace, 8k epic)។',
    defaultStyle: 'Cinematic 8K Epic Fantasy, dramatic rim lighting, ancient temple ruins backdrop'
  },
  {
    id: 'myth_dragon',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'នាគ',
    badge: 'ទេវកថា • Dragon (Naga)',
    emoji: '🐉',
    description: 'នាគរាជបុរាណ ស្រកាមាសនិងត្បូងខៀវ ក្បាលពពាក់ពពូនដោយក្បាច់ក្បូរខ្មែរ បញ្ចេញកម្ដៅពន្លឺមហិមា (Majestic mythical Naga dragon, iridescent emerald and gold scales, ornate serpentine crested head, mystical aura, floating over sacred waters, 8k)។',
    defaultStyle: 'Cinematic 8K Mythological Masterpiece, mystical glowing mist, volumetric epic light'
  },
  {
    id: 'myth_garuda',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'គ្រុឌ',
    badge: 'ទេវកថា • Garuda',
    emoji: '🦅',
    description: 'គ្រុឌដ៏មហិមា ស្លាបធំទូលាយពណ៌មាស ចំពុះស្រួចរឹងមាំ កំពុងហោះហើរលើពពកដោយអំណាច (Majestic mythical Garuda bird king, magnificent golden feather wings, razor-sharp beak, ornate royal chest ornaments, soaring through clouds, 8k)។',
    defaultStyle: 'Cinematic 8K Mythological Epic, golden sky sunset lighting, breathtaking depth'
  },
  {
    id: 'myth_angel',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'ទេវតា',
    badge: 'ទេវកថា • Angel / Devata',
    emoji: '👼',
    description: 'ទេវតាដ៏ស្រស់ស្អាត ទឹកមុខទន់ភ្លន់បរិសុទ្ធ ពាក់ម្កុដរាជវង្សនិងគ្រឿងអលង្ការទេពអប្សរ បញ្ចេញរស្មីពណ៌មាសជុំវិញខ្លួន (Celestial divine Devata / Angel, ethereal glowing aura, traditional ornate celestial jewelry and crown, radiant peaceful expression, floating gracefully, 8k)។',
    defaultStyle: 'Cinematic 8K Divine Fantasy, soft celestial glow, floating lotus petals and light rays'
  },
  {
    id: 'myth_ghost',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'ខ្មោច / ព្រលឹង',
    badge: 'វិញ្ញាណ • Ghost / Spirit',
    emoji: '👻',
    description: 'ព្រលឹងវិញ្ញាណពណ៌សថ្លាអណ្តែតលើអាកាស មានផ្សែងអ័ព្ទព័ទ្ធជុំវិញ ភ្នែកមានពន្លឺស្រាល បង្ហាញភាពអាថ៌កំបាំង (Mysterious ethereal translucent ghost spirit, floating wisps of vapor, faint glowing eyes, hauntingly beautiful atmosphere, moonlit fog, 8k)។',
    defaultStyle: 'Cinematic 8K Dark Mystery, eerie moonlight, soft atmospheric mist'
  },
  {
    id: 'myth_shadow_demon',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'បិសាចស្រមោល',
    badge: 'វិញ្ញាណ • Shadow Demon',
    emoji: '🌑',
    description: 'បិសាចស្រមោលងងឹត រាងកាយផ្សំពីផ្សែងខ្មៅក្រាស់ មានភ្នែកក្រហមឆ្អៅដូចភ្លើង រំកិលខ្លួនស្ងៀមស្ងាត់ (Menacing shadow demon creature, swirling dense black smoke silhouette, glowing menacing red fiery eyes, sinister tendrils, 8k dark fantasy)។',
    defaultStyle: 'Cinematic 8K Dark Fantasy, deep obsidian shadows, high-contrast red embers'
  },
  {
    id: 'myth_living_skeleton',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'គ្រោងឆ្អឹងរស់',
    badge: 'ទេវកថា • Living Skeleton',
    emoji: '💀',
    description: 'គ្រោងឆ្អឹងរស់បុរាណ ពាក់អាវក្រោះដែកចាស់ៗ ភ្នែកបញ្ចេញភ្លើងពណ៌ខៀវវេទមន្ត កាន់ដាវបុរាណ (Animated ancient skeleton warrior, weathered bone texture, rusted antique armor, glowing ethereal blue eye sockets, holding ancient sword, 8k)។',
    defaultStyle: 'Cinematic 8K Fantasy RPG, cold mystical blue lighting, dungeon stone textures'
  },
  {
    id: 'myth_living_flame',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'អណ្តាតភ្លើងរស់',
    badge: 'ធាតុរស់ • Living Flame',
    emoji: '🔥',
    description: 'អណ្តាតភ្លើងមានជីវិត រូបរាងកាយជាអគ្គីរាំរែក បញ្ចេញកម្ដៅនិងផ្កាភ្លើង មានភ្នែកភ្លឺចិញ្ចាចដូចកម្អែលភ្នំភ្លើង (Living sentient elemental fire spirit, dancing blazing flames forming fluid body, sparkling embers, molten magma eyes, intense warm glow, 8k)។',
    defaultStyle: 'Cinematic 8K Elemental Fantasy, vibrant heat distortion, dynamic fiery particles'
  },
  {
    id: 'myth_living_waterdrop',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'ដំណក់ទឹករស់',
    badge: 'ធាតុរស់ • Living Waterdrop',
    emoji: '💧',
    description: 'ដំណក់ទឹកមានជីវិត រូបរាងថ្លាដូចកញ្ចក់ បញ្ចេញពន្លឺឆ្លុះផ្ទៃទឹក មានចលនារលោងទន់ភ្លន់ (Sentient living water elemental creature, crystal-clear liquid body, refracting light, fluid organic motion, sparkling water droplets, 8k)។',
    defaultStyle: 'Cinematic 8K Macro Fluid Simulation, prismatic caustics, clean turquoise depth'
  },
  {
    id: 'myth_living_stone',
    categoryId: 'mythical',
    categoryTitle: 'ទេវកថា & វិញ្ញាណ (Mythical & Fantasy)',
    name: 'ដុំថ្មរស់',
    badge: 'ធាតុរស់ • Living Stone',
    emoji: '🪨',
    description: 'យក្សថ្មរស់ ផ្សំឡើងពីផ្ទាំងថ្មធំៗនិងស្លែ មានស្នាមប្រេះបញ្ចេញពន្លឺវេទមន្តពណ៌មាស សាច់ដុំថ្មរឹងមាំ (Colossal living sentient stone golem, massive weathered rock boulders, moss and ancient runes, glowing golden cracks, grounded power, 8k)។',
    defaultStyle: 'Cinematic 8K Fantasy Epic, deep earthy textures, glowing runic energy'
  }
];

export interface StoryCharacterItem {
  id: string;
  typeId: string;
  name: string;
  role: string;
  customName: string;
  categoryId: string;
  emoji: string;
  badge: string;
  description: string;
  defaultStyle?: string;
}

const createCharacterItem = (
  typeItem: CharacterTypeItem,
  role = 'តួឯក (Protagonist)',
  customName = ''
): StoryCharacterItem => ({
  id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  typeId: typeItem.id,
  name: typeItem.name,
  role,
  customName,
  categoryId: typeItem.categoryId,
  emoji: typeItem.emoji,
  badge: typeItem.badge,
  description: typeItem.description,
  defaultStyle: typeItem.defaultStyle
});

const getDefaultCharacterList = (): StoryCharacterItem[] => {
  const boy = CHARACTER_TYPES.find((t) => t.id === 'human_boy') || CHARACTER_TYPES[0];
  return [createCharacterItem(boy, 'តួឯក (Protagonist)')];
};

const formatCharactersDescription = (list: StoryCharacterItem[]): string => {
  if (list.length === 0) return '';
  if (list.length === 1) {
    const c = list[0];
    const roleLabel = [c.customName, c.role].filter(Boolean).join(' • ');
    return `${c.name}${roleLabel ? ` (${roleLabel})` : ''}៖ ${c.description}`;
  }
  return list
    .map((c, i) => {
      const roleLabel = [c.customName, c.role].filter(Boolean).join(' • ');
      return `• តួអង្គទី ${i + 1} [${c.name}${roleLabel ? ` - ${roleLabel}` : ''}]៖ ${c.description}`;
    })
    .join('\n\n');
};

const CHARACTER_COMBOS = [
  {
    name: '👦 ទោល (Solo)',
    emoji: '👤',
    items: [{ id: 'human_boy', role: 'តួឯក (Solo Protagonist)' }]
  },
  {
    name: '👦👧 គូកុមារ (Boy & Girl)',
    emoji: '👫',
    items: [
      { id: 'human_boy', role: 'តួឯក (Boy)' },
      { id: 'human_girl', role: 'ដៃគូ (Girl)' }
    ]
  },
  {
    name: '👨👩 យុវជន & យុវតី',
    emoji: '💑',
    items: [
      { id: 'human_young_man', role: 'តួឯក (Hero)' },
      { id: 'human_young_woman', role: 'តួឯកស្រី (Heroine)' }
    ]
  },
  {
    name: '👦🐾 ក្មេង & សត្វចិញ្ចឹម',
    emoji: '🐕',
    items: [
      { id: 'human_boy', role: 'កុមារ (Master)' },
      { id: 'animals_golden_retriever', role: 'សត្វចិញ្ចឹមស្មោះត្រង់ (Pet)' }
    ]
  },
  {
    name: '👨‍👩‍👧 គ្រួសារតូច (Family 3)',
    emoji: '👨‍👩‍👧',
    items: [
      { id: 'human_young_man', role: 'ឪពុក (Father)' },
      { id: 'human_young_woman', role: 'ម្តាយ (Mother)' },
      { id: 'human_girl', role: 'កូនស្រី (Daughter)' }
    ]
  },
  {
    name: '🧙‍♂️🐉 អ្នកក្លាហាន & នាគ',
    emoji: '🐉',
    items: [
      { id: 'human_young_man', role: 'អ្នកក្លាហាន (Warrior)' },
      { id: 'myth_dragon', role: 'នាគទិព្វ (Guardian Dragon)' }
    ]
  },
  {
    name: '🦸‍♂️⚡ សម្ព័ន្ធវីរបុរស (Superheroes Duo)',
    emoji: '🦸‍♂️',
    items: [
      { id: 'human_superman_realistic', role: 'មេដឹកនាំ (Leader)' },
      { id: 'human_ironman_realistic', role: 'អ្នកបច្ចេកវិទ្យា (Tech Support)' }
    ]
  },
  {
    name: '🧸🦸‍♂️ វីរបុរស 3D (3D Hero Team)',
    emoji: '🕷️',
    items: [
      { id: 'toy_superman_3d', role: 'វីរបុរស 3D (Hero)' },
      { id: 'toy_spiderman_3d', role: 'ជំនួយការ 3D (Sidekick)' }
    ]
  }
];

export interface CinematicStylePreset {
  id: string;
  icon: string;
  label: string;
  subtitle: string;
  badge: string;
  value: string;
}

export const CINEMATIC_STYLE_PRESETS: CinematicStylePreset[] = [
  {
    id: 'cinematic-8k',
    icon: '🎬',
    label: '🎬 ភាពយន្តកម្រិត 8K (Cinematic 8K Realistic)',
    subtitle: 'Hyper-realistic, 35mm film grain, anamorphic lens flare',
    badge: '8K Realistic',
    value: 'Cinematic 8K, hyper-realistic, authentic 35mm film grain, anamorphic lens flare, soft natural studio lighting, rich color grading, deep contrast, atmospheric backlight, highly detailed textures'
  },
  {
    id: '3d-pixar',
    icon: '🧸',
    label: '🧸 ជីវចល 3D (3D Pixar / Disney Style)',
    subtitle: 'Unreal Engine 5, stylized character, vibrant color palette',
    badge: '3D Pixar',
    value: '3D Pixar animation style, Disney rendered, Unreal Engine 5, stylized character, vibrant color palette, soft subsurface scattering, volumetric warm lighting, ray tracing, expressive 8K render'
  },
  {
    id: 'khmer-fantasy',
    icon: '🏛️',
    label: '🏛️ រឿងព្រេងខ្មែរ (Khmer Mythological / Fantasy)',
    subtitle: 'Angkor Wat aesthetic, gold & emerald, mystical ethereal glow',
    badge: 'Khmer Myth',
    value: 'Khmer mythical fantasy style, Angkor Wat aesthetic, rich gold and emerald tones, mystical ethereal glow, ancient ornate patterns, cinematic soft rim lighting, magical realism, 8K'
  },
  {
    id: 'anime-ghibli',
    icon: '🎨',
    label: '🎨 គំនូរជីវចលជប៉ុន (Anime Ghibli Style)',
    subtitle: 'Studio Ghibli aesthetic, Makoto Shinkai lighting, painted clouds',
    badge: 'Ghibli Anime',
    value: 'Studio Ghibli aesthetic, Makoto Shinkai lighting, beautiful painted clouds, dreamy vibrant colors, aesthetic twilight sky, hand-drawn anime details, nostalgic warm lighting, masterpiece illustration'
  },
  {
    id: 'cyberpunk-neon',
    icon: '🌃',
    label: '🌃 អនាគតទំនើប (Cyberpunk Neon)',
    subtitle: 'Neon teal & magenta light, dramatic night lighting, reflective wet surfaces',
    badge: 'Cyberpunk',
    value: 'Cyberpunk aesthetic, neon teal and magenta light, dramatic night lighting, reflective wet surfaces, high contrast, cinematic depth of field, sharp focus, futuristic urban mood, 8K'
  },
  {
    id: 'custom',
    icon: '✍️',
    label: '✍️ កំណត់ផ្ទាល់ខ្លួន (Custom Style...)',
    subtitle: 'បញ្ចូលពាក្យគន្លឹះ និង Prompt Visual Style ផ្ទាល់ខ្លួន',
    badge: 'Custom',
    value: 'custom'
  }
];

export interface KhmerFontPreset {
  id: string;
  name: string;
  font: string;
  tag?: string;
}

export const DEFAULT_HEADING_FONT = "'Moul', cursive";
export const DEFAULT_BODY_FONT = "'Battambang', sans-serif";

export const HEADING_FONT_OPTIONS: KhmerFontPreset[] = [
  { id: 'moul', name: 'មូល (Moul) • រាជវង្សបុរាណ (Default)', font: "'Moul', cursive", tag: 'Default' },
  {
    id: 'kh-ang-moulhand-2',
    name: 'Kh Ang MoulHand 2 • ម៉ូដក្បូរក្បាច់ដៃ',
    font: "'Kh Ang MoulHand 2', 'Kh Ang MoulHand', 'Kh Ang MuraHand 2', 'Kh Ang MuraHand', 'Ang MoulHand 2', 'Ang MoulHand', 'Moul', cursive",
    tag: 'ក្បាច់ដៃ'
  },
  { id: 'koulen', name: 'គូលែន (Koulen) • ក្បាលរឿងក្រាស់', font: "'Koulen', cursive", tag: 'ពេញនិយម' },
  { id: 'bayon', name: 'បាយ័ន (Bayon) • ប្រាសាទខ្មែរ', font: "'Bayon', cursive", tag: 'បុរាណ' },
  { id: 'angkor', name: 'អង្គរ (Angkor) • មហានគរ', font: "'Angkor', cursive", tag: 'អង្គរ' },
  { id: 'chenla', name: 'ចេនឡា (Chenla) • ប្រវត្តិសាស្ត្រ', font: "'Chenla', cursive", tag: 'ប្រវត្តិ' },
  { id: 'fasthand', name: 'ហ្វាសហែន (Fasthand) • ក្បាច់សិល្បៈ', font: "'Fasthand', cursive", tag: 'សិល្បៈ' },
  { id: 'dangrek', name: 'ដងរែក (Dangrek) • ម៉ឺងម៉ាត់', font: "'Dangrek', cursive", tag: 'រឹងមាំ' },
  { id: 'bokor', name: 'បូកគោ (Bokor) • បុរាណកម្សាន្ត', font: "'Bokor', cursive", tag: 'បុរាណ' },
  { id: 'taprom', name: 'តាព្រហ្ម (Taprom) • អាថ៌កំបាំង', font: "'Taprom', cursive", tag: 'អាថ៌កំបាំង' },
  { id: 'preahvihear', name: 'ព្រះវិហារ (Preahvihear) • ថ្លៃថ្នូរ', font: "'Preahvihear', sans-serif", tag: 'ស្រស់ស្អាត' },
  { id: 'kdam-thmor', name: 'ក្តាមថ្ម (Kdam Thmor) • ទាន់សម័យ', font: "'Kdam Thmor Pro', sans-serif", tag: 'ទាន់សម័យ' },
  { id: 'kantumruy', name: 'កន្ទុំរុយ (Kantumruy Pro) • ទំនើប', font: "'Kantumruy Pro', sans-serif", tag: 'ទំនើប' },
  { id: 'battambang', name: 'បាត់ដំបង (Battambang) • ស្តង់ដារ', font: "'Battambang', sans-serif", tag: 'ស្តង់ដារ' },
];

export const BODY_FONT_OPTIONS: KhmerFontPreset[] = [
  { id: 'battambang', name: 'បាត់ដំបង (Battambang) • ស្តង់ដារ (Default)', font: "'Battambang', sans-serif", tag: 'Default' },
  { id: 'kantumruy', name: 'កន្ទុំរុយ (Kantumruy Pro) • ស្រួលអាន', font: "'Kantumruy Pro', sans-serif", tag: 'ស្រួលអាន' },
  { id: 'siemreap', name: 'សៀមរាប (Siemreap) • ស្រទន់រលូន', font: "'Siemreap', sans-serif", tag: 'ស្រទន់' },
  { id: 'moul', name: 'មូល (Moul) • រាជវង្សបុរាណ', font: "'Moul', cursive", tag: 'រាជវង្ស' },
  { id: 'preahvihear', name: 'ព្រះវិហារ (Preahvihear) • ទន់ភ្លន់', font: "'Preahvihear', sans-serif", tag: 'ទន់ភ្លន់' },
  { id: 'kdam-thmor', name: 'ក្តាមថ្ម (Kdam Thmor Pro) • ទំនើប', font: "'Kdam Thmor Pro', sans-serif", tag: 'ទាន់សម័យ' },
  { id: 'nokora', name: 'នគរា (Nokora) • ផ្លូវការរដ្ឋបាល', font: "'Nokora', sans-serif", tag: 'ផ្លូវការ' },
  { id: 'suwannaphum', name: 'សុវណ្ណភូមិ (Suwannaphum) • អក្សរសិល្ប៍', font: "'Suwannaphum', sans-serif", tag: 'អក្សរសិល្ប៍' },
  { id: 'hanuman', name: 'ហនុមាន (Hanuman) • ក្បាច់ស្រាល', font: "'Hanuman', serif", tag: 'មានក្បាច់' },
  { id: 'koh-santepheap', name: 'កោះសន្តិភាព (Koh Santepheap) • ព័ត៌មាន', font: "'Koh Santepheap', sans-serif", tag: 'ព័ត៌មាន' },
  { id: 'content', name: 'ខនថិន (Content) • អត្ថបទវែង', font: "'Content', sans-serif", tag: 'អត្ថបទ' },
  { id: 'odor-mean-chey', name: 'ឧត្តរមានជ័យ (Odor Mean Chey)', font: "'Odor Mean Chey', cursive", tag: 'ច្បាស់' },
  { id: 'koulen', name: 'គូលែន (Koulen) • ក្បាលរឿងក្រាស់', font: "'Koulen', cursive", tag: 'ក្បាលរឿង' },
];

export default function App() {
  const [title, setTitle] = useState('');
  const [totalDuration, setTotalDuration] = useState(60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [durationPerPrompt, setDurationPerPrompt] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('human');
  const [selectedCharacterType, setSelectedCharacterType] = useState<string>('human_boy');

  // Multi-character state
  const [characterList, setCharacterList] = useState<StoryCharacterItem[]>(() => {
    try {
      const saved = localStorage.getItem('story_app_character_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return getDefaultCharacterList();
  });
  const [showCharactersModal, setShowCharactersModal] = useState<boolean>(false);
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);

  const characterCount = characterList.length;

  const applyCharacterList = (newList: StoryCharacterItem[], toastMsg?: string) => {
    setCharacterList(newList);
    const formatted = formatCharactersDescription(newList);
    setCharacters(formatted);
    try {
      localStorage.setItem('story_app_character_list', JSON.stringify(newList));
      localStorage.setItem('story_app_character_count', String(newList.length));
    } catch {
      // ignore
    }
    if (toastMsg) {
      showToast(toastMsg);
    }
  };

  const handleCharacterCountChange = (count: number) => {
    const clamped = Math.max(1, Math.min(10, count));
    handleSetCharacterCountDirect(clamped);
  };

  const handleSetCharacterCountDirect = (targetCount: number) => {
    const clamped = Math.max(1, Math.min(10, targetCount));
    if (clamped === characterList.length) return;

    if (clamped < characterList.length) {
      const trimmed = characterList.slice(0, clamped);
      applyCharacterList(trimmed, `👥 បានកំណត់ចំនួនតួអង្គ៖ ${clamped} នាក់`);
      return;
    }

    // Expanding
    const nextList = [...characterList];
    const candidateTypes = [
      'human_girl',
      'human_young_woman',
      'human_young_man',
      'animals_golden_retriever',
      'human_elder_man',
      'myth_dragon',
      'toys_teddy',
      'plants_flower_fairy',
      'animals_tiger'
    ];
    while (nextList.length < clamped) {
      const nextIdx = nextList.length;
      const typeId = candidateTypes[nextIdx % candidateTypes.length] || 'human_boy';
      const item = CHARACTER_TYPES.find((t) => t.id === typeId) || CHARACTER_TYPES[0];
      const defaultRole = nextIdx === 1 ? 'ដៃគូ (Partner)' : nextIdx === 2 ? 'ជំនួយការ (Sidekick)' : nextIdx === 3 ? 'គូប្រជែង (Rival)' : `តួអង្គទី ${nextIdx + 1}`;
      nextList.push(createCharacterItem(item, defaultRole));
    }
    applyCharacterList(nextList, `👥 បានបន្ថែមតួអង្គសរុប៖ ${clamped} នាក់`);
  };

  const handleAddCharacter = (typeId?: string, role = 'ដៃគូ (Partner)') => {
    if (characterList.length >= 10) {
      showToast('⚠️ អាចកំណត់តួអង្គបានអតិបរមា ១០ នាក់!');
      return;
    }
    const defaultTypeId = typeId || (characterList.length === 1 ? 'human_girl' : 'animals_golden_retriever');
    const item = CHARACTER_TYPES.find((t) => t.id === defaultTypeId) || CHARACTER_TYPES[0];
    const newChar = createCharacterItem(item, role);
    const updated = [...characterList, newChar];
    applyCharacterList(updated, `✨ បានបន្ថែមតួអង្គ «${item.name}» (សរុប ${updated.length} នាក់)!`);
    setEditingCharIndex(updated.length - 1);
    setShowCharactersModal(true);
  };

  const handleRemoveCharacter = (index: number) => {
    if (characterList.length <= 1) {
      showToast('⚠️ ត្រូវមានយ៉ាងហោចណាស់ ១ តួអង្គក្នុងសាច់រឿង!');
      return;
    }
    const removedName = characterList[index]?.name || '';
    const updated = characterList.filter((_, i) => i !== index);
    applyCharacterList(updated, `🗑️ បានលុបតួអង្គទី ${index + 1} (${removedName})`);
  };

  const handleUpdateCharacter = (index: number, updates: Partial<StoryCharacterItem>) => {
    const updated = characterList.map((item, i) => (i === index ? { ...item, ...updates } : item));
    applyCharacterList(updated);
  };

  const handleApplyCharacterTypeToSlot = (index: number, newTypeId: string) => {
    const typeObj = CHARACTER_TYPES.find((t) => t.id === newTypeId);
    if (!typeObj) return;
    const updated = characterList.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          typeId: typeObj.id,
          name: typeObj.name,
          categoryId: typeObj.categoryId,
          emoji: typeObj.emoji,
          badge: typeObj.badge,
          description: typeObj.description,
          defaultStyle: typeObj.defaultStyle,
        };
      }
      return item;
    });
    applyCharacterList(updated, `👤 បានប្តូរតួអង្គទី ${index + 1} ទៅជា «${typeObj.name}»`);
  };

  const handleApplyCombo = (comboItems: { id: string; role: string }[]) => {
    const newList: StoryCharacterItem[] = comboItems.map((c) => {
      const typeObj = CHARACTER_TYPES.find((t) => t.id === c.id) || CHARACTER_TYPES[0];
      return createCharacterItem(typeObj, c.role);
    });
    applyCharacterList(newList, `✨ បានកំណត់គំរូតួអង្គ (${newList.length} នាក់) រួចរាល់!`);
  };

  const [themeColor, setThemeColor] = useState<string>(() => {
    try {
      return localStorage.getItem('app_theme_color') || '#eab308';
    } catch {
      return '#eab308';
    }
  });

  const handleThemeColorChange = (color: string) => {
    setThemeColor(color);
    try {
      localStorage.setItem('app_theme_color', color);
    } catch {
      // ignore
    }
  };

  // Font Style, Size & Color state (ម៉ូដចំណងជើងធំ, ម៉ូដអត្ថបទ & រង, ទំហំអក្សរ, ពណ៌អក្សរ)
  const [headingFontFamily, setHeadingFontFamily] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('story_app_heading_font');
      if (!saved || saved.includes('MoulHand') || saved.includes('MuraHand')) {
        return DEFAULT_HEADING_FONT;
      }
      return saved;
    } catch {
      return DEFAULT_HEADING_FONT;
    }
  });

  const [bodyFontFamily, setBodyFontFamily] = useState<string>(() => {
    try {
      const saved =
        localStorage.getItem('story_app_body_font') ||
        localStorage.getItem('story_app_font_family');
      if (!saved || saved.includes('Kantumruy Pro') || saved.includes('MoulHand')) {
        return DEFAULT_BODY_FONT;
      }
      return saved;
    } catch {
      return DEFAULT_BODY_FONT;
    }
  });

  const [appFontSize, setAppFontSize] = useState<string>(() => {
    try {
      return localStorage.getItem('story_app_font_size') || 'normal';
    } catch {
      return 'normal';
    }
  });

  const [appFontColor, setAppFontColor] = useState<string>(() => {
    try {
      return localStorage.getItem('story_app_font_color') || '#ffffff';
    } catch {
      return '#ffffff';
    }
  });

  const handleHeadingFontChange = (font: string) => {
    setHeadingFontFamily(font);
    try {
      localStorage.setItem('story_app_heading_font', font);
    } catch {
      // ignore
    }
    showToast('👑 បានប្តូរម៉ូដអក្សរចំណងជើងធំរួចរាល់!');
  };

  const handleBodyFontChange = (font: string) => {
    setBodyFontFamily(font);
    try {
      localStorage.setItem('story_app_body_font', font);
      localStorage.setItem('story_app_font_family', font);
    } catch {
      // ignore
    }
    showToast('✍️ បានប្តូរម៉ូដអក្សររង & អត្ថបទរួចរាល់!');
  };

  const handleFontSizeChange = (size: string) => {
    setAppFontSize(size);
    try {
      localStorage.setItem('story_app_font_size', size);
    } catch {
      // ignore
    }
    const labelMap: Record<string, string> = {
      small: 'តូច (Small)',
      normal: 'ល្មម (Normal)',
      large: 'ធំ (Large)',
      xlarge: 'ធំខ្លាំង (Extra Large)',
    };
    showToast(`📏 បានប្តូរទំហំអក្សរទៅជា «${labelMap[size] || size}» រួចរាល់!`);
  };

  const handleFontColorChange = (color: string) => {
    setAppFontColor(color);
    try {
      localStorage.setItem('story_app_font_color', color);
    } catch {
      // ignore
    }
  };

  // Dynamic DOM effect: Sync typography & scale across all devices and viewport resizes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', appFontSize);
    const sizeMap: Record<string, string> = {
      small: '13.5px',
      normal: '16px',
      large: '18.5px',
      xlarge: '21px',
    };
    root.style.fontSize = sizeMap[appFontSize] || '16px';
  }, [appFontSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--heading-font', headingFontFamily);
  }, [headingFontFamily]);

  useEffect(() => {
    document.documentElement.style.setProperty('--body-font', bodyFontFamily);
  }, [bodyFontFamily]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-color', appFontColor);
  }, [appFontColor]);

  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('story_app_theme_id') || 'royal-angkor';
    } catch {
      return 'royal-angkor';
    }
  });

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    try {
      localStorage.setItem('story_app_theme_id', themeId);
    } catch {
      // ignore
    }
    const found = THEME_PRESETS.find((t) => t.id === themeId);
    if (found) {
      setThemeColor(found.accent);
      try {
        localStorage.setItem('app_theme_color', found.accent);
      } catch {
        // ignore
      }
      showToast(`✨ បានជ្រើសរើស Theme៖ «${found.name}»`);
    }
  };

  const [selectedColorCategory, setSelectedColorCategory] = useState<'solid' | 'gradient'>('solid');
  const [selectedColorId, setSelectedColorId] = useState<string>(() => {
    try {
      return localStorage.getItem('story_app_color_id') || 'purple';
    } catch {
      return 'purple';
    }
  });
  const [appSurfaceMode, setAppSurfaceMode] = useState<'light' | 'tint' | 'dark'>(() => {
    try {
      return (localStorage.getItem('story_app_surface_mode') as 'light' | 'tint' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });
  const [isThemeExpanded, setIsThemeExpanded] = useState<boolean>(false);
  const [isCustomTheme, setIsCustomTheme] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState({
    menuBg: '#220845',
    menuText: '#FFFFFF',
    resultBg: '#faf5ff',
    resultText: '#581c87',
  });
  const [description, setDescription] = useState('');
  const [characters, setCharacters] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('story_app_character_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return formatCharactersDescription(parsed);
        }
      }
    } catch {
      // ignore
    }
    return formatCharactersDescription(getDefaultCharacterList());
  });

  // Visual / Cinematic Style presets & custom state
  const [selectedStylePresetId, setSelectedStylePresetId] = useState<string>('cinematic-8k');
  const [customStyleText, setCustomStyleText] = useState<string>('Cinematic 8K, 35mm lens, atmospheric volumetric lighting, highly detailed textures');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState<boolean>(false);
  const [visualStyle, setVisualStyle] = useState<string>(CINEMATIC_STYLE_PRESETS[0].value);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    }
    if (isStyleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStyleDropdownOpen]);

  const handleSelectStylePreset = (preset: CinematicStylePreset) => {
    setSelectedStylePresetId(preset.id);
    setIsStyleDropdownOpen(false);
    if (preset.id === 'custom') {
      const activeText = customStyleText.trim() || 'Cinematic 8K, 35mm lens, atmospheric volumetric lighting, highly detailed textures';
      if (!customStyleText.trim()) {
        setCustomStyleText(activeText);
      }
      setVisualStyle(activeText);
      showToast('✍️ បានជ្រើសរើសរបៀបកំណត់ Style ផ្ទាល់ខ្លួន!');
    } else {
      setVisualStyle(preset.value);
      showToast(`🎬 បានជ្រើសរើស Style៖ ${preset.label}`);
    }
  };

  const handleCustomStyleChange = (text: string) => {
    setCustomStyleText(text);
    setVisualStyle(text);
  };

  const [promptLanguage, setPromptLanguage] = useState<string>('english');
  const [characterSpokenLanguage, setCharacterSpokenLanguage] = useState<string>('khmer');
  const [dialogueMode, setDialogueMode] = useState<'with_dialogue' | 'without_dialogue'>('with_dialogue');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StoryResult | null>(() => getLatestActiveStory());
  const [history, setHistory] = useState<HistoryStory[]>(() => getInitialHistory());
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    type: 'single' | 'all';
    itemId?: string;
    itemTitle?: string;
  } | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState<boolean>(false);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedStoryIndex, setCopiedStoryIndex] = useState<number | null>(null);
  const [copiedAllIndex, setCopiedAllIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [resultViewMode, setResultViewMode] = useState<'cards' | 'compact'>('cards');
  const [selectedSceneFilter, setSelectedSceneFilter] = useState<number | 'all'>(1);
  const [showHowToUseGuide, setShowHowToUseGuide] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');

  // License Key Management State
  const [currentDeviceId, setCurrentDeviceId] = useState<string>(() => getOrCreateDeviceId());
  const [licenseData, setLicenseData] = useState<LicenseData | null>(() => {
    try {
      const vipStatus = localStorage.getItem('app_vip_status');
      const savedKey = localStorage.getItem('app_license_key');
      if (vipStatus === 'active' && savedKey) {
        return getSavedLicense() || {
          key: savedKey,
          plan_type: 'VIP Member',
          is_active: true,
          expires_at: null,
          activated_at: new Date().toISOString(),
          device_id: getOrCreateDeviceId(),
        };
      }
    } catch {
      // ignore
    }
    return getSavedLicense();
  });
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>(() => {
    try {
      const savedKey = localStorage.getItem('app_license_key');
      if (savedKey) return savedKey;
    } catch {
      // ignore
    }
    const saved = getSavedLicense();
    return saved?.key || '';
  });
  const [isActivatingLicense, setIsActivatingLicense] = useState<boolean>(false);
  const [licenseFeedback, setLicenseFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const licenseFeedbackTimerRef = useRef<any>(null);
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState<boolean>(false);
  const [showVipModal, setShowVipModal] = useState<boolean>(false);

  const displayLicenseFeedback = (
    feedback: { type: 'success' | 'error'; message: string } | null,
    autoDismissMs?: number
  ) => {
    if (licenseFeedbackTimerRef.current) {
      clearTimeout(licenseFeedbackTimerRef.current);
      licenseFeedbackTimerRef.current = null;
    }
    setLicenseFeedback(feedback);
    if (feedback && feedback.type === 'success') {
      const ms = autoDismissMs || 4000;
      licenseFeedbackTimerRef.current = setTimeout(() => {
        setLicenseFeedback(null);
      }, ms);
    }
  };

  // Auto-restore and preserve License & History on app startup / page refresh (Window Load)
  useEffect(() => {
    // 1. Immediately read 'app_vip_status' & 'app_license_key' from localStorage
    try {
      const vipStatus = localStorage.getItem('app_vip_status');
      const savedKey = localStorage.getItem('app_license_key');
      if (vipStatus === 'active') {
        const saved = getSavedLicense() || {
          key: savedKey || 'VIP-ACTIVE',
          plan_type: 'VIP Member',
          is_active: true,
          expires_at: null,
          activated_at: new Date().toISOString(),
          device_id: getOrCreateDeviceId(),
        };
        setLicenseData(saved);
        if (savedKey) {
          setLicenseKeyInput(savedKey);
        }
        setErrorMessage('');
        setShowVipModal(false);
      } else if (vipStatus === 'inactive') {
        setLicenseData(null);
      } else {
        const saved = getSavedLicense();
        if (saved && saved.is_active) {
          setLicenseData(saved);
          if (saved.key) {
            setLicenseKeyInput(saved.key);
          }
        }
      }
    } catch {
      const saved = getSavedLicense();
      if (saved && saved.is_active) {
        setLicenseData(saved);
        if (saved.key) {
          setLicenseKeyInput(saved.key);
        }
      }
    }

    // 2. Proactively re-verify with Supabase in background if active
    const curVip = typeof window !== 'undefined' ? localStorage.getItem('app_vip_status') : null;
    if (curVip !== 'inactive') {
      checkAndRestoreLicenseOnStartup().then((restored) => {
        if (restored) {
          setLicenseData(restored);
          if (restored.device_id) {
            setCurrentDeviceId(restored.device_id);
          }
          if (restored.key) {
            setLicenseKeyInput(restored.key);
          }
        }
      });
    }

    // 3. Reconcile and load persistent story history from IndexedDB (survives clearing tabs and app closing)
    loadPersistentHistory().then((persisted) => {
      if (persisted && persisted.length > 0) {
        setHistory(persisted);
      }
    });
  }, []);

  useEffect(() => {
    const vipStatus = typeof window !== 'undefined' ? localStorage.getItem('app_vip_status') : null;
    if (vipStatus === 'inactive') {
      setLicenseData(null);
    } else {
      const current = getSavedLicense();
      if (current && current.is_active) {
        setLicenseData(current);
        if (!licenseKeyInput && current.key) {
          setLicenseKeyInput(current.key);
        }
      }
    }
    setCurrentDeviceId(getOrCreateDeviceId());
    setShowConfirmDeactivate(false);
    setLicenseFeedback(null); // Clear old feedback so it never persists permanently
    return () => {
      if (licenseFeedbackTimerRef.current) {
        clearTimeout(licenseFeedbackTimerRef.current);
      }
    };
  }, [showSettingsModal]);

  // Automatically hide VIP alerts when a valid License is active
  useEffect(() => {
    if (
      (licenseData?.is_active && isLicenseValid()) ||
      (typeof window !== 'undefined' && localStorage.getItem('app_vip_status') === 'active')
    ) {
      setErrorMessage('');
      setShowVipModal(false);
    }
  }, [licenseData]);

  // Active panel tab: 'setup' (ផ្ទាំងសាច់រឿង) | 'results' (លទ្ធផល Prompt) | 'history' (ប្រវត្តិរឿង)
  const [activeTab, setActiveTab] = useState<'setup' | 'results' | 'history'>('setup');
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const setupRef = useRef<HTMLDivElement | null>(null);

  const activeDuration = isCustomDuration ? customMinutes * 60 : totalDuration;
  const estimatedScenes = Math.max(2, Math.round(activeDuration / durationPerPrompt));

  // Active selected theme object from THEME_PRESETS (defaulting to royal-angkor)
  const baseActiveTheme: ThemePreset =
    THEME_PRESETS.find((t) => t.id === selectedThemeId) ||
    THEME_PRESETS[0];

  const activeTheme: ThemePreset = {
    ...baseActiveTheme,
    accent: themeColor || baseActiveTheme.accent,
    menuText: appFontColor || baseActiveTheme.menuText,
  };

  const handleColorCategoryChange = (catId: 'solid' | 'gradient') => {
    setSelectedColorCategory(catId);
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    setIsCustomTheme(false);
    const item = COLOR_PRESETS.find((c) => c.id === colorId);
    if (item) {
      setSelectedColorCategory(item.categoryId);
    }
    try {
      localStorage.setItem('story_app_color_id', colorId);
    } catch {
      // ignore
    }
  };

  const handleSurfaceModeChange = (mode: 'light' | 'tint' | 'dark') => {
    setAppSurfaceMode(mode);
    try {
      localStorage.setItem('story_app_surface_mode', mode);
    } catch {
      // ignore
    }
  };

  const handleResetTheme = () => {
    handleSelectTheme('royal-angkor');
    handleThemeColorChange('#eab308');
    handleSurfaceModeChange('light');
    handleHeadingFontChange(DEFAULT_HEADING_FONT);
    handleBodyFontChange(DEFAULT_BODY_FONT);
    handleFontSizeChange('normal');
    handleFontColorChange('#ffffff');
    showToast('🔄 បានកំណត់ Theme និងម៉ូដអក្សរត្រឡប់ទៅដើមវិញ (Moul & Battambang Default)');
  };

  const handleActivateLicense = async () => {
    const keyToActivate = licenseKeyInput.trim();
    if (!keyToActivate) {
      const emptyMsg = '⚠️ សូមបញ្ចូលលេខកូដអាជ្ញាប័ណ្ណរបស់អ្នក!';
      displayLicenseFeedback({ type: 'error', message: emptyMsg }, 4000);
      showToast(emptyMsg);
      return;
    }

    setIsActivatingLicense(true);
    setLicenseFeedback(null);
    try {
      const res = await activateLicenseKey(keyToActivate);
      if (res.success && res.data) {
        setLicenseData(res.data);
        if (res.data.device_id) {
          setCurrentDeviceId(res.data.device_id);
        }
        try {
          localStorage.setItem('app_license_key', res.data.key);
          localStorage.setItem('app_vip_status', 'active');
          localStorage.setItem('app_license_data', JSON.stringify(res.data));
        } catch {
          // ignore
        }
        displayLicenseFeedback({ type: 'success', message: res.message }, 4000);
        setErrorMessage('');
        setShowVipModal(false);
        showToast('🎉 បានដំណើរការអាជ្ញាប័ណ្ណជោគជ័យ! ស្ថានភាព៖ 🟢 បានដំណើរការ (VIP Active)');
      } else {
        displayLicenseFeedback({ type: 'error', message: res.message }, 5000);
        showToast(res.message);
      }
    } catch {
      const errMsg = '❌ បរាជ័យក្នុងការភ្ជាប់ទៅ Server សូមព្យាយាមម្តងទៀត!';
      displayLicenseFeedback({
        type: 'error',
        message: errMsg,
      }, 5000);
      showToast(errMsg);
    } finally {
      setIsActivatingLicense(false);
    }
  };

  const handleRemoveLicense = async () => {
    setIsActivatingLicense(true);
    const saved = getSavedLicense();
    const targetKey =
      licenseData?.key ||
      saved?.key ||
      licenseKeyInput ||
      (typeof window !== 'undefined' ? localStorage.getItem('app_license_key') : '') ||
      '';

    try {
      // 1. Update Supabase device_id ទៅជា null តាម Logic ដើម
      let resMessage = 'ℹ️ បានដកអាជ្ញាប័ណ្ណចេញ និងដោះសោឧបករណ៍ក្នុង Supabase រួចរាល់។';
      if (targetKey) {
        const res = await deactivateLicenseKey(targetKey);
        if (res?.message) resMessage = res.message;
      } else {
        await deactivateLicenseKey();
      }

      // 2. លុបចេញពីម៉ាស៊ីន (localStorage + multi-storage)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('app_license_key');
          localStorage.removeItem('app_license_data');
          localStorage.removeItem('app_vip_status');
          localStorage.setItem('app_vip_status', 'inactive');
        }
      } catch {
        // ignore
      }
      removeSavedLicense();

      // 3. ប្តូរស្ថានភាពទៅជា Inactive ភ្លាមៗ
      setLicenseData(null);
      setLicenseKeyInput('');
      setShowConfirmDeactivate(false);

      displayLicenseFeedback({ type: 'success', message: resMessage }, 3500);
      showToast('ℹ️ បានដកអាជ្ញាប័ណ្ណចេញ និងប្តូរស្ថានភាពទៅជា Inactive');
    } catch {
      removeSavedLicense();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('app_license_key');
          localStorage.removeItem('app_license_data');
          localStorage.removeItem('app_vip_status');
          localStorage.setItem('app_vip_status', 'inactive');
        }
      } catch {
        // ignore
      }
      setLicenseData(null);
      setLicenseKeyInput('');
      setShowConfirmDeactivate(false);
      displayLicenseFeedback({ type: 'success', message: 'ℹ️ បានដកអាជ្ញាប័ណ្ណចេញពីម៉ាស៊ីនរួចរាល់។' }, 3500);
      showToast('ℹ️ បានដកអាជ្ញាប័ណ្ណចេញរួចរាល់');
    } finally {
      setIsActivatingLicense(false);
    }
  };

  const handleRemoveLicenseClick = async () => {
    let userConfirmed = false;
    let didExecuteNative = false;

    try {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        const start = performance.now();
        userConfirmed = window.confirm("តើអ្នកពិតជាចង់ដកអាជ្ញាប័ណ្ណនេះចេញពីម៉ាស៊ីននេះមែនទេ?");
        const elapsed = performance.now() - start;
        // If user confirmed OR if the native modal held the JS thread for > 15ms (meaning user saw dialog and pressed Cancel)
        if (userConfirmed || elapsed >= 15) {
          didExecuteNative = true;
        }
      }
    } catch {
      didExecuteNative = false;
    }

    if (didExecuteNative) {
      if (userConfirmed) {
        await handleRemoveLicense();
      }
      return;
    }

    // Fallback if window.confirm was blocked in iframe sandbox without user interaction
    setShowConfirmDeactivate(true);
  };

  const selectedCharacterObj =
    CHARACTER_TYPES.find((t) => t.id === selectedCharacterType) || CHARACTER_TYPES[0];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId !== 'all') {
      const firstInCat = CHARACTER_TYPES.find((t) => t.categoryId === catId);
      if (firstInCat) {
        setSelectedCharacterType(firstInCat.id);
        setCharacters(firstInCat.description);
        if (firstInCat.defaultStyle) {
          setVisualStyle(firstInCat.defaultStyle);
        }
      }
    }
  };

  const handleCharacterSelectById = (id: string) => {
    const item = CHARACTER_TYPES.find((t) => t.id === id);
    if (item) {
      setSelectedCharacterType(item.id);
      setSelectedCategory(item.categoryId);
      setCharacters(item.description);
      if (item.defaultStyle) {
        setVisualStyle(item.defaultStyle);
      }
    }
  };

  const handleSelectCharacterType = (typeItem: typeof CHARACTER_TYPES[0]) => {
    setSelectedCharacterType(typeItem.id);
    setSelectedCategory(typeItem.categoryId);
    setCharacters(typeItem.description);
    if (typeItem.defaultStyle) {
      setVisualStyle(typeItem.defaultStyle);
    }
  };

  const generateClientFallback = (): StoryResult => {
    const sceneCount = Math.max(2, Math.min(50, Math.round(activeDuration / durationPerPrompt)));
    const scenes: Scene[] = [];
    const charDesc = characters.trim() || 'តួអង្គសំខាន់';
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

    for (let i = 1; i <= sceneCount; i++) {
      const startSec = (i - 1) * durationPerPrompt;
      const endSec = i * durationPerPrompt;
      const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
      };
      const timeRange = `${formatTime(startSec)} - ${formatTime(endSec)}`;

      let phaseTitle = '';
      let actionDesc = '';
      let cameraMotion = '';

      // Contextual Dialogue dynamically generated based on title, description, and scene progression
      const spokenDialogue = isWithDialogue
        ? buildContextualDialogue(title, description, i, sceneCount, characterSpokenLanguage, charDesc)
        : '';

      if (isAlphabet) {
        const alphabetLetter = String.fromCharCode(65 + ((i - 1) % 26));
        if (isKhmerPrompt) {
          phaseTitle = `រៀនអក្សរ ${alphabetLetter} (${alphabetLetter} is for ...)`;
          actionDesc = `${charDesc} បង្ហាញនិងបញ្ចេញសំឡេងអក្សរ ${alphabetLetter} ដោយក្តីរីករាយ និងចង្អុលទៅកាន់វត្ថុតំណាងអក្សរនេះយ៉ាងរស់រវើកក្នុងទិដ្ឋភាព ${description}។`;
          cameraMotion = `ចលនាកាមេរ៉ារំកិលចូលជិត ផ្តោតលើតួអង្គនិងអក្សរ ${alphabetLetter}`;
        } else {
          phaseTitle = `Learning Letter ${alphabetLetter}`;
          actionDesc = `${charDesc} cheerfully introduces and pronounces Letter ${alphabetLetter}, interacting directly with the object representing this letter in the setting of ${description}.`;
          cameraMotion = `Cinematic medium close-up pan-in focusing on character presenting Letter ${alphabetLetter}`;
        }
      } else if (i === 1) {
        if (isKhmerPrompt) {
          phaseTitle = 'ផ្តើមរឿង និងបង្ហាញវត្តមានតួអង្គ';
          actionDesc = isWithDialogue
            ? `បង្ហាញពីវត្តមានដំបូងរបស់ ${charDesc} នៅក្នុងទិដ្ឋភាព ${description}។ តួអង្គឈានជើងចូលក្នុងទីតាំងដោយការប្រុងប្រយ័ត្នខ្ពស់ ក្រឡេកមើលជុំវិញដោយអារម្មណ៍ភ្ញាក់ផ្អើល។`
            : `បង្ហាញពីវត្តមានដំបូងរបស់ ${charDesc} នៅក្នុងទិដ្ឋភាព ${description}។ (ឈុតគ្មានការនិយាយ) តួអង្គឈានជើងចូលក្នុងទីតាំងដោយស្ងប់ស្ងាត់ ប្រុងប្រយ័ត្នខ្ពស់ សម្តែងតាមរយៈកាយវិការ ទឹកមុខ និងចលនាដកដង្ហើមស្ងប់ស្ងាត់។`;
          cameraMotion = 'ចលនាកាមេរ៉ារំកិលយឺតៗចូលជិត បង្ហាញទិដ្ឋភាពទូទៅរួមផ្សំជាមួយប្លង់មធ្យម';
        } else {
          phaseTitle = 'Opening Scene & Character Introduction';
          actionDesc = isWithDialogue
            ? `First appearance of ${charDesc} in the setting of ${description}. The character carefully steps forward into the environment, looking around with alert curiosity.`
            : `First appearance of ${charDesc} in the setting of ${description}. [SILENT SCENE - NO DIALOGUE / ZERO SPEECH]: Pure visual storytelling through expressive body language, focused facial expression, and steady deliberate movement without speaking.`;
          cameraMotion = 'Slow cinematic pan-in, establishing wide shot transitioning into medium shot';
        }
      } else if (i === sceneCount) {
        if (isKhmerPrompt) {
          phaseTitle = 'ចំណុចកំពូល ឬការសម្រេចគោលដៅ';
          actionDesc = isWithDialogue
            ? `${charDesc} ឈានដល់ដំណោះស្រាយដ៏សំខាន់នៃដំណើររឿង ដោយរក្សាសម្លៀកបំពាក់និងទឹកមុខដដែល ក្រឡេកមើលទៅកាន់ទិសដៅខាងមុខដោយក្តីសង្ឃឹម និងស្នាមញញឹមជ័យជម្នះ។`
            : `${charDesc} ឈានដល់ដំណោះស្រាយដ៏សំខាន់នៃដំណើររឿង (គ្មានការនិយាយ) ដោយរក្សាសម្លៀកបំពាក់និងទឹកមុខដដែល ក្រឡេកមើលទៅកាន់ទិសដៅខាងមុខដោយក្តីសង្ឃឹម និងស្នាមញញឹមជ័យជម្នះ តាមរយៈអារម្មណ៍ជ្រាលជ្រៅនៃក្រសែភ្នែក។`;
          cameraMotion = 'ចលនាកាមេរ៉ាប្លង់ទាបដកថយក្រោយយឺតៗ បង្ហាញទិដ្ឋភាពវីរភាពដ៏អស្ចារ្យ';
        } else {
          phaseTitle = 'Climax & Story Resolution';
          actionDesc = isWithDialogue
            ? `${charDesc} reaches the critical story resolution, maintaining identical clothing and facial expression, looking forward with determination and hopeful resolve.`
            : `${charDesc} reaches the critical story resolution [SILENT SCENE - NO DIALOGUE]. Maintaining identical clothing and appearance, gazing forward with deep cinematic determination and emotional triumph purely through ocular focus and posture.`;
          cameraMotion = 'Dramatic low-angle tracking shot pulling back slowly into a wide epic view';
        }
      } else {
        if (isKhmerPrompt) {
          phaseTitle = `ដំណើររឿងភាគបន្តបន្ទាប់ទី ${i}`;
          actionDesc = isWithDialogue
            ? `តួអង្គ ${charDesc} បន្តសកម្មភាពពីឈុតមុនភ្លាមៗដោយគ្មានការកាត់ចោល។ កំពុងប្រឈមមុខនឹងឧបសគ្គនៅក្នុងបរិយាកាស ${description} ដោយទឹកមុខម៉ឺងម៉ាត់។`
            : `តួអង្គ ${charDesc} បន្តសកម្មភាពពីឈុតមុនភ្លាមៗដោយគ្មានការកាត់ចោល។ (គ្មានការនិយាយ) កំពុងប្រឈមមុខនឹងឧបសគ្គនៅក្នុងបរិយាកាស ${description} ដោយការប្រុងប្រយ័ត្នខ្ពស់ ឆ្លើយតបដោយសកម្មភាពរហ័សរហួន និងកាយវិការជំនាញ។`;
          cameraMotion = 'ចលនាកាមេរ៉ារំកិលតាមដានសកម្មភាពតួអង្គយ៉ាងរលូន មានជម្រៅរូបភាពភាពយន្តច្បាស់លាស់';
        } else {
          phaseTitle = `Sequential Continuation Scene ${i}`;
          actionDesc = isWithDialogue
            ? `Character ${charDesc} seamlessly continues action from previous shot without jump cuts, actively navigating through ${description} with resolute focus.`
            : `Character ${charDesc} seamlessly continues action from previous shot without jump cuts. [SILENT ACTION - NO DIALOGUE]: Navigating through ${description} purely through agile physical maneuvers, tense eye contact, and focused tactical action.`;
          cameraMotion = 'Smooth continuous tracking shot following character motion with cinematic depth of field';
        }
      }

      let dialogueLine = '';
      if (isWithDialogue) {
        if (isKhmerPrompt) {
          dialogueLine = `• ${pLang.dialogueLabel}៖ តួអង្គនិយាយជា${sLang.nameKhmer} (${sLang.nameEnglish})៖ ${spokenDialogue} ដោយមានចលនាបបូរមាត់ត្រូវគ្នា និងទឹកមុខរស់រវើក។`;
        } else {
          dialogueLine = `• ${pLang.dialogueLabel}: Character speaks in ${sLang.nameEnglish} (${sLang.nameKhmer}): ${spokenDialogue} with synchronized lip movement, natural vocal cadence, and expressive facial performance.`;
        }
      } else {
        dialogueLine = `• ${pLang.dialogueLabel}: ${pLang.silentNotice}`;
      }

      let aiPrompt = '';
      if (isKhmerPrompt) {
        aiPrompt = `${pLang.shotLabel} ${i}: ${phaseTitle}
${timeRange} (${durationPerPrompt} វិនាទី)
• ${pLang.cameraLabel}៖ ${cameraMotion}
• ${pLang.actionLabel}៖ ${actionDesc}
• ${pLang.continuityLabel}៖ រក្សាតួអង្គ ${charDesc} មុខមាត់ សម្លៀកបំពាក់ និងម៉ូតសក់ដដែល ១០០% គ្មានការប្រែប្រួល និងតភ្ជាប់សាច់រឿងបន្តពីឈុតមុនយ៉ាងរលូន។
${dialogueLine}
• ${pLang.lightingLabel}៖ ${visualStyle}, រូបភាពភាពយន្តកម្រិតខ្ពស់, ពន្លឺធម្មជាតិច្បាស់ត្រជាក់ភ្នែក`;
      } else {
        aiPrompt = `${pLang.shotLabel} ${i}: ${phaseTitle}
${timeRange} (${durationPerPrompt}s)
• ${pLang.cameraLabel}: ${cameraMotion}
• ${pLang.actionLabel}: ${actionDesc}
• ${pLang.continuityLabel}: Continuous identical character throughout all shots: ${charDesc}, same facial features, matching hairstyle, identical clothing and colors. Seamless narrative progression from previous shot with zero jump cuts.
${dialogueLine}
• ${pLang.lightingLabel}: ${visualStyle}, Cinematic 8K, photorealistic masterpiece, 35mm lens, dramatic volumetric lighting.`;
      }

      scenes.push({
        sceneNumber: i,
        scene_number: i,
        timeRange,
        title_context: title,
        sceneTitleKhmer: `${pLang.shotLabel} ${i}: ${phaseTitle}`,
        sceneStoryKhmer: isKhmerPrompt ? actionDesc : '',
        aiVideoPrompt: aiPrompt,
        visual_prompt: aiPrompt,
        dialogue: isWithDialogue ? spokenDialogue : '[SILENT SCENE - NO DIALOGUE]',
        voiceover: actionDesc,
        cameraMotion,
        continuityNotes: isKhmerPrompt
          ? `រក្សាតួអង្គ ${charDesc} ទាំងសម្លៀកបំពាក់ ម៉ូតសក់ និងលក្ខណៈសម្គាល់ដដែល ១០០%។ (${isWithDialogue ? `និយាយ${sLang.nameKhmer}` : 'គ្មានការនិយាយ'})`
          : `Lock character ${charDesc} identical clothing, hair, and seamless continuity from previous shot. (${isWithDialogue ? `Spoken in ${sLang.nameEnglish}` : 'Silent Scene'})`
      });
    }

    return {
      storyTitle: title,
      style: visualStyle,
      charactersSummary: charDesc,
      totalScenes: sceneCount,
      scenes
    };
  };

  const saveStoryToHistory = (storyData: StoryResult) => {
    try {
      const now = new Date();
      const dateFormatted = `${now.toLocaleDateString('km-KH')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const allPrompts = (storyData.scenes || []).map((s) => s.aiVideoPrompt);
      const newItem: HistoryStory = {
        id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: storyData.storyTitle,
        storyTitle: storyData.storyTitle,
        timestamp: Date.now(),
        createdAt: Date.now(),
        dateFormatted,
        duration: isCustomDuration ? `${customMinutes} នាទី` : `${totalDuration} វិនាទី`,
        shots: storyData.totalScenes,
        totalScenes: storyData.totalScenes,
        totalDurationSeconds: activeDuration,
        durationPerPromptSeconds: durationPerPrompt,
        characters,
        description,
        visualStyle,
        prompts: allPrompts,
        result: storyData,
      };

      saveLatestActiveStory(storyData);

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.id !== newItem.id && h.storyTitle !== storyData.storyTitle && h.title !== storyData.storyTitle);
        const updated = [newItem, ...filtered].slice(0, 50);
        persistNewHistoryItem(newItem, prev);
        return updated;
      });
    } catch (e) {
      console.error('Failed to save to history', e);
    }
  };

  const handleCopyHistoryStoryAll = async (item: HistoryStory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let fullText = '';
    if (item.result?.scenes?.length) {
      fullText = item.result.scenes
        .map(
          (s) =>
            `=== [Shot ${s.sceneNumber} (${s.timeRange}): ${s.sceneTitleKhmer}] ===\n` +
            (s.sceneStoryKhmer ? `📖 ដំណើររឿង៖ ${s.sceneStoryKhmer}\n` : '') +
            `🤖 ALL-IN-ONE MASTER PROMPT:\n${s.aiVideoPrompt}\n` +
            `🎥 Camera Motion: ${s.cameraMotion}\n` +
            `🛡️ Continuity Lock: ${s.continuityNotes}\n`
        )
        .join('\n----------------------------------------\n\n');
    } else if (item.prompts?.length) {
      fullText = item.prompts.map((p, i) => `=== [Shot ${i + 1}] ===\n${p}`).join('\n\n');
    }

    try {
      await navigator.clipboard.writeText(fullText);
      showToast(`📋 បានចម្លង Prompts ទាំងអស់នៃរឿង «${item.title || item.storyTitle}» រួចរាល់!`);
    } catch (err) {
      console.error('Failed to copy history prompts', err);
    }
  };

  const handleLoadHistory = (item: HistoryStory) => {
    setTitle(item.title || item.storyTitle);
    setDescription(item.description || '');
    setCharacters(item.characters || '');
    const loadedStyle = item.visualStyle || '';
    setVisualStyle(loadedStyle);
    const matchedPreset = CINEMATIC_STYLE_PRESETS.find((p) => p.id !== 'custom' && p.value === loadedStyle);
    if (matchedPreset) {
      setSelectedStylePresetId(matchedPreset.id);
    } else if (loadedStyle) {
      setSelectedStylePresetId('custom');
      setCustomStyleText(loadedStyle);
    }
    setResult(item.result);
    saveLatestActiveStory(item.result);
    setSelectedSceneFilter(1);
    setShowHistoryModal(false);
    setActiveTab('results');
    showToast(`📖 បានទាញ Prompts រឿង «${item.title || item.storyTitle}» មកបង្ហាញលើផ្ទាំងលទ្ធផល Prompt រួចរាល់!`);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent, title?: string) => {
    e.stopPropagation();
    setDeleteConfirmState({
      type: 'single',
      itemId: id,
      itemTitle: title || 'សាច់រឿងនេះ',
    });
  };

  const handleClearAllHistory = () => {
    setDeleteConfirmState({
      type: 'all',
    });
  };

  const executeConfirmedDelete = () => {
    if (!deleteConfirmState) return;

    if (deleteConfirmState.type === 'single' && deleteConfirmState.itemId) {
      const id = deleteConfirmState.itemId;
      setHistory((prev) => {
        const updated = prev.filter((h) => h.id !== id);
        removeHistoryItem(id, prev);
        return updated;
      });
      showToast('🗑️ បានលុបសាច់រឿងចេញពីប្រវត្តិ!');
    } else if (deleteConfirmState.type === 'all') {
      setHistory([]);
      clearAllHistory();
      showToast('🗑️ បានសម្អាតប្រវត្តិសាច់រឿងទាំងអស់!');
    }

    setDeleteConfirmState(null);
  };

  const handleAutoGenerateDescription = async () => {
    const saved = getSavedLicense();
    const isVipStatus = typeof window !== 'undefined' && localStorage.getItem('app_vip_status') === 'active';
    const isLicenseActive = Boolean((isVipStatus || licenseData?.is_active || saved?.is_active) && isLicenseValid());
    if (isLicenseActive && !licenseData && saved) {
      setLicenseData(saved);
    }
    if (!isLicenseActive) {
      const vipMsg = 'មុខងារនេះសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ! សូមបញ្ចូល License Key របស់អ្នកដើម្បីដោះសោ។';
      setErrorMessage(vipMsg);
      displayLicenseFeedback({ type: 'error', message: vipMsg }, 6000);
      showToast(`⭐ ${vipMsg}`);
      setShowVipModal(true);
      setShowSettingsModal(true);
      return;
    }

    if (!title.trim()) {
      showToast('⚠️ សូមសរសេរចំណងជើងរឿងជាមុនសិន ដើម្បីឱ្យ AI បង្កើត Description ត្រូវតាមប្រធានបទ!');
      const titleInput = document.getElementById('story-title');
      if (titleInput) {
        titleInput.focus();
      }
      return;
    }

    setIsGeneratingDescription(true);
    showToast(`✨ កំពុងបង្កើត Description ត្រូវតាមប្រធានបទ "${title}"...`);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          characters,
          characterType: selectedCharacterType,
          characterCount,
          visualStyle,
          dialogueMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      if (data.description) {
        setDescription(data.description);
        showToast(`🎉 បានបង្កើត Description ត្រូវតាមចំណងជើងរឿង "${title}" រួចរាល់!`);
      } else {
        throw new Error('No description returned');
      }
    } catch {
      // High-quality contextual fallback matching theme and dialogueMode
      const char = characters && characters.trim() ? characters.trim() : 'តួអង្គសំខាន់';
      const isWithDialogue = dialogueMode === 'with_dialogue';
      const lowerTitle = title.toLowerCase();
      let fallbackDesc = '';

      if (lowerTitle.includes('ឆបោក') || lowerTitle.includes('scam') || lowerTitle.includes('លួច') || lowerTitle.includes('អន្ទាក់')) {
        fallbackDesc = isWithDialogue
          ? `ដំណើររឿង «${title}» ឆ្លុះបញ្ចាំងពីបរិយាកាសតានតឹងនៃពិភពបច្ចេកវិទ្យាងងឹត នៅក្នុងបន្ទប់ពោរពេញដោយពន្លឺអេក្រង់កុំព្យូទ័រ និងសារជូនដំណឹងក្លែងក្លាយជាច្រើន។ ${char} ត្រូវប្រឈមមុខនឹងអន្ទាក់នៃការបោកបញ្ឆោតតាមបណ្តាញសង្គម ដោយមានការសន្ទនាយ៉ាងស្វិតស្វាញ ទាំងការបញ្ចុះបញ្ចូល ការគំរាមកំហែង និងការតស៊ូទម្លាយការពិតដើម្បីកុំឱ្យធ្លាក់ចូលក្នុងកលល្បិចរបស់ក្រុមឧក្រិដ្ឋជន។`
          : `ដំណើររឿង «${title}» បង្ហាញពីបរិយាកាសដ៏ស្ងប់ស្ងាត់គួរឱ្យភ័យខ្លាចនៃបន្ទប់ប្រតិបត្តិការឆបោកអនឡាញ ដែលមានតែពន្លឺភ្លឹបភ្លែតពីម៉ូនីទ័រ និងសារហិរញ្ញវត្ថុក្លែងក្លាយរាប់សិប។ (ឈុតគ្មានការនិយាយ) ${char} សម្តែងតាមរយៈក្រសែភ្នែកស្រពិចស្រពិល ការញ័រដៃពេលចុចគ្រាប់ចុច និងកាយវិការតានតឹងឆ្លុះបញ្ចាំងពីភាពអន្ទះអន្ទែងក្នុងការរត់គេចពីអន្ទាក់បច្ចេកវិទ្យាដ៏គ្រោះថ្នាក់នេះ។`;
      } else {
        fallbackDesc = isWithDialogue
          ? `ដំណើររឿង «${title}» ផ្តោតលើដំណើររឿងដ៏ស៊ីជម្រៅរបស់ ${char} ដែលបានឈានជើងចូលទៅក្នុងទិដ្ឋភាពដែលត្រូវនឹងប្រធានបទនេះយ៉ាងច្បាស់លាស់។ នៅក្នុងបរិយាកាសដ៏រស់រវើក តួអង្គមានការសន្ទនានិយាយចំៗសាច់រឿង ផ្លាស់ប្តូរពាក្យសម្តីយ៉ាងមានទម្ងន់ ប្រឈមមុខនឹងឧបសគ្គចំពោះមុខ និងតស៊ូដើម្បីសម្រេចគោលដៅនៃដំណើររឿង។`
          : `ដំណើររឿង «${title}» បង្ហាញពីបរិយាកាសដ៏អស្ចារ្យ និងមានភាពអាថ៌កំបាំងដែលត្រូវនឹងប្រធានបទនេះយ៉ាងពេញលេញ។ តាមរយៈឈុតគ្មានការនិយាយ (Silent Narrative) ${char} ធ្វើដំណើរឆ្លងកាត់ទីកន្លែងដ៏ទាក់ទាញដោយប្រើកាយវិការ ទឹកមុខម៉ឺងម៉ាត់ និងសកម្មភាពរហ័សរហួន ដើម្បីជំនះឧបសគ្គនិងសម្រេចគោលដៅ ដោយផ្តល់នូវទិដ្ឋភាពភាពយន្តដ៏ទាក់ទាញគ្រប់វិនាទី។`;
      }

      setDescription(fallbackDesc);
      showToast(`🎉 បានបង្កើត Description ត្រូវតាមចំណងជើងរឿង "${title}" រួចរាល់!`);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerate = async () => {
    // ពិនិត្យស្ថានភាព License៖ ប្រសិនបើមិនទាន់ Active (isActive === false) មិនត្រូវអនុញ្ញាតឱ្យបង្កើតជាដាច់ខាត
    const saved = getSavedLicense();
    const isVipStatus = typeof window !== 'undefined' && localStorage.getItem('app_vip_status') === 'active';
    const isLicenseActive = Boolean((isVipStatus || licenseData?.is_active || saved?.is_active) && isLicenseValid());
    if (isLicenseActive && !licenseData && saved) {
      setLicenseData(saved);
    }
    if (!isLicenseActive) {
      const vipMsg = 'មុខងារនេះសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ! សូមបញ្ចូល License Key របស់អ្នកដើម្បីដោះសោ។';
      setErrorMessage(vipMsg);
      displayLicenseFeedback({ type: 'error', message: vipMsg }, 6000);
      showToast(`⭐ ${vipMsg}`);
      setShowVipModal(true);
      setShowSettingsModal(true);
      return;
    }

    if (!title.trim()) {
      setErrorMessage('សូមសរសេរចំណងជើងនៃរឿងជាមុនសិន!');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('សូមសរសេរការពិពណ៌នាសាច់រឿង (Description)!');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setActiveTab('results');

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          totalDurationSeconds: activeDuration,
          durationPerPromptSeconds: durationPerPrompt,
          description,
          characters,
          characterType: selectedCharacterType,
          characterCount,
          visualStyle,
          promptLanguage,
          characterSpokenLanguage,
          dialogueMode
        })
      });

      if (!response.ok) {
        throw new Error('មានបញ្ហាក្នុងការបង្កើត prompt');
      }

      const data: StoryResult = await response.json();
      setResult(data);
      saveStoryToHistory(data);
      setSelectedSceneFilter(1);
      setActiveTab('results');
      showToast(`🎉 បានបង្កើត AI Video Prompts (${data.totalScenes} ឈុត) រួចរាល់!`);
    } catch (err: unknown) {
      console.warn('Backend call fallback to smart generator:', err);
      // Seamlessly generate structured fallback so user is never blocked
      const fallbackData = generateClientFallback();
      setResult(fallbackData);
      saveStoryToHistory(fallbackData);
      setSelectedSceneFilter(1);
      setActiveTab('results');
      showToast(`🎉 បានបង្កើត AI Video Prompts (${fallbackData.totalScenes} ឈុត) រួចរាល់!`);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleCopyPrompt = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setCopiedPromptIndex(index);
      const sceneNum = result?.scenes[index]?.sceneNumber || index + 1;
      showToast(`✅ បានចម្លង AI Video Prompt ឈុតទី ${sceneNum} រួចរាល់!`);
      setTimeout(() => {
        setCopiedIndex(null);
        setCopiedPromptIndex(null);
      }, 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyStoryKhmer = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStoryIndex(index);
      const sceneNum = result?.scenes[index]?.sceneNumber || index + 1;
      showToast(`📝 បានចម្លងសាច់រឿងខ្មែរ ឈុតទី ${sceneNum} រួចរាល់!`);
      setTimeout(() => setCopiedStoryIndex(null), 2200);
    } catch (err) {
      console.error('Failed to copy Khmer story', err);
    }
  };

  const handleCopyFullScene = async (scene: Scene, index: number) => {
    const fullSceneText =
      `🎬 ឈុតទី ${scene.sceneNumber} (${scene.timeRange}): ${scene.sceneTitleKhmer}\n` +
      `----------------------------------------\n` +
      `📖 សាច់រឿងបន្តជាភាសាខ្មែរ៖\n${scene.sceneStoryKhmer}\n\n` +
      `🤖 AI Video Prompt៖\n${scene.aiVideoPrompt}\n\n` +
      `🎥 ចលនាកាមេរ៉ា (Camera Motion)៖ ${scene.cameraMotion}\n` +
      `🛡️ ការរក្សាតួអង្គ & សាច់រឿង (Continuity)៖ ${scene.continuityNotes}`;
    try {
      await navigator.clipboard.writeText(fullSceneText);
      setCopiedAllIndex(index);
      showToast(`✨ បានចម្លងព័ត៌មានទាំងស្រុងនៃឈុតទី ${scene.sceneNumber} រួចរាល់!`);
      setTimeout(() => setCopiedAllIndex(null), 2200);
    } catch (err) {
      console.error('Failed to copy full scene', err);
    }
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const fullText = result.scenes
      .map(
        (s) =>
          `=== [Shot ${s.sceneNumber} (${s.timeRange}): ${s.sceneTitleKhmer}] ===\n` +
          (s.sceneStoryKhmer ? `📖 ដំណើររឿង៖ ${s.sceneStoryKhmer}\n` : '') +
          `🤖 ALL-IN-ONE MASTER PROMPT:\n${s.aiVideoPrompt}\n` +
          `🎥 Camera Motion: ${s.cameraMotion}\n` +
          `🛡️ Continuity Lock: ${s.continuityNotes}\n`
      )
      .join('\n----------------------------------------\n\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      showToast(`🎉 បានចម្លង Prompt ទាំងអស់ (${result.scenes.length} ឈុត) ចូល Clipboard!`);
      setTimeout(() => setCopiedAll(false), 2200);
    } catch (err) {
      console.error('Failed to copy all', err);
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const fullText =
      `ចំណងជើងរឿង៖ ${result.storyTitle}\n` +
      `បង្កើតដោយ៖ ឡោម មនីវង្ស (LORM MONYVONG)\n` +
      `រចនាប័ទ្ម៖ ${result.style}\n` +
      `តួអង្គកំណត់ជាប់៖ ${result.charactersSummary || characters}\n` +
      `ចំនួនឈុតសរុប៖ ${result.totalScenes} ឈុត\n\n` +
      result.scenes
        .map(
          (s) =>
            `--------------------------------------------------\n` +
            `Shot ${s.sceneNumber} (${s.timeRange}): ${s.sceneTitleKhmer}\n` +
            `--------------------------------------------------\n` +
            (s.sceneStoryKhmer ? `ដំណើររឿង៖\n${s.sceneStoryKhmer}\n\n` : '') +
            `ALL-IN-ONE PROMPT:\n${s.aiVideoPrompt}\n\n` +
            `Camera Motion៖ ${s.cameraMotion}\n` +
            `Continuity Lock៖ ${s.continuityNotes}\n`
        )
        .join('\n\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.storyTitle.replace(/\s+/g, '_')}_prompts.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        backgroundColor: activeTheme.appBg,
        fontFamily: bodyFontFamily,
        ['--heading-font' as any]: headingFontFamily,
        ['--body-font' as any]: bodyFontFamily,
        fontSize:
          appFontSize === 'small'
            ? '0.92rem'
            : appFontSize === 'large'
            ? '1.08rem'
            : appFontSize === 'xlarge'
            ? '1.18rem'
            : undefined,
      }}
      className="min-h-screen flex flex-col transition-colors duration-300"
    >
      {/* Sticky Top Header Area (Slim / Compact Shape) */}
      <div className="sticky top-0 z-40 shadow-md transition-all duration-300">
        {/* Top Center Header (Reduced height / thickness) */}
        <header
          style={{ background: activeTheme.headerBg }}
          className="text-white py-2 md:py-2.5 px-3 sm:px-4 border-b border-black/20 text-center transition-all duration-300 relative shadow-sm"
        >
          {/* Back Button / Arrow (active when in results or images tab) */}
          {activeTab !== 'setup' && (
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 shadow-sm transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
              title="ត្រឡប់ទៅផ្ទាំងសាច់រឿង (Back)"
              aria-label="ត្រឡប់ទៅផ្ទាំងសាច់រឿង (Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">ត្រឡប់</span>
            </button>
          )}

          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
            <h1
              style={{ fontFamily: headingFontFamily }}
              className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white drop-shadow-sm leading-tight font-heading"
            >
              កម្មវិធីបង្កើតសាច់រឿង
            </h1>
            <p className="text-[10px] sm:text-xs text-white/90 mt-0.5 font-medium tracking-wide">
              បង្កើតដោយ ឡោម មនីវង្ស (LORM MONYVONG)
            </p>
          </div>

          {/* Settings Button (Gear / កងចក្រ) for Theme & Color Customization */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 group"
            title="ការកំណត់ពណ៌ និងផ្ទៃកម្មវិធី (Theme Settings)"
            aria-label="ការកំណត់ (Settings)"
          >
            <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-500 group-hover:rotate-90" />
            <span className="hidden sm:inline text-xs font-bold">ការកំណត់</span>
          </button>
        </header>

        {/* Tab Navigation (3 Items on 1 Row - Never wraps / drops down) */}
        <div
          style={{
            backgroundColor: activeTheme.menuBg,
            borderColor: activeTheme.menuBorder,
          }}
          className="border-b py-1 sm:py-1.5 px-1.5 sm:px-4 transition-colors duration-300 shadow-sm"
        >
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-1.5 sm:gap-2.5 items-stretch">
            {/* Tab 1: ផ្ទាំងសាច់រឿង */}
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              style={
                activeTab === 'setup'
                  ? { backgroundColor: activeTheme.accent, color: getContrastColor(activeTheme.accent), fontFamily: headingFontFamily }
                  : { color: activeTheme.menuText, fontFamily: headingFontFamily }
              }
              className={`nav-tab-item font-heading px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11.5px] md:text-xs font-normal transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-sm whitespace-nowrap overflow-hidden select-none ${
                activeTab === 'setup' ? 'ring-2 ring-white/30 scale-[1.01]' : 'hover:opacity-85'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span style={{ fontFamily: headingFontFamily }} className="truncate leading-normal pt-0.5">ផ្ទាំងសាច់រឿង</span>
            </button>

            {/* Tab 2: លទ្ធផល Prompt */}
            <button
              type="button"
              onClick={() => setActiveTab('results')}
              style={
                activeTab === 'results'
                  ? { backgroundColor: activeTheme.accent, color: getContrastColor(activeTheme.accent), fontFamily: headingFontFamily }
                  : { color: activeTheme.menuText, fontFamily: headingFontFamily }
              }
              className={`nav-tab-item font-heading px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11.5px] md:text-xs font-normal transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-sm whitespace-nowrap overflow-hidden select-none ${
                activeTab === 'results' ? 'ring-2 ring-white/30 scale-[1.01]' : 'hover:opacity-85'
              }`}
            >
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span style={{ fontFamily: headingFontFamily }} className="truncate leading-normal pt-0.5">លទ្ធផល Prompt{result ? ` (${result.totalScenes})` : ''}</span>
            </button>

            {/* Tab 3: ប្រវត្តិរឿង (History in Navigation Bar) */}
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              style={
                activeTab === 'history'
                  ? { backgroundColor: activeTheme.accent, color: getContrastColor(activeTheme.accent), fontFamily: headingFontFamily }
                  : { color: activeTheme.menuText, fontFamily: headingFontFamily }
              }
              className={`nav-tab-item font-heading px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11.5px] md:text-xs font-normal transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-sm whitespace-nowrap overflow-hidden select-none ${
                activeTab === 'history' ? 'ring-2 ring-white/30 scale-[1.01]' : 'hover:opacity-85'
              }`}
              title="បើកមើលប្រវត្តិសាច់រឿង (Story History)"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span style={{ fontFamily: headingFontFamily }} className="truncate leading-normal pt-0.5">ប្រវត្តិរឿង</span>
              {history.length > 0 && (
                <span
                  style={{
                    backgroundColor: activeTab === 'history' ? getContrastColor(activeTheme.accent) : activeTheme.accent,
                    color: activeTab === 'history' ? activeTheme.accent : getContrastColor(activeTheme.accent),
                    fontFamily: headingFontFamily,
                  }}
                  className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 shadow-xs"
                >
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 md:p-5 pb-14 sm:pb-16 flex flex-col gap-4 sm:gap-5 items-stretch">
        {/* Story Setup Menu Panel (Slimmer / Compact Shape) */}
        {activeTab === 'setup' && (
          <section
            ref={setupRef}
            aria-label="Menu"
            style={{
              backgroundColor: activeTheme.menuBg,
              color: activeTheme.menuText,
              borderColor: activeTheme.menuBorder,
            }}
            className="w-full rounded-2xl shadow-lg border p-4 sm:p-5 flex flex-col gap-4 transition-colors duration-300"
          >
          {/* Menu Header */}
          <div
            style={{ borderColor: activeTheme.menuBorder }}
            className="border-b pb-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: `${activeTheme.accent}30`, borderColor: activeTheme.accent }}
                className="p-2 border rounded-lg shrink-0"
              >
                <Layers className="w-5 h-5" style={{ color: activeTheme.accent }} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold" style={{ color: activeTheme.menuText }}>ម៉ឺនុយកំណត់សាច់រឿង</h2>
                <p className="text-[11px] sm:text-xs opacity-80">បំពេញទិន្នន័យដើម្បីបង្កើត Master Video Prompts តាមលំដាប់លំដោយដោយស្វ័យប្រវត្តិ</p>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-4">
            {/* Label សរសេរចំណងជើង */}
            <div>
              <label htmlFor="story-title" className="block text-sm font-semibold mb-1.5" style={{ color: activeTheme.menuText }}>
                សរសេរចំណងជើង <span className="text-red-400">*</span>
              </label>
              <input
                id="story-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ឧទាហរណ៍៖ អាថ៌កំបាំងប្រាសាទបុរាណ..."
                style={{
                  backgroundColor: activeTheme.menuInputBg,
                  color: activeTheme.menuText,
                  borderColor: activeTheme.menuBorder,
                }}
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Durations Grid */}
            <div
              style={{
                backgroundColor: activeTheme.menuCardBg,
                borderColor: activeTheme.menuBorder,
              }}
              className="p-3.5 rounded-xl border space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: activeTheme.menuText }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                  <span>រយៈពេលនៃរឿង (សរុប)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomDuration(!isCustomDuration)}
                  className="text-[11px] px-2 py-0.5 rounded border transition cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: activeTheme.accent,
                    borderColor: activeTheme.accent,
                  }}
                >
                  {isCustomDuration ? '← ជ្រើសរើសតាមជម្រើសស្រេច' : '+ កំណត់នាទីផ្ទាល់ខ្លួន (Custom)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Total Duration Selector */}
                <div>
                  {!isCustomDuration ? (
                    <div>
                      <select
                        id="total-duration"
                        value={totalDuration}
                        onChange={(e) => setTotalDuration(Number(e.target.value))}
                        style={{
                          backgroundColor: activeTheme.menuInputBg,
                          color: activeTheme.menuText,
                          borderColor: activeTheme.menuBorder,
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none font-medium cursor-pointer"
                      >
                        <optgroup label="រយៈពេលខ្លី (Short)" className="bg-slate-900 text-slate-300 font-bold">
                          <option value={30} className="bg-slate-900 text-white py-1">៣០ វិនាទី (30s)</option>
                          <option value={45} className="bg-slate-900 text-white py-1">៤៥ វិនាទី (45s)</option>
                          <option value={60} className="bg-slate-900 text-white py-1">៦០ វិនាទី (1 នាទី)</option>
                          <option value={90} className="bg-slate-900 text-white py-1">៩០ វិនាទី (1.5 នាទី)</option>
                        </optgroup>
                        <optgroup label="រយៈពេលមធ្យម (Medium)" className="bg-slate-900 text-slate-300 font-bold">
                          <option value={120} className="bg-slate-900 text-white py-1">១២០ វិនាទី (2 នាទី)</option>
                          <option value={180} className="bg-slate-900 text-white py-1">១៨០ វិនាទី (3 នាទី)</option>
                          <option value={240} className="bg-slate-900 text-white py-1">២៤០ វិនាទី (4 នាទី)</option>
                          <option value={300} className="bg-slate-900 text-white py-1">៣០០ វិនាទី (5 នាទី)</option>
                        </optgroup>
                        <optgroup label="រយៈពេលវែង (Long Series)" className="bg-slate-900 text-slate-300 font-bold">
                          <option value={420} className="bg-slate-900 text-white py-1">៤២០ វិនាទី (7 នាទី)</option>
                          <option value={600} className="bg-slate-900 text-white py-1">៦០០ វិនាទី (10 នាទី)</option>
                          <option value={900} className="bg-slate-900 text-white py-1">៩០០ វិនាទី (15 នាទី)</option>
                          <option value={1200} className="bg-slate-900 text-white py-1">១២០០ វិនាទី (20 នាទី)</option>
                          <option value={1800} className="bg-slate-900 text-white py-1">១៨០០ វិនាទី (30 នាទី)</option>
                        </optgroup>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Math.max(1, Number(e.target.value)))}
                        style={{
                          backgroundColor: activeTheme.menuInputBg,
                          color: activeTheme.menuText,
                          borderColor: activeTheme.accent,
                        }}
                        className="w-20 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-bold"
                      />
                      <span className="text-xs font-semibold" style={{ color: activeTheme.menuText }}>
                        នាទី ({customMinutes * 60} វិនាទី)
                      </span>
                    </div>
                  )}
                </div>

                {/* ចំនួនពេលវេលាក្នុងមួយ prompt */}
                <div>
                  <label htmlFor="duration-per-prompt" className="block text-[11px] font-semibold mb-1 flex items-center gap-1" style={{ color: activeTheme.menuText }}>
                    <Video className="w-3 h-3" style={{ color: activeTheme.accent }} />
                    <span>ពេលក្នុងមួយ prompt</span>
                  </label>
                  <select
                    id="duration-per-prompt"
                    value={durationPerPrompt}
                    onChange={(e) => setDurationPerPrompt(Number(e.target.value))}
                    style={{
                      backgroundColor: activeTheme.menuInputBg,
                      color: activeTheme.menuText,
                      borderColor: activeTheme.menuBorder,
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none font-medium cursor-pointer"
                  >
                    <option value={5} className="bg-slate-900 text-white py-1">៥ វិនាទី (5s)</option>
                    <option value={10} className="bg-slate-900 text-white py-1">១០ វិនាទី (10s - ស្តង់ដារ AI)</option>
                    <option value={15} className="bg-slate-900 text-white py-1">១៥ វិនាទី (15s)</option>
                    <option value={20} className="bg-slate-900 text-white py-1">២០ វិនាទី (20s)</option>
                    <option value={25} className="bg-slate-900 text-white py-1">២៥ វិនាទី (25s)</option>
                    <option value={30} className="bg-slate-900 text-white py-1">៣០ វិនាទី (30s - ឈុតវែង)</option>
                  </select>
                </div>
              </div>

              {/* Live Calculator badge */}
              <div style={{ borderColor: activeTheme.menuBorder }} className="pt-2 border-t flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color: activeTheme.menuText }}>
                  រយៈពេលសរុប {activeDuration >= 60 ? `${Math.floor(activeDuration / 60)} នាទី ${activeDuration % 60 ? (activeDuration % 60) + ' វិនាទី' : ''}` : `${activeDuration} វិនាទី`}
                </span>
                <span
                  style={{
                    backgroundColor: `${activeTheme.accent}25`,
                    borderColor: activeTheme.accent,
                    color: activeTheme.menuText,
                  }}
                  className="font-bold border px-2.5 py-0.5 rounded-full"
                >
                  ស្មើ {estimatedScenes} ឈុត / Prompts
                </span>
              </div>
            </div>

            {/* ១. ផ្នែកកំណត់តួអង្គក្នុងសាច់រឿង (Story Characters - Clean & Orderly) */}
            <div
              style={{
                backgroundColor: activeTheme.menuCardBg,
                borderColor: activeTheme.menuBorder,
              }}
              className="p-3.5 sm:p-4 rounded-xl border space-y-3 shadow-xs"
            >
              {/* Header with Title on Left, and "បន្ថែម" button on Right (Blue circle) */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: `${activeTheme.accent}25`, color: activeTheme.accent }}
                    className="p-1.5 rounded-lg border border-white/10"
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                      <span>តួអង្គក្នុងសាច់រឿង (Story Characters)</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] opacity-75" style={{ color: activeTheme.menuText }}>
                      កំណត់តួអង្គផ្សេងៗពីគ្នា តាមចំនួនដែលអ្នកចង់បាន
                    </p>
                  </div>
                </div>

                {/* ប៊ូតុង «បន្ថែម» ត្រង់ចំណុចគូសរង្វង់ពណ៌ខៀវ */}
                <button
                  type="button"
                  onClick={() => handleAddCharacter()}
                  disabled={characterList.length >= 10}
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: getContrastColor(activeTheme.accent),
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="បន្ថែមតួអង្គថ្មី"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែម</span>
                </button>
              </div>

              {/* បញ្ជីតួអង្គរៀងៗខ្លួន (ការកំណត់តួអង្គគឺស្ថិតនៅក្នុងតួអង្គរៀងៗខ្លួន) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {characterList.map((charItem, idx) => (
                  <div
                    key={charItem.id || idx}
                    onClick={() => {
                      setEditingCharIndex(idx);
                      setShowCharactersModal(true);
                    }}
                    style={{
                      backgroundColor: activeTheme.menuInputBg,
                      borderColor: activeTheme.menuBorder,
                    }}
                    className="p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all hover:scale-[1.01] hover:border-white/40 cursor-pointer group shadow-xs"
                    title="ចុចដើម្បីកំណត់ព័ត៌មានតួអង្គនេះ"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-black/20 dark:bg-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                        {charItem.emoji || '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono opacity-60 font-bold" style={{ color: activeTheme.menuText }}>
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold truncate" style={{ color: activeTheme.menuText }}>
                            {charItem.name}
                          </span>
                          {charItem.role && (
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-medium truncate border"
                              style={{
                                backgroundColor: `${activeTheme.accent}20`,
                                color: activeTheme.menuText,
                                borderColor: `${activeTheme.accent}40`,
                              }}
                            >
                              {charItem.role}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-75 truncate mt-0.5" style={{ color: activeTheme.menuText }}>
                          {charItem.badge || 'តួអង្គ'} • {charItem.description.slice(0, 40)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div
                        className="p-1.5 rounded-lg opacity-70 group-hover:opacity-100 transition"
                        style={{ backgroundColor: `${activeTheme.accent}20` }}
                        title="កំណត់តួអង្គនេះ"
                      >
                        <Edit3 className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                      </div>
                      {characterList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCharacter(idx);
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                          title="លុបតួអង្គនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ២. ព័ត៌មាននិងរូបរាងតួអង្គ (ចាក់សោរឱ្យដដែល) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="character-details" className="text-xs font-semibold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ព័ត៌មាននិងរូបរាងតួអង្គ (ចាក់សោរឱ្យដដែល)</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  🛡️ មិនឱ្យប្តូរតួអង្គ
                </span>
              </div>
              <textarea
                id="character-details"
                rows={3}
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="ឈ្មោះ រូបរាង អាយុ សម្លៀកបំពាក់ ម៉ូតសក់ និងលក្ខណៈសម្គាល់ដើម្បីរក្សាភាពស៊ីសង្វាក់..."
                style={{
                  backgroundColor: activeTheme.menuInputBg,
                  color: activeTheme.menuText,
                  borderColor: activeTheme.menuBorder,
                }}
                className="w-full border rounded-xl px-3.5 py-2.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400/80 leading-relaxed font-normal"
              />
              <p className="text-[11px] font-medium opacity-90 mt-1" style={{ color: activeTheme.menuText }}>
                * កម្មវិធីនឹងបញ្ចូលទិន្នន័យតួអង្គនេះទៅគ្រប់ prompt ទាំងអស់ ដើម្បីការពារកុំឱ្យ AI ប្តូរមុខឬខោអាវតួអង្គ។
              </p>
            </div>

            {/* ៣. មុខងារថ្មី៖ បញ្ជាក់ Prompt ជាប្រភេទមានការនិយាយ ឬគ្មានការនិយាយ (Dialogue / Silent Mode) */}
            <div
              style={{
                backgroundColor: activeTheme.menuCardBg,
                borderColor: activeTheme.menuBorder,
              }}
              className="p-3.5 rounded-xl border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                  <MessageSquare className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                  <span>ប្រភេទការសន្ទនា (Prompt Dialogue Mode)</span>
                </label>
                <span
                  style={{
                    backgroundColor: `${activeTheme.accent}25`,
                    borderColor: activeTheme.accent,
                    color: activeTheme.menuText,
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded border"
                >
                  {dialogueMode === 'with_dialogue' ? '🎙️ មានការនិយាយ' : '🔇 គ្មានការនិយាយ (Silent)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Option 1: មានការនិយាយ */}
                <button
                  type="button"
                  id="btn-dialogue-with"
                  onClick={() => setDialogueMode('with_dialogue')}
                  style={{
                    backgroundColor: dialogueMode === 'with_dialogue' ? activeTheme.accent : activeTheme.menuInputBg,
                    color: dialogueMode === 'with_dialogue' ? getContrastColor(activeTheme.accent) : activeTheme.menuText,
                    borderColor: dialogueMode === 'with_dialogue' ? activeTheme.accent : activeTheme.menuBorder,
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-2 shadow-sm hover:brightness-110 ${
                    dialogueMode === 'with_dialogue' ? 'ring-2 ring-white/30 font-bold' : 'opacity-85 font-normal'
                  }`}
                >
                  <Volume2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight">🎙️ ប្រភេទមានការនិយាយ (With Dialogue)</div>
                    <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                      តួអង្គបញ្ចេញសំឡេង សន្ទនាពាក្យសម្តីចំសាច់រឿង ទឹកមុខស្របតាមការសន្ទនា
                    </div>
                  </div>
                </button>

                {/* Option 2: គ្មានការនិយាយ */}
                <button
                  type="button"
                  id="btn-dialogue-without"
                  onClick={() => setDialogueMode('without_dialogue')}
                  style={{
                    backgroundColor: dialogueMode === 'without_dialogue' ? activeTheme.accent : activeTheme.menuInputBg,
                    color: dialogueMode === 'without_dialogue' ? getContrastColor(activeTheme.accent) : activeTheme.menuText,
                    borderColor: dialogueMode === 'without_dialogue' ? activeTheme.accent : activeTheme.menuBorder,
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-2 shadow-sm hover:brightness-110 ${
                    dialogueMode === 'without_dialogue' ? 'ring-2 ring-white/30 font-bold' : 'opacity-85 font-normal'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight">🔇 គ្មានការនិយាយ (No Dialogue / Silent)</div>
                    <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                      ឈុតស្ងប់ស្ងាត់ ផ្តោតលើកាយវិការ សកម្មភាព ក្រសែភ្នែក បរិយាកាស និងភាពយន្តសុទ្ធ
                    </div>
                  </div>
                </button>
              </div>

              <p className="text-[10px] opacity-80" style={{ color: activeTheme.menuText }}>
                {dialogueMode === 'with_dialogue'
                  ? '✓ Prompt និង Description នឹងបញ្ជាក់លម្អិតពីការសន្ទនា និងពាក្យសម្តីរបស់តួអង្គចំៗតាមសាច់រឿង។'
                  : '✓ Prompt និង Description នឹងកំណត់ជាឈុតគ្មានការនិយាយ (Silent Narrative) ផ្តោតលើបរិយាកាស និងកាយវិការ។'}
              </p>
            </div>

            {/* Visual / Cinematic Style Dropdown Selection */}
            {(() => {
              const currentStylePreset =
                CINEMATIC_STYLE_PRESETS.find((p) => p.id === selectedStylePresetId) ||
                CINEMATIC_STYLE_PRESETS[0];

              return (
                <div
                  ref={styleDropdownRef}
                  style={{
                    backgroundColor: activeTheme.menuCardBg,
                    borderColor: activeTheme.menuBorder,
                  }}
                  className="p-3.5 rounded-2xl border space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="visual-style-dropdown-btn"
                      className="text-xs font-semibold flex items-center gap-1.5"
                      style={{ color: activeTheme.menuText }}
                    >
                      <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                      <span>រចនាប័ទ្មរូបភាព (Visual / Cinematic Style)</span>
                    </label>
                    <span
                      style={{
                        backgroundColor: `${activeTheme.accent}25`,
                        borderColor: activeTheme.accent,
                        color: activeTheme.menuText,
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    >
                      {currentStylePreset.badge}
                    </span>
                  </div>

                  {/* Dropdown Trigger Button */}
                  <div className="relative">
                    <button
                      type="button"
                      id="visual-style-dropdown-btn"
                      onClick={() => setIsStyleDropdownOpen((prev) => !prev)}
                      style={{
                        backgroundColor: activeTheme.menuInputBg,
                        color: activeTheme.menuText,
                        borderColor: isStyleDropdownOpen ? activeTheme.accent : activeTheme.menuBorder,
                      }}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer font-sans"
                      aria-haspopup="listbox"
                      aria-expanded={isStyleDropdownOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 text-left">
                        <span className="text-xl leading-none shrink-0">{currentStylePreset.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-tight truncate">
                            {currentStylePreset.label}
                          </div>
                          <div className="text-[10px] opacity-75 leading-tight truncate mt-0.5">
                            {currentStylePreset.subtitle}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isStyleDropdownOpen ? 'rotate-180' : ''
                        }`}
                        style={{ color: activeTheme.accent }}
                      />
                    </button>

                    {/* Dropdown Menu Popup */}
                    {isStyleDropdownOpen && (
                      <div
                        style={{
                          backgroundColor: '#1f0d3d',
                          borderColor: 'rgba(251, 191, 36, 0.4)',
                        }}
                        className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl border bg-[#1f0d3d]/98 backdrop-blur-md shadow-2xl p-1.5 space-y-1 max-h-80 overflow-y-auto"
                        role="listbox"
                      >
                        {CINEMATIC_STYLE_PRESETS.map((preset) => {
                          const isSelected = selectedStylePresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectStylePreset(preset)}
                              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400/20 border border-amber-400/60 text-amber-100 shadow-sm'
                                  : 'hover:bg-white/10 hover:border-amber-400/30 text-slate-200 border border-transparent'
                              }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span className="text-xl leading-none mt-0.5 shrink-0">{preset.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-xs font-bold text-amber-100 leading-snug">
                                    {preset.label}
                                  </span>
                                  <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/30 shrink-0">
                                    {preset.badge}
                                  </span>
                                </div>
                                <p className="text-[10px] text-amber-200/70 mt-0.5 line-clamp-1 leading-tight font-sans">
                                  {preset.subtitle}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Custom Textarea Reveal */}
                  {selectedStylePresetId === 'custom' ? (
                    <div className="space-y-2 p-3 rounded-xl border border-amber-400/30 bg-[#170a2c]/90 text-amber-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>កំណត់ Visual Style ផ្ទាល់ខ្លួន (Custom Prompt Keywords)៖</span>
                        </span>
                        <span className="text-[9.5px] font-mono text-amber-300 opacity-80">
                          Live Active
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={customStyleText}
                        onChange={(e) => handleCustomStyleChange(e.target.value)}
                        placeholder="ឧទាហរណ៍៖ Cinematic 8K, 35mm lens, anamorphic bokeh, dramatic twilight, volumetric light, highly detailed textures..."
                        className="w-full border border-amber-400/40 rounded-xl p-2.5 text-xs text-amber-100 placeholder:text-amber-200/40 bg-[#120722] focus:outline-none focus:ring-2 focus:ring-amber-400 transition font-sans resize-y leading-relaxed"
                      />
                      {/* Quick keyword chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[9.5px] text-amber-300/80 font-medium">ពាក្យគន្លឹះរហ័ស៖</span>
                        {[
                          '35mm Film Grain',
                          'Anamorphic Lens',
                          'Volumetric Light',
                          'Golden Hour',
                          'Octane Render 8K',
                          'Macro Detail',
                          'Slow Motion'
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const separator = customStyleText.trim() ? ', ' : '';
                              handleCustomStyleChange(`${customStyleText.trim()}${separator}${tag}`);
                            }}
                            className="text-[9.5px] px-2 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/25 text-amber-200 cursor-pointer transition"
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Preset Value Preview Box */
                    <div className="px-3 py-2 rounded-xl bg-black/25 border border-amber-400/20 text-[10px] text-amber-200/80 leading-relaxed font-mono flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0 text-xs">Prompt:</span>
                      <span className="line-clamp-2 select-all text-slate-300 font-sans">{visualStyle}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ផ្នែកកំណត់ភាសាទាំង ២៖ Prompt Language & Character Spoken Language */}
            <div
              style={{
                backgroundColor: activeTheme.menuCardBg,
                borderColor: activeTheme.menuBorder,
              }}
              className="p-3 sm:p-3.5 rounded-2xl border space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                  <Globe className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                  <span>ការកំណត់ភាសា (Language Settings)</span>
                </span>
                <span className="text-[10px] opacity-80 font-medium px-2 py-0.5 rounded-full bg-black/25" style={{ color: activeTheme.menuText }}>
                  {getLanguageById(promptLanguage).flag} Prompt | {getLanguageById(characterSpokenLanguage).flag} Dialogue
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dropdown ទី ១: ភាសានៃ Prompt លទ្ធផល (Prompt Language) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="select-prompt-language" className="text-xs font-semibold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                      <span>🎬 ភាសានៃ Prompt លទ្ធផល</span>
                    </label>
                    <span className="text-[9.5px] opacity-70 font-mono" style={{ color: activeTheme.menuText }}>
                      Visuals
                    </span>
                  </div>
                  <select
                    id="select-prompt-language"
                    value={promptLanguage}
                    onChange={(e) => setPromptLanguage(e.target.value)}
                    style={{
                      backgroundColor: activeTheme.menuInputBg,
                      color: activeTheme.menuText,
                      borderColor: activeTheme.accent,
                    }}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-bold cursor-pointer shadow-xs transition hover:brightness-105"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id} className="bg-slate-900 text-white py-1">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] opacity-75 leading-tight" style={{ color: activeTheme.menuText }}>
                    សម្រាប់ពណ៌នាឈុតឆាក សកម្មភាព និង Visuals
                  </p>
                </div>

                {/* Dropdown ទី ២: ភាសានិយាយរបស់តួអង្គក្នុង Prompt (Character Spoken Language) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="select-spoken-language" className="text-xs font-semibold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                      <span>💬 ភាសានិយាយរបស់តួអង្គ</span>
                    </label>
                    <span className="text-[9.5px] opacity-70 font-mono" style={{ color: activeTheme.menuText }}>
                      Dialogue
                    </span>
                  </div>
                  <select
                    id="select-spoken-language"
                    value={characterSpokenLanguage}
                    onChange={(e) => setCharacterSpokenLanguage(e.target.value)}
                    style={{
                      backgroundColor: activeTheme.menuInputBg,
                      color: activeTheme.menuText,
                      borderColor: activeTheme.accent,
                    }}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-bold cursor-pointer shadow-xs transition hover:brightness-105"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id} className="bg-slate-900 text-white py-1">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] opacity-75 leading-tight" style={{ color: activeTheme.menuText }}>
                    សម្រាប់ពាក្យពេចន៍ដែលតួអង្គនិយាយ ឬ Dialogue
                  </p>
                </div>
              </div>
            </div>

            {/* Description សាច់រឿង (ស្ថិតនៅក្រោមការកំណត់ភាសា Language Settings) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label htmlFor="story-description" className="text-xs sm:text-sm font-bold flex items-center gap-1.5" style={{ color: activeTheme.menuText }}>
                  <FileText className="w-4 h-4" style={{ color: activeTheme.accent }} />
                  <span>Description សាច់រឿង</span>
                  <span className="text-red-400">*</span>
                </label>

                {/* Button សម្រាប់បង្កើត Description ត្រូវតាមប្រធានបទចំណងជើងទាំងបរិយាកាស ទាំងតួអង្គ ទាំងការនិយាយ */}
                <button
                  type="button"
                  id="btn-auto-generate-description"
                  onClick={handleAutoGenerateDescription}
                  disabled={isGeneratingDescription}
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: getContrastColor(activeTheme.accent),
                    borderColor: activeTheme.accent,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-60 cursor-pointer border"
                  title="ចុចដើម្បីឱ្យ AI បង្កើត Description ត្រូវតាមប្រធានបទចំណងជើងរឿង ទាំងបរិយាកាស ទាំងតួអង្គ និងការនិយាយ"
                >
                  {isGeneratingDescription ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>កំពុងបង្កើតតាមប្រធានបទ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ បង្កើត Description ត្រូវតាមចំណងជើង & តួអង្គ</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                id="story-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="រៀបរាប់ដំណើររឿង ឬចុចប៊ូតុង «✨ បង្កើត Description ត្រូវតាមចំណងជើង & តួអង្គ» ខាងលើ ដើម្បីឱ្យ AI បង្កើតចំៗសាច់រឿងទាំងបរិយាកាស តួអង្គ ការនិយាយ ឬគោលដៅ..."
                style={{
                  backgroundColor: activeTheme.menuInputBg,
                  color: activeTheme.menuText,
                  borderColor: activeTheme.menuBorder,
                }}
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400/80 leading-relaxed font-normal"
              />
              <p className="text-[10px] opacity-80" style={{ color: activeTheme.menuText }}>
                * ដំណើររឿងត្រូវតាមប្រធានបទចំណងជើង ទាំងបរិយាកាស ទាំងតួអង្គ ទាំងការនិយាយ ({dialogueMode === 'with_dialogue' ? 'មានការនិយាយ' : 'គ្មានការនិយាយ'}) ឬគោលដៅនៃរឿង។
              </p>
            </div>

            {errorMessage && (!licenseData?.is_active || !isLicenseValid()) && (
              <div className="p-3 bg-red-950/85 border border-red-500/70 rounded-xl text-red-100 text-xs flex items-center justify-between gap-2.5 font-medium animate-fade-in shadow-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Info className="w-4.5 h-4.5 text-red-400 shrink-0" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsModal(true);
                      setTimeout(() => {
                        const el = document.getElementById('license-key-input');
                        if (el) el.focus();
                      }, 150);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    បញ្ចូល Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="p-1 hover:bg-white/10 rounded-lg text-red-300 hover:text-white transition cursor-pointer"
                    title="បិទ (Close)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Button បង្កើត (Supreme Contrast & Readability) */}
            <button
              type="button"
              id="btn-generate-story"
              disabled={isLoading}
              onClick={handleGenerate}
              style={{
                backgroundColor: activeTheme.accent,
                color: getContrastColor(activeTheme.accent),
                fontFamily: headingFontFamily,
                boxShadow: `0 10px 25px -5px ${activeTheme.accent}50`,
              }}
              className="w-full hover:brightness-110 font-normal py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 border border-white/20"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span className="leading-normal pt-0.5">កំពុងបង្កើតសាច់រឿង...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span className="leading-normal pt-0.5 tracking-wide">បង្កើតសាច់រឿង</span>
                </>
              )}
            </button>

            {/* If result exists: button to switch to Results tab */}
            {result && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: getContrastColor(activeTheme.accent),
                  }}
                  className="w-full hover:opacity-90 font-bold py-2.5 px-3 rounded-xl shadow border border-white/20 transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <Film className="w-4 h-4 shrink-0" />
                  <span>🎬 មើលលទ្ធផល Prompt ({result.totalScenes} Shots) ›</span>
                </button>
              </div>
            )}
          </div>
        </section>
        )}

        {/* RESULT SECTION: visible when activeTab is results (Slimmer / Compact Shape) */}
        {activeTab === 'results' && (
          <section
            ref={resultsRef}
            id="results-section"
            aria-label="Result"
            style={{
              backgroundColor: activeTheme.resultBg,
              color: activeTheme.resultText,
              borderColor: activeTheme.resultBorder,
            }}
            className="w-full rounded-2xl shadow-lg border p-3.5 sm:p-4 md:p-5 flex flex-col gap-4 min-h-[450px] transition-colors duration-300"
          >
          {/* Result Header & Actions */}
          <div
            style={{ borderColor: activeTheme.resultBorder }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: `${activeTheme.accent}20`, color: activeTheme.accent }}
                  className="p-1.5 rounded-lg"
                >
                  <ListOrdered className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold" style={{ color: activeTheme.resultText }}>
                  លទ្ធផល Prompt សាច់រឿងភាគ
                </h2>
              </div>
            </div>

            {result && result.scenes.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap whitespace-nowrap py-1">
                {/* Guide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHowToUseGuide(!showHowToUseGuide)}
                  style={{
                    backgroundColor: activeTheme.resultBoxBg,
                    borderColor: activeTheme.resultBorder,
                    color: activeTheme.resultText,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer shadow-sm hover:opacity-90 shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{showHowToUseGuide ? 'លាក់របៀបប្រើ' : '💡 របៀបប្រើ'}</span>
                  {showHowToUseGuide ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                </button>

                {/* Download TXT Button */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  style={{
                    backgroundColor: activeTheme.resultBoxBg,
                    borderColor: activeTheme.resultBorder,
                    color: activeTheme.resultText,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer shadow-sm hover:opacity-90 shrink-0"
                  title="ទាញយកជាឯកសារ TXT"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>ទាញយក (.txt)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Guide Card (Easily Understandable) */}
          {result && showHowToUseGuide && (
            <div
              style={{
                backgroundColor: activeTheme.resultBoxBg,
                borderColor: activeTheme.resultBorder,
                color: activeTheme.resultText,
              }}
              className="border-2 rounded-xl p-4 text-xs space-y-2.5 shadow-sm animate-fade-in"
            >
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: activeTheme.accent }}>
                <BookOpen className="w-4 h-4" />
                <span>ការណែនាំ៖ របៀបយក Prompt ទៅបង្កើតវីដេអូ AI ឱ្យជាប់គ្នាមិនដាច់ (Easy Workflow)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg border bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>ចម្លង Prompt មួយៗ</span>
                  </div>
                  <p className="opacity-80 leading-relaxed text-[11px]">
                    ចុចប៊ូតុង <strong>«ចម្លង Prompt នេះ»</strong> នៅលើឈុតទី ១ រួចបន្តទៅឈុតទី ២ តាមលំដាប់លំដោយ។
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>ដាក់ចូល Generator</span>
                  </div>
                  <p className="opacity-80 leading-relaxed text-[11px]">
                    បិទភ្ជាប់ (Paste) ចូលទៅកាន់កម្មវិធីបង្កើតវីដេអូ AI (AI Video Generator)។
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>រក្សារូបរាងតួអង្គ</span>
                  </div>
                  <p className="opacity-80 leading-relaxed text-[11px]">
                    ដាក់រូបភាពតួអង្គដើម (Character Reference) ធ្វើជា Image-to-Video ដើម្បីធានាថាមុខមាត់មិនផ្លាស់ប្តូរ។
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>កាត់តវីដេអូបន្តគ្នា</span>
                  </div>
                  <p className="opacity-80 leading-relaxed text-[11px]">
                    យកវីដេអូដែលបាន Generate តាមលំដាប់ឈុត ១, ២, ៣ ទៅផ្គុំគ្នាក្នុង CapCut ឬ Premiere ដោយរលូន។
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State Skeleton */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="relative mb-4">
                <div
                  style={{ borderColor: `${activeTheme.accent}30`, borderTopColor: activeTheme.accent }}
                  className="w-14 h-14 rounded-full border-4 animate-spin"
                />
                <Film className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: activeTheme.accent }} />
              </div>
              <p className="text-sm font-medium opacity-80" style={{ color: activeTheme.resultText }}>
                កំពុងបង្កើត Prompt...
              </p>
            </div>
          )}

          {/* Empty State before Generation */}
          {!isLoading && !result && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 gap-3">
              <div
                style={{ backgroundColor: activeTheme.resultBoxBg, borderColor: activeTheme.resultBorder }}
                className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-1 shadow-sm opacity-60"
              >
                <Film className="w-8 h-8 stroke-1" style={{ color: activeTheme.accent }} />
              </div>
              <h3 className="text-base font-semibold opacity-80" style={{ color: activeTheme.resultText }}>
                មិនទាន់មាន Prompt ត្រូវបានបង្កើតនៅឡើយទេ
              </h3>
              <p className="text-xs opacity-60 max-w-sm">
                សូមចូលទៅកាន់ផ្ទាំងកំណត់សាច់រឿង ដើម្បីរៀបចំតួអង្គ និងបង្កើត prompt សម្រាប់វីដេអូ AI។
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('setup')}
                style={{
                  backgroundColor: activeTheme.accent,
                  color: getContrastColor(activeTheme.accent),
                }}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>‹ ទៅកាន់ផ្ទាំងកំណត់សាច់រឿង</span>
              </button>
            </div>
          )}

          {/* Results Display */}
          {!isLoading && result && (
            <div className="space-y-5">
              {/* Continuity & Story Summary Banner */}
              <div
                style={{
                  backgroundColor: activeTheme.resultBoxBg,
                  borderColor: activeTheme.resultBorder,
                  color: activeTheme.resultText,
                }}
                className="border-2 rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      style={{ backgroundColor: activeTheme.accent }}
                      className="p-2.5 text-white rounded-xl shrink-0 shadow-sm"
                    >
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base md:text-lg" style={{ color: activeTheme.resultText }}>
                          🎬 {result.storyTitle}
                        </h3>
                        <span
                          style={{
                            backgroundColor: `${activeTheme.accent}20`,
                            color: activeTheme.resultText,
                            borderColor: activeTheme.resultBorder,
                          }}
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        >
                          {result.totalScenes} ឈុតសរុប
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs opacity-85">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                          <span>១ ឈុត = {durationPerPrompt} វិនាទី</span>
                        </span>
                        <span>•</span>
                        <span>រយៈពេលសរុប {activeDuration} វិនាទី</span>
                        <span>•</span>
                        <span>ស្ទីល៖ {result.style}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shots Selector: Only shows the count of shots and shot pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 text-xs flex-nowrap whitespace-nowrap">
                  <span className="text-xs font-bold shrink-0 flex items-center gap-1" style={{ color: activeTheme.accent }}>
                    <span>Shots ({result.scenes.length})៖</span>
                  </span>
                  <div className="h-4 w-px bg-black/15 dark:bg-white/15 mx-0.5 shrink-0" />
                  {result.scenes.map((s) => {
                    const isSelected = (selectedSceneFilter === s.sceneNumber) || (selectedSceneFilter === 'all' && s.sceneNumber === 1);
                    return (
                      <button
                        key={s.sceneNumber}
                        type="button"
                        onClick={() => setSelectedSceneFilter(s.sceneNumber)}
                        style={{
                          backgroundColor: isSelected ? activeTheme.accent : activeTheme.resultCardBg,
                          color: isSelected ? getContrastColor(activeTheme.accent) : activeTheme.resultText,
                          borderColor: activeTheme.resultBorder,
                        }}
                        className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer shadow-xs shrink-0 flex items-center gap-1 ${
                          isSelected ? 'ring-2 ring-white/30 scale-[1.04]' : 'hover:opacity-90'
                        }`}
                      >
                        Shot {s.sceneNumber}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed View: Showing only the selected Shot's full unified prompt without extra clutter */}
              <div className="space-y-4">
                  {result.scenes
                    .filter((s) => s.sceneNumber === (typeof selectedSceneFilter === 'number' ? selectedSceneFilter : 1))
                    .map((scene) => {
                      const sceneIndex = scene.sceneNumber - 1;
                      const isPromptCopied = copiedPromptIndex === sceneIndex || copiedIndex === sceneIndex;

                      return (
                        <article
                          key={scene.sceneNumber}
                          id={`scene-${scene.sceneNumber}`}
                          style={{
                            backgroundColor: activeTheme.resultCardBg,
                            borderColor: activeTheme.resultBorder,
                            color: activeTheme.resultText,
                          }}
                          className="rounded-2xl border-2 transition-all shadow-md overflow-hidden"
                        >
                          {/* Card Header with Single Prominent Copy Button */}
                          <div
                            style={{
                              backgroundColor: activeTheme.resultBoxBg,
                              borderColor: activeTheme.resultBorder,
                            }}
                            className="border-b px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                style={{
                                  backgroundColor: activeTheme.accent,
                                  color: getContrastColor(activeTheme.accent),
                                }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                              >
                                {scene.sceneNumber}
                              </span>
                              <div>
                                <h3 className="font-bold text-sm md:text-base flex items-center gap-1.5" style={{ color: activeTheme.resultText }}>
                                  <span>{scene.sceneTitleKhmer}</span>
                                </h3>
                                <div className="flex items-center gap-2 text-[11px] font-medium mt-0.5 opacity-85">
                                  <span className="font-mono font-semibold">
                                    {scene.timeRange} ({durationPerPrompt}s)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* PRIMARY COPY BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(scene.aiVideoPrompt, sceneIndex)}
                              style={{
                                backgroundColor: isPromptCopied ? '#059669' : activeTheme.accent,
                                color: isPromptCopied ? '#ffffff' : getContrastColor(activeTheme.accent),
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:brightness-110 active:scale-95 border border-white/20"
                              title="ចម្លង Prompt ពេញលេញ (Copy Full Prompt)"
                            >
                              {isPromptCopied ? (
                                <>
                                  <Check className="w-4 h-4 animate-bounce" />
                                  <span>បានចម្លងរួចរាល់! (Copied)</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>ចម្លង Prompt នេះ (Copy)</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Card Body: The Single Full Prompt Ready for Direct Copying */}
                          <div className="p-4 space-y-3">
                            {/* Contextual Dialogue & Speech Banner */}
                            {scene.dialogue && scene.dialogue !== '[SILENT SCENE - NO DIALOGUE]' && (
                              <div
                                style={{
                                  backgroundColor: activeTheme.resultBoxBg,
                                  borderColor: activeTheme.resultBorder,
                                }}
                                className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: activeTheme.accent }}>
                                    <span>💬</span>
                                    <span>ពាក្យនិយាយជាក់លាក់ក្នុងឈុតនេះ (Contextual Dialogue)៖</span>
                                  </div>
                                  <p className="text-xs md:text-sm font-semibold tracking-wide italic leading-relaxed" style={{ color: activeTheme.resultText }}>
                                    {scene.dialogue}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(scene.dialogue || '');
                                    showToast(`💬 បានចម្លងពាក្យនិយាយ Shot ${scene.sceneNumber} រួចរាល់!`);
                                  }}
                                  style={{
                                    backgroundColor: `${activeTheme.accent}15`,
                                    color: activeTheme.accent,
                                    borderColor: activeTheme.resultBorder,
                                  }}
                                  className="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-lg border text-xs font-bold transition hover:opacity-85 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  title="ចម្លងពាក្យនិយាយ"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>ចម្លងពាក្យនិយាយ</span>
                                </button>
                              </div>
                            )}
                            {scene.dialogue === '[SILENT SCENE - NO DIALOGUE]' && (
                              <div
                                style={{
                                  backgroundColor: activeTheme.resultBoxBg,
                                  borderColor: activeTheme.resultBorder,
                                }}
                                className="p-3 rounded-xl border flex items-center gap-2 text-xs opacity-85 shadow-xs"
                              >
                                <span className="text-base">🔇</span>
                                <div>
                                  <span className="font-bold text-xs">ឈុតស្ងប់ស្ងាត់គ្មានការនិយាយ (Silent Scene)៖ </span>
                                  <span className="opacity-90">សាច់រឿងដំណើរការតាមរយៈក្រសែភ្នែក ទឹកមុខ កាយវិការ និងសកម្មភាពសុទ្ធ។</span>
                                </div>
                              </div>
                            )}

                            <pre 
                              onClick={() => handleCopyPrompt(scene.aiVideoPrompt, sceneIndex)}
                              className="p-4 md:p-5 text-xs md:text-sm font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed select-all bg-[#050a14] rounded-xl border border-slate-700/80 shadow-inner cursor-pointer hover:border-emerald-500/50 transition selection:bg-cyan-500 selection:text-black"
                              title="ចុចលើ Prompt នេះដើម្បីចម្លង (Click to copy)"
                            >
                              {scene.aiVideoPrompt}
                            </pre>

                            {/* Shot Step Navigation & Quick Copy */}
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={scene.sceneNumber <= 1}
                                  onClick={() => setSelectedSceneFilter(scene.sceneNumber - 1)}
                                  className="px-2.5 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                  style={{
                                    backgroundColor: activeTheme.resultBoxBg,
                                    borderColor: activeTheme.resultBorder,
                                    color: activeTheme.resultText,
                                  }}
                                  title="ថយទៅ Shot មុន"
                                >
                                  <span>‹ ថយក្រោយ</span>
                                </button>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 opacity-90 font-mono border border-black/5 dark:border-white/5">
                                  Shot {scene.sceneNumber} / {result.totalScenes}
                                </span>
                                <button
                                  type="button"
                                  disabled={scene.sceneNumber >= result.totalScenes}
                                  onClick={() => setSelectedSceneFilter(scene.sceneNumber + 1)}
                                  className="px-2.5 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                  style={{
                                    backgroundColor: activeTheme.resultBoxBg,
                                    borderColor: activeTheme.resultBorder,
                                    color: activeTheme.resultText,
                                  }}
                                  title="បន្តទៅ Shot បន្ទាប់"
                                >
                                  <span>Shot បន្ទាប់ ›</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopyPrompt(scene.aiVideoPrompt, sceneIndex)}
                                style={{
                                  backgroundColor: isPromptCopied ? '#059669' : activeTheme.accent,
                                  color: isPromptCopied ? '#ffffff' : getContrastColor(activeTheme.accent),
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90"
                              >
                                {isPromptCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>បានចម្លងរួចរាល់!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>ចម្លង Prompt (Shot {scene.sceneNumber})</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>

              {/* Bottom Actions & All-copy button */}
              <div
                style={{ borderColor: activeTheme.resultBorder }}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t text-xs opacity-85"
              >
                <span>
                  សរុប {result.scenes.length} Prompts អាចប្រើប្រាស់បានគ្រប់កម្មវិធី AI Video
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    style={{ color: activeTheme.accent }}
                    className="font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ទាញយក .txt</span>
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    style={{ color: activeTheme.accent }}
                    className="font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លង prompt ទាំងអស់ចូល clipboard</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 🕒 ប្រវត្តិរឿង (Story History Tab with Permanent Storage) */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <section
            id="history-tab-section"
            aria-label="Story History"
            style={{
              backgroundColor: activeTheme.resultBg,
              color: activeTheme.resultText,
              borderColor: activeTheme.resultBorder,
            }}
            className="w-full rounded-2xl shadow-lg border p-3.5 sm:p-5 flex flex-col gap-4 min-h-[450px] transition-colors duration-300 animate-fadeIn"
          >
            {/* Header with Title and "🗑️ សម្អាតប្រវត្តិទាំងអស់ (Clear All)" */}
            <div
              style={{ borderColor: activeTheme.resultBorder }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  style={{ backgroundColor: `${activeTheme.accent}20`, color: activeTheme.accent }}
                  className="p-2 rounded-xl border"
                >
                  <History className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <div>
                  <h2
                    className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2"
                    style={{ color: activeTheme.resultText, fontFamily: headingFontFamily }}
                  >
                    <span>🕒 ប្រវត្តិរឿង (Story History)</span>
                    <span
                      style={{
                        backgroundColor: activeTheme.accent,
                        color: getContrastColor(activeTheme.accent),
                      }}
                      className="text-[10.5px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-xs"
                    >
                      {history.length} រឿង
                    </span>
                  </h2>
                  <p className="text-[11px] sm:text-xs opacity-75 mt-0.5">
                    ប្រព័ន្ធរក្សាទុកអចិន្ត្រៃយ៍ក្នុង localStorage មិនបាត់បង់ទោះ Refresh ឬបិទផ្ទាំង
                  </p>
                </div>
              </div>

              {/* Clear All Button */}
              {history.length > 0 && (
                <button
                  type="button"
                  id="btn-clear-all-history-tab"
                  onClick={handleClearAllHistory}
                  className="self-start sm:self-center px-3 sm:px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                  title="សម្អាតប្រវត្តិរឿងទាំងអស់ចេញពី localStorage"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>🗑️ សម្អាតប្រវត្តិទាំងអស់ (Clear All)</span>
                </button>
              )}
            </div>

            {/* Stories List or Empty State */}
            {history.length === 0 ? (
              <div
                style={{
                  backgroundColor: activeTheme.resultCardBg,
                  borderColor: activeTheme.resultBorder,
                }}
                className="rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 my-4"
              >
                <div
                  style={{ backgroundColor: `${activeTheme.accent}15` }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-1 shadow-inner"
                >
                  🕒
                </div>
                <h3
                  className="text-base sm:text-lg font-bold"
                  style={{ color: activeTheme.resultText, fontFamily: headingFontFamily }}
                >
                  មិនទាន់មានប្រវត្តិសាច់រឿងនៅឡើយទេ
                </h3>
                <p className="text-xs sm:text-sm opacity-75 max-w-md leading-relaxed">
                  រាល់ពេលអ្នកបង្កើតសាច់រឿង និង Prompts ចប់សព្វគ្រប់ (Generate Complete) ប្រព័ន្ធនឹងរក្សាទុក Object រឿងនោះចូលទៅក្នុង localStorage ដោយស្វ័យប្រវត្តិ។
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('setup')}
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: getContrastColor(activeTheme.accent),
                  }}
                  className="mt-3 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ទៅកាន់ផ្ទាំងសាច់រឿង ដើម្បីបង្កើតរឿងថ្មី</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
                {history.map((item, idx) => {
                  const itemTitle = item.title || item.storyTitle || 'សាច់រឿងគ្មានចំណងជើង';
                  const sceneCount = item.shots || item.totalScenes || item.result?.totalScenes || item.result?.scenes?.length || 0;
                  const durationDisplay = item.duration || (item.totalDurationSeconds ? `${item.totalDurationSeconds} វិនាទី` : '');
                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        backgroundColor: activeTheme.resultCardBg,
                        borderColor: activeTheme.resultBorder,
                      }}
                      className="p-3.5 sm:p-4 md:p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group"
                    >
                      {/* Top Header of Story Card */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 border-b pb-3"
                        style={{ borderColor: `${activeTheme.resultBorder}60` }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className="font-bold text-sm sm:text-base leading-snug truncate"
                              style={{ color: activeTheme.resultText, fontFamily: headingFontFamily }}
                            >
                              🎬 {itemTitle}
                            </h3>
                            <span
                              style={{
                                backgroundColor: `${activeTheme.accent}20`,
                                color: activeTheme.resultText,
                                borderColor: `${activeTheme.accent}40`,
                              }}
                              className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                            >
                              {sceneCount} ឈុត
                            </span>
                            {durationDisplay && (
                              <span className="text-[10px] sm:text-[11px] opacity-70 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono shrink-0">
                                ⏱️ {durationDisplay}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] opacity-60 mt-1 font-mono flex-wrap">
                            <span>📅 {item.dateFormatted || (item.timestamp ? new Date(item.timestamp).toLocaleString('km-KH') : '')}</span>
                            {item.visualStyle && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[220px]" title={item.visualStyle}>🎨 {item.visualStyle}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: View/Load, Copy All, Delete */}
                        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                          {/* ប៊ូតុង 👁️ មើលឡើងវិញ (View/Load) */}
                          <button
                            type="button"
                            onClick={() => handleLoadHistory(item)}
                            style={{
                              backgroundColor: activeTheme.accent,
                              color: getContrastColor(activeTheme.accent),
                            }}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                            title="ទាញ Prompts ទាំងនោះមកបង្ហាញលើ Tab «លទ្ធផល Prompt» ឡើងវិញ"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span>👁️ មើលឡើងវិញ</span>
                          </button>

                          {/* ប៊ូតុង 📋 Copy ទាំងអស់ (Copy All) */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyHistoryStoryAll(item, e)}
                            style={{
                              backgroundColor: activeTheme.resultBoxBg,
                              borderColor: activeTheme.resultBorder,
                              color: activeTheme.resultText,
                            }}
                            className="px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold shadow-xs hover:opacity-85 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                            title="ចម្លង Prompts ទាំងអស់នៃរឿងនេះ"
                          >
                            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span>📋 Copy ទាំងអស់</span>
                          </button>

                          {/* ប៊ូតុង 🗑️ លុប (Delete) */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistoryItem(item.id, e, itemTitle)}
                            className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition cursor-pointer active:scale-95"
                            title="លុបរឿងនេះចេញពីប្រវត្តិ"
                            aria-label="លុប"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          </button>
                        </div>
                      </div>

                      {/* Characters & Description */}
                      {(item.characters || item.description) && (
                        <div className="space-y-1 text-xs">
                          {item.characters && (
                            <div className="text-[11.5px] opacity-80 flex items-start gap-1.5">
                              <span className="font-bold text-amber-500 shrink-0">👥 តួអង្គ៖</span>
                              <span className="truncate line-clamp-1">{item.characters}</span>
                            </div>
                          )}
                          {item.description && (
                            <div className="text-[11.5px] opacity-75 line-clamp-2 leading-relaxed">
                              <span className="font-bold opacity-90">📖 សង្ខេប៖</span> {item.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </main>

      {/* ផ្ទាំង Pop up រៀបចំ និងកំណត់តួអង្គក្នុងសាច់រឿង (Characters Setup Modal) */}
      {showCharactersModal && (
        <div
          id="characters-setup-modal"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCharactersModal(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: activeTheme.resultCardBg,
              color: activeTheme.resultText,
              borderColor: activeTheme.resultBorder,
            }}
            className="w-full max-w-2xl max-h-[92vh] rounded-2xl border-2 shadow-2xl flex flex-col overflow-hidden animate-scale-up"
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: activeTheme.resultBoxBg,
                borderColor: activeTheme.resultBorder,
              }}
              className="px-4 py-3.5 border-b flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: `${activeTheme.accent}25`, borderColor: activeTheme.accent }}
                  className="p-1.5 rounded-lg border text-xl"
                >
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    រៀបចំ និងកំណត់តួអង្គផ្សេងៗពីគ្នា (Characters Setup)
                  </h3>
                  <p className="text-[11px] opacity-75">
                    កំណត់ប្រភេទ រូបរាង និងលក្ខណៈសម្គាល់នៃតួអង្គនីមួយៗឱ្យដាច់ដោយឡែកពីគ្នា
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCharactersModal(false)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition"
                aria-label="បិទ (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Top Controls: Character Count Stepper & Add Button */}
              <div
                style={{
                  backgroundColor: activeTheme.resultBoxBg,
                  borderColor: activeTheme.resultBorder,
                }}
                className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: activeTheme.resultText }}>
                    ចំនួនតួអង្គក្នុងសាច់រឿង៖
                  </span>
                  <div
                    className="flex items-center border rounded-xl overflow-hidden"
                    style={{ borderColor: activeTheme.resultBorder, backgroundColor: activeTheme.resultCardBg }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSetCharacterCountDirect(Math.max(1, characterList.length - 1))}
                      disabled={characterList.length <= 1}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer transition"
                      title="បន្ថយតួអង្គ"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-xs font-bold min-w-[24px] text-center">
                      {characterList.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetCharacterCountDirect(Math.min(10, characterList.length + 1))}
                      disabled={characterList.length >= 10}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer transition"
                      title="បន្ថែមតួអង្គ"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCharacter()}
                  disabled={characterList.length >= 10}
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: getContrastColor(activeTheme.accent),
                  }}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ បន្ថែមតួអង្គថ្មី</span>
                </button>
              </div>

              {/* Quick Combos Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold opacity-80" style={{ color: activeTheme.resultText }}>
                  ✨ គំរូផ្សំតួអង្គពេញនិយម (Quick Combos)៖
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {CHARACTER_COMBOS.map((combo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyCombo(combo.items)}
                      className="px-2.5 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
                      style={{
                        backgroundColor: activeTheme.resultBoxBg,
                        borderColor: activeTheme.resultBorder,
                        color: activeTheme.resultText,
                      }}
                    >
                      <span>{combo.emoji}</span>
                      <span>{combo.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* List of Character Slots */}
              <div className="space-y-3.5">
                {characterList.map((charItem, index) => {
                  const filteredTypes = CHARACTER_TYPES.filter((t) =>
                    charItem.categoryId === 'all' ? true : t.categoryId === charItem.categoryId
                  );

                  return (
                    <div
                      key={charItem.id || index}
                      style={{
                        backgroundColor: activeTheme.resultBoxBg,
                        borderColor: editingCharIndex === index ? activeTheme.accent : activeTheme.resultBorder,
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border space-y-3 shadow-xs relative transition-all ${
                        editingCharIndex === index ? 'ring-2 ring-offset-1 ring-amber-400/80 shadow-md' : ''
                      }`}
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: activeTheme.resultBorder }}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: activeTheme.accent }}
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: activeTheme.resultText }}>
                            <span>តួអង្គទី {index + 1}</span>
                            <span className="text-base">{charItem.emoji}</span>
                            <span className="text-xs opacity-80">({charItem.name})</span>
                          </span>
                        </div>

                        {characterList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCharacter(index)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title={`លុបតួអង្គទី ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdowns Row: Category & Specific Character */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Category */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-1 opacity-85" style={{ color: activeTheme.resultText }}>
                            ជំពូកតួអង្គ (Category)៖
                          </label>
                          <select
                            value={charItem.categoryId}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              const firstOfCat = CHARACTER_TYPES.find((t) => t.categoryId === newCat) || CHARACTER_TYPES[0];
                              handleUpdateCharacter(index, {
                                categoryId: newCat,
                                typeId: firstOfCat.id,
                                name: firstOfCat.name,
                                emoji: firstOfCat.emoji,
                                badge: firstOfCat.badge,
                                description: firstOfCat.description,
                                defaultStyle: firstOfCat.defaultStyle,
                              });
                            }}
                            style={{
                              backgroundColor: activeTheme.resultCardBg,
                              color: activeTheme.resultText,
                              borderColor: activeTheme.resultBorder,
                            }}
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-medium cursor-pointer"
                          >
                            {CHARACTER_CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id} className="bg-slate-900 text-white py-1">
                                {cat.emoji} {cat.name} ({cat.nameEn})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Specific Character */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-1 opacity-85" style={{ color: activeTheme.resultText }}>
                            ជ្រើសរើសតួអង្គ (Preset)៖
                          </label>
                          <select
                            value={charItem.typeId}
                            onChange={(e) => handleApplyCharacterTypeToSlot(index, e.target.value)}
                            style={{
                              backgroundColor: activeTheme.resultCardBg,
                              color: activeTheme.resultText,
                              borderColor: activeTheme.accent,
                            }}
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-bold cursor-pointer"
                          >
                            {filteredTypes.map((t) => (
                              <option key={t.id} value={t.id} className="bg-slate-900 text-white py-1">
                                {t.emoji} {t.name} ({t.badge})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Role or Custom Name */}
                      <div>
                        <label className="block text-[11px] font-semibold mb-1 opacity-85" style={{ color: activeTheme.resultText }}>
                          តួនាទី ឬឈ្មោះក្នុងរឿង (Role / Custom Name)៖
                        </label>
                        <input
                          type="text"
                          value={charItem.role}
                          onChange={(e) => handleUpdateCharacter(index, { role: e.target.value })}
                          placeholder={index === 0 ? 'តួឯក (Protagonist)' : index === 1 ? 'ដៃគូ (Partner)' : `តួអង្គទី ${index + 1}`}
                          style={{
                            backgroundColor: activeTheme.resultCardBg,
                            color: activeTheme.resultText,
                            borderColor: activeTheme.resultBorder,
                          }}
                          className="w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none font-medium"
                        />
                      </div>

                      {/* Description Details (Editable) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold opacity-85" style={{ color: activeTheme.resultText }}>
                            ការពិពណ៌នារូបរាង (Character Visual Prompt)៖
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const original = CHARACTER_TYPES.find((t) => t.id === charItem.typeId);
                              if (original) {
                                handleUpdateCharacter(index, { description: original.description });
                                showToast(`🔄 បានស្តារការពិពណ៌នានៃតួអង្គទី ${index + 1} ឡើងវិញ!`);
                              }
                            }}
                            className="text-[10px] opacity-75 hover:opacity-100 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ស្តារដូចដើម</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={charItem.description}
                          onChange={(e) => handleUpdateCharacter(index, { description: e.target.value })}
                          style={{
                            backgroundColor: activeTheme.resultCardBg,
                            color: activeTheme.resultText,
                            borderColor: activeTheme.resultBorder,
                          }}
                          className="w-full border rounded-xl p-2.5 text-xs focus:outline-none font-mono leading-relaxed resize-y"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                backgroundColor: activeTheme.resultBoxBg,
                borderColor: activeTheme.resultBorder,
              }}
              className="px-4 py-3 border-t flex items-center justify-between shrink-0"
            >
              <button
                type="button"
                onClick={() => {
                  const def = getDefaultCharacterList();
                  applyCharacterList(def, '🔄 បានកំណត់តួអង្គត្រឡប់ទៅ ១ តួអង្គដើមវិញ');
                }}
                className="inline-flex items-center gap-1.5 text-xs opacity-75 hover:opacity-100 hover:underline cursor-pointer py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>កំណត់ដូចដើម (1 Solo)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  applyCharacterList(characterList, `✨ បានរក្សាទុកតួអង្គទាំង ${characterList.length} រួចរាល់!`);
                  setShowCharactersModal(false);
                }}
                style={{
                  backgroundColor: activeTheme.accent,
                  color: getContrastColor(activeTheme.accent),
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>រួចរាល់ & អនុវត្ត ({characterList.length} តួអង្គ)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings & Color Theme Modal (កងចក្រ - Theme & Custom Colors) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div
            style={{
              backgroundColor: activeTheme.resultCardBg,
              color: activeTheme.resultText,
              borderColor: activeTheme.resultBorder,
            }}
            className="w-full max-w-xl max-h-[90vh] rounded-2xl border-2 shadow-2xl flex flex-col overflow-hidden animate-scale-up"
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: activeTheme.resultBoxBg,
                borderColor: activeTheme.resultBorder,
              }}
              className="px-4 py-3 border-b flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: activeTheme.accent + '25', borderColor: activeTheme.accent }}
                  className="p-1.5 rounded-lg border"
                >
                  <Settings className="w-4.5 h-4.5" style={{ color: activeTheme.accent }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">ការកំណត់ពណ៌ និង Theme កម្មវិធី</h3>
                  <p className="text-[11px] opacity-75">រៀបចំ Theme និងពណ៌កម្មវិធី</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition"
                aria-label="បិទ (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* ផ្ទាំងកំណត់ Theme & ពណ៌កម្មវិធី (Compact & Minimal) */}
              <div
                style={{
                  backgroundColor: activeTheme.resultBoxBg,
                  borderColor: activeTheme.resultBorder,
                }}
                className="p-3.5 sm:p-4 rounded-2xl border space-y-3 shadow-xs"
              >
                {/* ជួរទី ១៖ ជ្រើសរើស Theme កម្មវិធី (Theme Picker) */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: activeTheme.accent }} />
                    <span className="text-xs font-bold" style={{ color: activeTheme.resultText }}>
                      Theme កម្មវិធី៖
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      id="theme-picker-select"
                      value={selectedThemeId}
                      onChange={(e) => handleSelectTheme(e.target.value)}
                      style={{
                        backgroundColor: activeTheme.resultCardBg,
                        color: activeTheme.resultText,
                        borderColor: activeTheme.resultBorder,
                      }}
                      className="border rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer focus:outline-none shadow-xs"
                    >
                      {THEME_PRESETS.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white py-1">
                          {t.emoji} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ជួរកំណត់ម៉ូដអក្សរ (ចំណងជើងធំ & អត្ថបទ/រង) ទំហំ និងពណ៌អក្សរ */}
                <div
                  className="pt-3 border-t space-y-2.5 text-xs"
                  style={{ borderColor: activeTheme.resultBorder }}
                >
                  {/* បន្ទាត់ទី ១៖ ម៉ូដអក្សរចំណងជើងធំ & ម៉ូដអក្សររង/អត្ថបទ (Side by Side) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* ១. ម៉ូដចំណងជើងធំ (Heading Font) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="select-heading-font"
                          className="text-[11px] font-bold flex items-center gap-1.5"
                          style={{ color: activeTheme.resultText }}
                        >
                          <span className="text-amber-400">👑</span>
                          <span>ម៉ូដចំណងជើងធំ (Headings)៖</span>
                        </label>
                      </div>
                      <select
                        id="select-heading-font"
                        value={headingFontFamily}
                        onChange={(e) => handleHeadingFontChange(e.target.value)}
                        style={{
                          backgroundColor: activeTheme.resultCardBg,
                          color: activeTheme.resultText,
                          borderColor: activeTheme.resultBorder,
                          fontFamily: headingFontFamily,
                        }}
                        className="w-full border rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer focus:outline-none shadow-xs transition hover:brightness-105"
                        title="ជ្រើសរើសម៉ូដអក្សរចំណងជើងធំ (Heading Font)"
                      >
                        {HEADING_FONT_OPTIONS.map((f) => (
                          <option
                            key={f.id}
                            value={f.font}
                            style={{ fontFamily: f.font }}
                            className="bg-slate-900 text-white py-1"
                          >
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ២. ម៉ូដចំណងជើងរង និងអត្ថបទ (Subheadings & Body Font) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="select-body-font"
                          className="text-[11px] font-bold flex items-center gap-1.5"
                          style={{ color: activeTheme.resultText }}
                        >
                          <span className="text-amber-400">✍️</span>
                          <span>ម៉ូដអត្ថបទ & រង (Body & Sub)៖</span>
                        </label>
                      </div>
                      <select
                        id="select-body-font"
                        value={bodyFontFamily}
                        onChange={(e) => handleBodyFontChange(e.target.value)}
                        style={{
                          backgroundColor: activeTheme.resultCardBg,
                          color: activeTheme.resultText,
                          borderColor: activeTheme.resultBorder,
                          fontFamily: bodyFontFamily,
                        }}
                        className="w-full border rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer focus:outline-none shadow-xs transition hover:brightness-105"
                        title="ជ្រើសរើសម៉ូដអក្សររង និងអត្ថបទ (Body & Subheadings Font)"
                      >
                        {BODY_FONT_OPTIONS.map((f) => (
                          <option
                            key={f.id}
                            value={f.font}
                            style={{ fontFamily: f.font }}
                            className="bg-slate-900 text-white py-1"
                          >
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* បន្ទាត់ទី ២៖ ទំហំអក្សរ និងពណ៌អក្សរ (Fully Responsive on All Devices) */}
                  <div
                    className="pt-2.5 border-t flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3"
                    style={{ borderColor: activeTheme.resultBorder }}
                  >
                    {/* ទំហំអក្សរ (Font Size) */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <label
                        htmlFor="select-app-font-size"
                        className="text-[11px] font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                        style={{ color: activeTheme.resultText }}
                      >
                        <span className="text-sm">📏</span>
                        <span>ទំហំអក្សរ៖</span>
                      </label>
                      <select
                        id="select-app-font-size"
                        value={appFontSize}
                        onChange={(e) => handleFontSizeChange(e.target.value)}
                        style={{
                          backgroundColor: activeTheme.resultCardBg,
                          color: activeTheme.resultText,
                          borderColor: activeTheme.resultBorder,
                        }}
                        className="border rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer focus:outline-none shadow-xs transition hover:brightness-105"
                        title="ជ្រើសរើសទំហំអក្សរ (Font Size)"
                      >
                        <option value="small">តូច (Small - 85%)</option>
                        <option value="normal">ល្មម (Normal - 100%)</option>
                        <option value="large">ធំ (Large - 115%)</option>
                        <option value="xlarge">ធំខ្លាំង (Extra Large - 130%)</option>
                      </select>
                    </div>

                    {/* ពណ៌អក្សរ (Font Color) */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <label
                        htmlFor="app-font-color-picker"
                        className="text-[11px] font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                        style={{ color: activeTheme.resultText }}
                      >
                        <span className="text-sm">🎨</span>
                        <span>ពណ៌អក្សរ៖</span>
                      </label>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          id="app-font-color-picker"
                          type="color"
                          value={appFontColor}
                          onChange={(e) => handleFontColorChange(e.target.value)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg cursor-pointer border shadow-xs p-0.5 bg-transparent shrink-0"
                          title="រើសពណ៌អក្សរតាមចិត្ត (Font Color)"
                        />
                        <span
                          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs shrink-0 select-all"
                          style={{
                            backgroundColor: appFontColor,
                            color: getContrastColor(appFontColor),
                            borderColor: appFontColor,
                          }}
                        >
                          {appFontColor.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================== */}
              {/* ផ្នែកគ្រប់គ្រងអាជ្ញាប័ណ្ណ (License Key Management) */}
              {/* ========================================== */}
              <div className="license-settings-card">
                {/* បដាជូនដំណឹងសមាជិក VIP ប្រសិនបើមិនទាន់ Active */}
                {(!licenseData?.is_active || !isLicenseValid()) &&
                 (typeof window === 'undefined' || localStorage.getItem('app_vip_status') !== 'active') && (
                  <div className="mb-3 p-3 bg-amber-500/15 border-2 border-amber-400/80 rounded-xl text-amber-200 flex items-start gap-2.5 shadow-sm">
                    <span className="text-xl shrink-0 leading-none">👑</span>
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-amber-300">មុខងារសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ!</div>
                      <div className="text-amber-100 font-medium mt-0.5 leading-relaxed">
                        មុខងារនេះសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ! សូមបញ្ចូល License Key របស់អ្នកដើម្បីដោះសោ។
                      </div>
                    </div>
                  </div>
                )}

                {/* Header នៃ Card */}
                <div className="license-header">
                  <div className="license-title-box">
                    <span className="license-icon">🔑</span>
                    <div>
                      <h4 className="license-title">អាជ្ញាប័ណ្ណប្រើប្រាស់ (License Key)</h4>
                      <p className="license-subtitle">បញ្ចូលលេខកូដដើម្បីដោះសោមុខងារបង្កើតសាច់រឿង</p>
                    </div>
                  </div>
                  {/* ផ្លាកបង្ហាញស្ថានភាព (Status Badge) */}
                  {(Boolean(licenseData?.is_active && (!licenseData.expires_at || new Date(licenseData.expires_at).getTime() >= Date.now())) ||
                    (typeof window !== 'undefined' && localStorage.getItem('app_vip_status') === 'active')) ? (
                    <span id="license-status-badge" className="license-badge badge-active font-bold">
                      🟢 បានដំណើរការ (VIP Active)
                    </span>
                  ) : (
                    <span id="license-status-badge" className="license-badge badge-inactive">
                      ⚪ {licenseData?.expires_at && new Date(licenseData.expires_at).getTime() < Date.now() ? '🔴 ផុតកំណត់ (Expired)' : 'មិនទាន់ដំណើរការ (Inactive)'}
                    </span>
                  )}
                </div>

                {/* ប្រអប់ព័ត៌មានស្ថានភាពលម្អិត */}
                {Boolean(
                  (licenseData && licenseData.is_active && (!licenseData.expires_at || new Date(licenseData.expires_at).getTime() >= Date.now())) ||
                  (typeof window !== 'undefined' && localStorage.getItem('app_vip_status') === 'active')
                ) && (
                  <div id="license-details-box" className="license-details-box">
                    <div className="license-detail-item">
                      <span className="detail-label">ស្ថានភាព៖</span>
                      <span className="detail-value text-emerald-400 font-bold">🟢 បានដំណើរការ (VIP Active)</span>
                    </div>
                    <div className="license-detail-item">
                      <span className="detail-label">កញ្ចប់ (Plan)៖</span>
                      <span id="license-plan-name" className="detail-value text-accent">{licenseData?.plan_type || 'VIP Member'}</span>
                    </div>
                    <div className="license-detail-item">
                      <span className="detail-label">ផុតកំណត់នៅ៖</span>
                      <span id="license-expiry-date" className="detail-value">
                        {licenseData?.expires_at ? new Date(licenseData.expires_at).toLocaleDateString('km-KH') : 'ពេញមួយជីវិត (Lifetime)'}
                      </span>
                    </div>
                    <div className="license-detail-item">
                      <span className="detail-label">🔒 Device Lock៖</span>
                      <span id="license-device-lock" className="detail-value text-emerald-400 font-mono text-[11px]">
                        បានចាក់សោលើម៉ាស៊ីននេះ ({currentDeviceId.slice(0, 8)}...)
                      </span>
                    </div>
                  </div>
                )}

                {/* ព័ត៌មាន Device Lock (បង្ហាញតែពេល License មានស្ថានភាព Active ប៉ុណ្ណោះ) */}
                {Boolean(licenseData?.is_active && (!licenseData.expires_at || new Date(licenseData.expires_at).getTime() >= Date.now())) && (
                  <div className="flex items-center justify-between text-[11px] text-purple-300/70 mb-1.5 px-0.5 animate-fadeIn">
                    <span className="flex items-center gap-1">
                      <span>🔒 Device Lock (១ Key ប្រើបានតែ ១ ឧបករណ៍)</span>
                    </span>
                    <span
                      className="font-mono text-[10px] text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800/40"
                      title={currentDeviceId}
                    >
                      ID: {currentDeviceId.slice(0, 8)}...
                    </span>
                  </div>
                )}

                {/* Form បញ្ចូលលេខកូដ */}
                <div className="license-form-group">
                  <div className="license-input-wrapper">
                    <input
                      type="text"
                      id="license-key-input"
                      className="license-input"
                      placeholder="PRO-XXXX-XXXX-XXXX"
                      autoComplete="off"
                      spellCheck="false"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleActivateLicense();
                        }
                      }}
                    />
                    <button
                      type="button"
                      id="btn-activate-license"
                      onClick={handleActivateLicense}
                      disabled={isActivatingLicense}
                      className="license-btn-activate cursor-pointer"
                    >
                      <span className="btn-text">{isActivatingLicense ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ដំណើរការ'}</span>
                    </button>
                  </div>

                  {/* ប៊ូតុងដកអាជ្ញាប័ណ្ណចេញ (បង្ហាញតែពេល Active) ជាមួយ Native Confirm Dialog */}
                  {(Boolean(licenseData?.is_active) || (typeof window !== 'undefined' && localStorage.getItem('app_vip_status') === 'active')) && (
                    <div className="w-full mt-2.5 flex justify-end">
                      <button
                        type="button"
                        id="btn-remove-license"
                        onClick={handleRemoveLicenseClick}
                        disabled={isActivatingLicense}
                        className="license-btn-remove cursor-pointer text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-xs font-semibold disabled:opacity-50"
                        title="ដកអាជ្ញាប័ណ្ណចេញពីម៉ាស៊ីននេះ"
                      >
                        {isActivatingLicense ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>កំពុងដកចេញ...</span>
                          </>
                        ) : (
                          <>
                            <span>🗑️</span>
                            <span>ដកអាជ្ញាប័ណ្ណចេញ</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* សារជូនដំណឹង Feedback (Error / Success message) - លោតបង្ហាញមួយភ្លែត រួចរលត់ទៅវិញស្វ័យប្រវត្តិ */}
                {licenseFeedback && (
                  <div
                    id="license-feedback-msg"
                    className={`license-message flex items-start justify-between gap-2.5 transition-all duration-300 animate-fadeIn ${
                      licenseFeedback.type === 'success' ? 'msg-success shadow-sm' : 'msg-error shadow-sm'
                    }`}
                  >
                    <div className="flex-1 leading-relaxed">
                      {licenseFeedback.message}
                    </div>
                    <button
                      type="button"
                      onClick={() => setLicenseFeedback(null)}
                      className="text-xs opacity-60 hover:opacity-100 transition p-0.5 cursor-pointer shrink-0 rounded hover:bg-black/10 dark:hover:bg-white/10"
                      title="បិទ (Close)"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                backgroundColor: activeTheme.resultBoxBg,
                borderColor: activeTheme.resultBorder,
              }}
              className="px-4 py-3 border-t flex items-center justify-between shrink-0"
            >
              <button
                type="button"
                onClick={handleResetTheme}
                className="inline-flex items-center gap-1.5 text-xs opacity-75 hover:opacity-100 hover:underline cursor-pointer py-1"
                title="កំណត់ពណ៌ និងផ្ទៃត្រឡប់ទៅដើម (Reset to Default)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>កំណត់ដូចដើម</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{
                  backgroundColor: activeTheme.accent,
                  color: getContrastColor(activeTheme.accent),
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition hover:opacity-90 active:scale-95 cursor-pointer"
              >
                រួចរាល់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ផ្ទាំង Pop-up Confirm ពេលចុចដកអាជ្ញាប័ណ្ណ (100% Guaranteed to work in all browsers & iframes) */}
      {showConfirmDeactivate && (
        <div
          id="confirm-remove-license-modal"
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isActivatingLicense) {
              setShowConfirmDeactivate(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: activeTheme.resultCardBg,
              borderColor: activeTheme.resultBorder,
              color: activeTheme.resultText,
            }}
            className="w-full max-w-sm rounded-2xl border-2 shadow-2xl p-5 flex flex-col gap-4 text-center animate-scale-up"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto shrink-0 shadow-inner">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-base sm:text-lg text-red-400">
                ដកអាជ្ញាប័ណ្ណ
              </h4>
              <p className="text-xs sm:text-sm font-semibold opacity-90 leading-relaxed">
                តើអ្នកពិតជាចង់ដកអាជ្ញាប័ណ្ណនេះចេញពីម៉ាស៊ីននេះមែនទេ?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmDeactivate(false)}
                disabled={isActivatingLicense}
                style={{
                  backgroundColor: activeTheme.resultBoxBg,
                  borderColor: activeTheme.resultBorder,
                  color: activeTheme.resultText,
                }}
                className="flex-1 py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold hover:opacity-85 transition cursor-pointer disabled:opacity-50"
              >
                បោះបង់
              </button>
              <button
                type="button"
                id="btn-confirm-remove-license-modal"
                onClick={async () => {
                  await handleRemoveLicense();
                  setShowConfirmDeactivate(false);
                }}
                disabled={isActivatingLicense}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isActivatingLicense ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin shrink-0" />
                    <span>កំពុងដក...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>យល់ព្រម ដកចេញ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Lock Alert Popup */}
      {showVipModal && (
        <div
          id="vip-alert-popup"
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVipModal(false);
            }
          }}
        >
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-purple-950 border-2 border-amber-400 rounded-2xl shadow-2xl p-5 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-400/20 border-2 border-amber-400/60 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-amber-400/30 animate-bounce">
              👑
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-amber-300">
                មុខងារសម្រាប់តែសមាជិក VIP
              </h3>
              <p className="text-xs text-amber-100 font-medium leading-relaxed px-1">
                មុខងារនេះសម្រាប់តែសមាជិក VIP ប៉ុណ្ណោះ! សូមបញ្ចូល License Key របស់អ្នកដើម្បីដោះសោ។
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                id="btn-vip-go-license"
                onClick={() => {
                  setShowVipModal(false);
                  setShowSettingsModal(true);
                  setTimeout(() => {
                    const el = document.getElementById('license-key-input');
                    if (el) el.focus();
                  }, 150);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔑 បញ្ចូល License Key ឥឡូវនេះ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowVipModal(false)}
                className="w-full py-2 text-xs text-gray-400 hover:text-white transition cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Story Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div
            style={{
              backgroundColor: activeTheme.resultCardBg,
              color: activeTheme.resultText,
              borderColor: activeTheme.resultBorder,
            }}
            className="w-full max-w-2xl max-h-[85vh] rounded-2xl border-2 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: activeTheme.resultBoxBg,
                borderColor: activeTheme.resultBorder,
              }}
              className="px-4 py-3 border-b flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" style={{ color: activeTheme.accent }} />
                <h3 className="font-bold text-sm sm:text-base">ប្រវត្តិសាច់រឿង (Story History)</h3>
                <span className="text-xs opacity-70">({history.length} រឿង)</span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    សម្អាតទាំងអស់
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {history.length === 0 ? (
                <div className="text-center py-12 opacity-60 space-y-2">
                  <Clock className="w-10 h-10 mx-auto opacity-50" />
                  <p className="text-xs font-medium">មិនទាន់មានប្រវត្តិសាច់រឿងនៅឡើយទេ</p>
                  <p className="text-[11px] opacity-75">រាល់ពេលអ្នកចុចបង្កើតសាច់រឿង ប្រព័ន្ធនឹងរក្សាទុកដោយស្វ័យប្រវត្តិនៅទីនេះ។</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistory(item)}
                    style={{
                      backgroundColor: activeTheme.resultBoxBg,
                      borderColor: activeTheme.resultBorder,
                    }}
                    className="p-3.5 rounded-xl border flex items-center justify-between gap-3 hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm truncate group-hover:text-amber-500 transition">
                          {item.storyTitle}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold shrink-0">
                          {item.totalScenes} ឈុត
                        </span>
                      </div>
                      <p className="text-[11px] opacity-70 truncate mt-0.5">
                        {item.description || item.characters}
                      </p>
                      <div className="text-[10px] opacity-50 mt-1 flex items-center gap-2 font-mono">
                        <span>📅 {item.dateFormatted}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* ប៊ូតុង 👁️ មើលឡើងវិញ (View/Load) */}
                      <button
                        type="button"
                        onClick={() => handleLoadHistory(item)}
                        style={{
                          backgroundColor: activeTheme.accent,
                          color: getContrastColor(activeTheme.accent),
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer hover:opacity-90 transition flex items-center gap-1 shadow-xs active:scale-95"
                        title="ទាញ Prompts ទាំងនោះមកបង្ហាញលើ Tab «លទ្ធផល Prompt» ឡើងវិញ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>មើលឡើងវិញ</span>
                      </button>

                      {/* ប៊ូតុង 📋 Copy ទាំងអស់ (Copy All) */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyHistoryStoryAll(item, e)}
                        style={{
                          backgroundColor: activeTheme.resultCardBg,
                          borderColor: activeTheme.resultBorder,
                          color: activeTheme.resultText,
                        }}
                        className="px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer hover:opacity-85 transition flex items-center gap-1 shadow-xs active:scale-95"
                        title="ចម្លង Prompts ទាំងអស់នៃរឿងនេះ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Copy ទាំងអស់</span>
                      </button>

                      {/* ប៊ូតុង 🗑️ លុប (Delete) */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(item.id, e, item.title || item.storyTitle)}
                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition border border-transparent hover:border-red-500/30 active:scale-95"
                        title="លុប"
                        aria-label="លុប"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete / Clear All (Prevents Accidental Taps) */}
      {deleteConfirmState && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div
            style={{
              backgroundColor: activeTheme.resultCardBg,
              color: activeTheme.resultText,
              borderColor: activeTheme.resultBorder,
            }}
            className="w-full max-w-sm rounded-2xl border-2 shadow-2xl p-5 flex flex-col gap-4 text-center animate-scale-up"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-base sm:text-lg">
                {deleteConfirmState.type === 'all'
                  ? 'បញ្ជាក់ការសម្អាតប្រវត្តិទាំងអស់'
                  : 'បញ្ជាក់ការលុបសាច់រឿង'}
              </h4>
              <p className="text-xs opacity-80 leading-relaxed font-medium">
                {deleteConfirmState.type === 'all'
                  ? 'តើអ្នកពិតជាចង់លុបប្រវត្តិរឿងទាំងអស់មែនទេ?'
                  : `តើអ្នកពិតជាចង់លុបសាច់រឿង «${deleteConfirmState.itemTitle}» នេះចេញពីប្រវត្តិមែនទេ?`}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmState(null)}
                style={{
                  backgroundColor: activeTheme.resultBoxBg,
                  borderColor: activeTheme.resultBorder,
                  color: activeTheme.resultText,
                }}
                className="flex-1 py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold hover:opacity-85 transition cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>{deleteConfirmState.type === 'all' ? 'សម្អាតទាំងអស់' : 'យល់ព្រមលុប'}</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Footer / Bottom Bar: Slim & Compact size */}
      <footer
        style={{
          backgroundColor: activeTheme.menuBg,
          borderColor: activeTheme.menuBorder,
          color: activeTheme.menuText,
          fontFamily: headingFontFamily,
        }}
        className="fixed bottom-0 left-0 right-0 z-40 text-[9.5px] sm:text-[10.5px] py-1.5 px-3 sm:px-4 border-t shadow-[0_-2px_8px_rgba(0,0,0,0.1)] transition-colors duration-300 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <span className="opacity-80 truncate text-[9.5px] sm:text-[10.5px] leading-normal pt-0.5">
            កម្មវិធីបង្កើតសាច់រឿង © ២០២៦
          </span>
          <span className="font-normal truncate text-[9.5px] sm:text-[10.5px] shrink-0 leading-normal pt-0.5">
            បង្កើតដោយ ឡោម មនីវង្ស (LORM MONYVONG)
          </span>
        </div>
      </footer>

      {/* Floating Toast Notification when copying */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-10 right-4 sm:right-6 z-50 bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-white/20 transition-all"
        >
          <CheckCheck className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
