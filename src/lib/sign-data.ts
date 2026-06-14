export type SignLanguageKey = "asl" | "wsl" | "isl";
export type SignMode = "alphabet" | "word";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type SignCategory = "basic" | "greetings" | "family" | "education" | "work" | "health" | "emotions" | "numbers" | "daily-life";

export interface VideoAngle {
  angle: "front" | "side" | "back" | "close-up";
  url: string;
}

export interface HandshapeInfo {
  name: string; // e.g., "open hand", "fist", "index finger", etc.
  description?: string;
}

export interface LocationInfo {
  body_part: string; // e.g., "chin", "chest", "forehead", etc.
  description?: string;
}

export interface MovementInfo {
  type: string; // e.g., "circular", "linear", "bounce", etc.
  direction?: string; // e.g., "upward", "inward", etc.
  description: string;
}

export interface RegionalVariation {
  region: string; // e.g., "North India", "South India", etc.
  description: string;
  video?: string;
}

export interface SignEntry {
  id: string; // unique identifier for the sign
  label: string;
  type: "alphabet" | "word";
  description: string;
  category?: SignCategory;
  difficulty?: DifficultyLevel;
  movement: string;
  tip: string;
  videos?: VideoAngle[]; // multiple video angles
  handshape?: HandshapeInfo;
  location?: LocationInfo;
  movementDetails?: MovementInfo;
  regionalVariations?: RegionalVariation[];
  relatedSigns?: string[]; // IDs of related signs
  usage_context?: string;
  etymology?: string;
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  signIds: string[]; // IDs of signs covered in this lesson
  estimatedDuration: number; // minutes
  objectives: string[];
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  type: "flashcard" | "quiz" | "video-recognition" | "production";
  signIds: string[];
  passingScore: number; // percentage (0-100)
}

export interface SignLanguage {
  key: SignLanguageKey;
  name: string;
  shortName: string;
  nativeName: string;
  region: string;
  accent: string;
  gradient: string;
  description: string;
  alphabet: { label: string; video?: string }[];
  words: SignEntry[];
  note: string;
  lessons?: LessonContent[];
  exercises?: PracticeExercise[];
  communityName?: string; // e.g., "ISLRTC" for Indian Sign Language
}

const aslAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const islAlphabet = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द"];
const alphabetVideoMap: Record<string, string> = {
  A: "/alphabet/A.mp4",
  B: "/alphabet/B.mp4",
  C: "/alphabet/C.mp4",
  D: "/alphabet/D.mp4",
  E: "/alphabet/E.mp4",
  F: "/alphabet/F.mp4",
  G: "/alphabet/G.mp4",
  H: "/alphabet/H.mp4",
  I: "/alphabet/I.mp4",
  J: "/alphabet/J.mp4",
  K: "/alphabet/K.mp4",
  L: "/alphabet/L.mp4",
  M: "/alphabet/M.mp4",
  N: "/alphabet/N.mp4",
  O: "/alphabet/O.mp4",
  P: "/alphabet/P.mp4",
  Q: "/alphabet/Q.mp4",
  R: "/alphabet/R.mp4",
  S: "/alphabet/S.mp4",
  T: "/alphabet/T.mp4",
  U: "/alphabet/U.mp4",
  V: "/alphabet/V.mp4",
  W: "/alphabet/W.mp4",
  X: "/alphabet/X.mp4",
  Y: "/alphabet/Y.mp4",
  Z: "/alphabet/Z.mp4",
};

function mapAlphabetWithAslVideos(labels: string[]): { label: string; video?: string }[] {
  return labels.map((label, index) => ({
    label,
    video: alphabetVideoMap[aslAlphabet[index]],
  }));
}

export const LANGUAGES: SignLanguage[] = [
  {
    key: "asl",
    name: "American Sign Language",
    shortName: "ASL",
    nativeName: "American Sign Language",
    region: "United States and parts of Canada",
    accent: "blue",
    gradient: "from-blue-500 to-cyan-400",
    description: "A widely used visual language with its own grammar, regional variation, and Deaf culture.",
    alphabet: mapAlphabetWithAslVideos(aslAlphabet),
    words: [
      { id: "asl-hello", label: "Hello", type: "word", description: "A friendly opening used in conversation.", movement: "Raise the hand and move it slightly side to side.", tip: "Keep the palm open and relaxed." },
      { id: "asl-thank-you", label: "Thank you", type: "word", description: "A gratitude marker used after support or service.", movement: "Touch the chin and move the hand forward.", tip: "Pair with a nod for natural conversation." },
      { id: "asl-please", label: "Please", type: "word", description: "A polite request marker.", movement: "Rub the chest in a small circular motion.", tip: "Use gently to show courtesy." },
      { id: "asl-sorry", label: "Sorry", type: "word", description: "An apology or repair signal.", movement: "Make a fist near the chin and circle downward.", tip: "Keep facial expression sincere." },
      { id: "asl-yes", label: "Yes", type: "word", description: "An affirmative response.", movement: "Close the hand into a nodding fist.", tip: "Small repeated motion is enough." },
      { id: "asl-no", label: "No", type: "word", description: "A negative response.", movement: "Tap the index and middle fingers against the thumb.", tip: "Keep the motion crisp." },
      { id: "asl-help", label: "Help", type: "word", description: "A request for assistance.", movement: "Raise one fist with the thumb up, then lift both hands.", tip: "Use when support is needed." },
      { id: "asl-water", label: "Water", type: "word", description: "A common everyday noun.", movement: "Point toward the chin with a bent hand.", tip: "Use clear handshape." },
      { id: "asl-food", label: "Food", type: "word", description: "A meal or snack reference.", movement: "Bring a flat hand toward the mouth.", tip: "Keep the wrist steady." },
      { id: "asl-friend", label: "Friend", type: "word", description: "A relationship word.", movement: "Hook the index fingers together, then reverse and repeat.", tip: "Connect both hands smoothly." },
      { id: "asl-family", label: "Family", type: "word", description: "A household or kinship group.", movement: "Use F handshapes and circle outward.", tip: "Start close, then open outward." },
      { id: "asl-school", label: "School", type: "word", description: "An education setting.", movement: "Clap both flat hands together twice.", tip: "Use a clear double clap motion." },
      { id: "asl-work", label: "Work", type: "word", description: "Employment or task activity.", movement: "Tap one S-hand over the other S-hand.", tip: "Keep hands aligned." },
      { id: "asl-love", label: "Love", type: "word", description: "An affection word.", movement: "Cross both arms over the chest.", tip: "Hold briefly for emphasis." },
      { id: "asl-good", label: "Good", type: "word", description: "A positive quality marker.", movement: "Move a flat hand from chin to opposite palm.", tip: "Maintain a calm expression." },
      { id: "asl-home", label: "Home", type: "word", description: "A place of residence.", movement: "Touch the cheek and mouth area with a flat hand.", tip: "Use one smooth movement." },
    ],
    note: "ASL signs can vary by region, age group, and community preference. Validate with local Deaf collaborators before production use.",
  },
  {
    key: "wsl",
    name: "Welsh Sign Language",
    shortName: "WSL",
    nativeName: "Iaith Arwyddion Gymraeg",
    region: "Wales",
    accent: "green",
    gradient: "from-emerald-500 to-lime-400",
    description: "A Welsh sign language shaped by local Deaf communities and influenced by surrounding sign-language traditions.",
    alphabet: mapAlphabetWithAslVideos(aslAlphabet),
    words: [
      { id: "wsl-hello", label: "Hello", type: "word", description: "A greeting used to begin interaction.", movement: "Lift the hand with an open palm and move it gently.", tip: "Use natural eye contact." },
      { id: "wsl-thank-you", label: "Thank you", type: "word", description: "A gratitude expression.", movement: "Bring the hand forward from the face.", tip: "A small nod helps meaning." },
      { id: "wsl-please", label: "Please", type: "word", description: "A courteous request.", movement: "Move the hand across the chest in a soft circle.", tip: "Keep the gesture calm." },
      { id: "wsl-sorry", label: "Sorry", type: "word", description: "An apology signal.", movement: "Move a closed hand downward from the chin.", tip: "Use a respectful facial expression." },
      { id: "wsl-yes", label: "Yes", type: "word", description: "An affirmative answer.", movement: "Nod a closed hand forward.", tip: "Keep the movement small." },
      { id: "wsl-no", label: "No", type: "word", description: "A negative answer.", movement: "Tap two fingers against the thumb.", tip: "Repeat once or twice." },
      { id: "wsl-help", label: "Help", type: "word", description: "A request for support.", movement: "Lift both hands upward with a supported handshape.", tip: "Make the request visible." },
      { id: "wsl-coffee", label: "Coffee", type: "word", description: "A common drink.", movement: "Mime turning a small grinder or cup handle.", tip: "Context helps recognition." },
      { id: "wsl-tea", label: "Tea", type: "word", description: "A common drink.", movement: "Mime lifting and sipping from a cup.", tip: "Keep the handshape cup-like." },
      { id: "wsl-house", label: "House", type: "word", description: "A place to live.", movement: "Create a roof shape with both hands.", tip: "Outline the roof clearly." },
      { id: "wsl-school", label: "School", type: "word", description: "An education place.", movement: "Bring flat hands together twice.", tip: "Use a clean double motion." },
      { id: "wsl-work", label: "Work", type: "word", description: "Employment activity.", movement: "Tap one fist onto the other.", tip: "Keep wrists stable." },
      { id: "wsl-friend", label: "Friend", type: "word", description: "A companion or close person.", movement: "Link index fingers in both directions.", tip: "Repeat both directions." },
      { id: "wsl-family", label: "Family", type: "word", description: "A kinship group.", movement: "Move F-shaped hands outward in a circle.", tip: "Start close to the body." },
      { id: "wsl-good", label: "Good", type: "word", description: "A positive assessment.", movement: "Move from chin to palm.", tip: "Use a relaxed hand." },
      { id: "wsl-today", label: "Today", type: "word", description: "The current day.", movement: "Bring both flat hands inward toward the body.", tip: "Keep the motion short." },
    ],
    note: "WSL resources are less widely digitized than some larger sign languages. Treat this starter set as a foundation for community review.",
  },
  {
    key: "isl",
    name: "Indian Sign Language",
    shortName: "ISL",
    nativeName: "भारतीय संकेत भाषा",
    region: "India",
    accent: "orange",
    gradient: "from-orange-500 to-amber-400",
    description: "A visual language used across India, with regional variation and a rich Deaf community tradition.",
    alphabet: mapAlphabetWithAslVideos(islAlphabet),
    communityName: "ISLRTC",
    words: [
      { 
        id: "isl-hello", 
        label: "Hello", 
        type: "word", 
        description: "A greeting used to open conversation.", 
        category: "greetings",
        difficulty: "beginner",
        movement: "Raise the hand and move it side to side.", 
        tip: "Smile and face the person.",
        handshape: { name: "open hand" },
        location: { body_part: "neutral space in front" },
        movementDetails: { type: "alternating side-to-side", description: "Move the open hand side to side with palm forward" },
        usage_context: "Used when meeting someone or starting a conversation",
      },
      { 
        id: "isl-thank-you", 
        label: "Thank you", 
        type: "word", 
        description: "A gratitude expression.", 
        category: "greetings",
        difficulty: "beginner",
        movement: "Move the hand forward from near the chin.", 
        tip: "Use a nod to reinforce meaning.",
        handshape: { name: "open hand, palm upward" },
        location: { body_part: "chin area, moving forward" },
        movementDetails: { type: "forward movement", description: "Move from chin forward with a single smooth motion" },
        regionalVariations: [
          { region: "North India", description: "Often accompanied with a hand-over-heart gesture" },
          { region: "South India", description: "May use a slightly different palm orientation" },
        ],
      },
      { 
        id: "isl-please", 
        label: "Please", 
        type: "word", 
        description: "A polite request.", 
        category: "greetings",
        difficulty: "beginner",
        movement: "Rotate the hand near the chest.", 
        tip: "Use a gentle movement.",
        handshape: { name: "open hand" },
        location: { body_part: "chest area" },
        movementDetails: { type: "circular", description: "Small circular motion near the chest" },
      },
      { 
        id: "isl-sorry", 
        label: "Sorry", 
        type: "word", 
        description: "An apology marker.", 
        category: "emotions",
        difficulty: "beginner",
        movement: "Circle a closed hand downward from the chin.", 
        tip: "Keep the expression respectful.",
        handshape: { name: "fist" },
        location: { body_part: "chin area, moving downward" },
        movementDetails: { type: "downward circular", description: "Circle the fist downward from chin" },
      },
      { 
        id: "isl-yes", 
        label: "Yes", 
        type: "word", 
        description: "An affirmative response.", 
        category: "basic",
        difficulty: "beginner",
        movement: "Close the hand and nod it forward.", 
        tip: "Use a small repeated motion.",
        handshape: { name: "fist" },
        movementDetails: { type: "nodding", description: "Repeated nodding motion with closed fist" },
      },
      { 
        id: "isl-no", 
        label: "No", 
        type: "word", 
        description: "A negative response.", 
        category: "basic",
        difficulty: "beginner",
        movement: "Tap the index and middle fingers against the thumb.", 
        tip: "Keep the tap visible.",
        handshape: { name: "open hand with index and middle fingers extended" },
        movementDetails: { type: "tapping", description: "Tap index and middle fingers against thumb" },
      },
      { 
        id: "isl-help", 
        label: "Help", 
        type: "word", 
        description: "A request for assistance.", 
        category: "basic",
        difficulty: "beginner",
        movement: "Lift both hands upward with supportive handshapes.", 
        tip: "Use clear eye contact.",
        handshape: { name: "open hands" },
        movementDetails: { type: "upward", description: "Both hands lift upward together" },
      },
      { 
        id: "isl-home", 
        label: "Home", 
        type: "word", 
        description: "A residence or household.", 
        category: "daily-life",
        difficulty: "beginner",
        movement: "Touch the cheek and mouth area with a flat hand.", 
        tip: "Use one smooth movement.",
        handshape: { name: "flat hand" },
        location: { body_part: "cheek and mouth area" },
        movementDetails: { type: "locational", description: "Place flat hand against cheek/mouth area" },
        usage_context: "Indicates the place where one lives",
      },
      { 
        id: "isl-school", 
        label: "School", 
        type: "word", 
        description: "An education setting.", 
        category: "education",
        difficulty: "beginner",
        movement: "Clap flat hands together twice.", 
        tip: "Make both claps visible.",
        handshape: { name: "flat hands" },
        movementDetails: { type: "clapping", description: "Clap two flat hands together twice" },
      },
      { 
        id: "isl-water", 
        label: "Water", 
        type: "word", 
        description: "A common everyday noun.", 
        category: "daily-life",
        difficulty: "beginner",
        movement: "Point a bent hand toward the chin.", 
        tip: "Keep the handshape consistent.",
        handshape: { name: "bent hand, palm down" },
        location: { body_part: "chin area" },
        movementDetails: { type: "locational", description: "Point bent hand toward chin" },
      },
      { 
        id: "isl-food", 
        label: "Food", 
        type: "word", 
        description: "A meal or snack reference.", 
        category: "daily-life",
        difficulty: "beginner",
        movement: "Bring a flat hand to the mouth.", 
        tip: "Use a relaxed wrist.",
        handshape: { name: "flat hand" },
        location: { body_part: "mouth" },
        movementDetails: { type: "forward to mouth", description: "Move flat hand toward mouth" },
        usage_context: "Indicates eating or food",
      },
      { 
        id: "isl-mother", 
        label: "Mother", 
        type: "word", 
        description: "A parent or caregiver.", 
        category: "family",
        difficulty: "beginner",
        movement: "Tap the thumb of an open hand at the chin.", 
        tip: "Use the thumb side clearly.",
        handshape: { name: "open hand with thumb extended" },
        location: { body_part: "chin area" },
        movementDetails: { type: "tapping with thumb", description: "Tap thumb against chin" },
        relatedSigns: ["isl-father", "isl-family"],
      },
      { 
        id: "isl-father", 
        label: "Father", 
        type: "word", 
        description: "A parent or caregiver.", 
        category: "family",
        difficulty: "beginner",
        movement: "Tap the thumb of an open hand at the forehead.", 
        tip: "Keep the hand open.",
        handshape: { name: "open hand with thumb extended" },
        location: { body_part: "forehead area" },
        movementDetails: { type: "tapping with thumb", description: "Tap thumb against forehead" },
        relatedSigns: ["isl-mother", "isl-family"],
      },
      { 
        id: "isl-friend", 
        label: "Friend", 
        type: "word", 
        description: "A companion.", 
        category: "daily-life",
        difficulty: "intermediate",
        movement: "Hook index fingers together in both directions.", 
        tip: "Repeat both directions.",
        handshape: { name: "index fingers extended, hooked" },
        movementDetails: { type: "linking motion", description: "Hook index fingers together, then reverse" },
        usage_context: "Shows connection and companionship",
      },
      { 
        id: "isl-good", 
        label: "Good", 
        type: "word", 
        description: "A positive quality marker.", 
        category: "emotions",
        difficulty: "intermediate",
        movement: "Move a flat hand from chin to palm.", 
        tip: "Keep the movement smooth.",
        handshape: { name: "flat hand" },
        location: { body_part: "chin to palm of other hand" },
        movementDetails: { type: "forward from chin", description: "Move flat hand forward from chin to open palm" },
      },
      { 
        id: "isl-today", 
        label: "Today", 
        type: "word", 
        description: "The current day.", 
        category: "basic",
        difficulty: "beginner",
        movement: "Bring both flat hands inward.", 
        tip: "Keep the motion compact.",
        handshape: { name: "flat hands" },
        movementDetails: { type: "inward movement", description: "Both hands move inward toward the body" },
      },
    ],
    lessons: [
      {
        id: "isl-lesson-1-greetings",
        title: "Basic Greetings & Courtesies",
        description: "Learn essential greetings and polite expressions to start conversations.",
        difficulty: "beginner",
        signIds: ["isl-hello", "isl-thank-you", "isl-please", "isl-sorry"],
        estimatedDuration: 15,
        objectives: [
          "Recognize and produce basic greetings",
          "Understand polite expressions",
          "Practice proper facial expressions and eye contact",
        ],
      },
      {
        id: "isl-lesson-2-family",
        title: "Family & Relationships",
        description: "Learn signs for family members and close relationships.",
        difficulty: "beginner",
        signIds: ["isl-mother", "isl-father", "isl-friend", "isl-family"],
        estimatedDuration: 20,
        objectives: [
          "Identify family member signs",
          "Understand differences in locations (chin vs. forehead)",
          "Practice family-related conversations",
        ],
      },
      {
        id: "isl-lesson-3-daily-life",
        title: "Daily Life & Common Activities",
        description: "Essential signs for everyday situations.",
        difficulty: "beginner",
        signIds: ["isl-home", "isl-school", "isl-water", "isl-food", "isl-today"],
        estimatedDuration: 25,
        objectives: [
          "Learn signs for common daily activities",
          "Understand context-based signing",
          "Practice combinations of signs",
        ],
      },
    ],
    exercises: [
      {
        id: "isl-quiz-1",
        title: "Greetings Recognition Quiz",
        description: "Test your ability to recognize greeting signs.",
        difficulty: "beginner",
        type: "video-recognition",
        signIds: ["isl-hello", "isl-thank-you", "isl-please", "isl-sorry"],
        passingScore: 80,
      },
      {
        id: "isl-quiz-2",
        title: "Family Signs Production",
        description: "Practice producing family member signs.",
        difficulty: "intermediate",
        type: "production",
        signIds: ["isl-mother", "isl-father", "isl-friend"],
        passingScore: 70,
      },
    ],
    note: "ISL content developed in collaboration with Indian Deaf communities. Regional variations exist; this foundation should be expanded with community input. ISLRTC (Indian Sign Language Research and Training Centre) provides comprehensive resources for Indian Sign Language learners and professionals.",
  },
];

export const languageMap = Object.fromEntries(LANGUAGES.map((language) => [language.key, language])) as Record<SignLanguageKey, SignLanguage>;

export function getLanguage(key: string): SignLanguage | undefined {
  return LANGUAGES.find((language) => language.key === key);
}

export function getAllSigns(language: SignLanguage): SignEntry[] {
  return language.words;
}

// Advanced search and filtering utilities
export function searchSigns(
  language: SignLanguage,
  query: string,
  filters?: {
    category?: SignCategory;
    difficulty?: DifficultyLevel;
  }
): SignEntry[] {
  const query_lower = query.toLowerCase();
  
  return language.words.filter((sign) => {
    // Text search
    const matchesQuery =
      sign.label.toLowerCase().includes(query_lower) ||
      sign.description.toLowerCase().includes(query_lower) ||
      (sign.usage_context?.toLowerCase().includes(query_lower) ?? false);

    // Category filter
    if (filters?.category && sign.category !== filters.category) {
      return false;
    }

    // Difficulty filter
    if (filters?.difficulty && sign.difficulty !== filters.difficulty) {
      return false;
    }

    return matchesQuery;
  });
}

export function getSignsByCategory(language: SignLanguage, category: SignCategory): SignEntry[] {
  return language.words.filter((sign) => sign.category === category);
}

export function getSignsByDifficulty(language: SignLanguage, difficulty: DifficultyLevel): SignEntry[] {
  return language.words.filter((sign) => sign.difficulty === difficulty);
}

export function getSignsByHandshape(language: SignLanguage, handshapeName: string): SignEntry[] {
  return language.words.filter((sign) => sign.handshape?.name.toLowerCase().includes(handshapeName.toLowerCase()));
}

export function getSignsByLocation(language: SignLanguage, bodyPart: string): SignEntry[] {
  return language.words.filter((sign) => sign.location?.body_part.toLowerCase().includes(bodyPart.toLowerCase()));
}

export function getRelatedSigns(language: SignLanguage, signId: string): SignEntry[] {
  const sign = language.words.find((s) => s.id === signId);
  if (!sign || !sign.relatedSigns) return [];
  return language.words.filter((s) => sign.relatedSigns?.includes(s.id));
}

export function getSignById(language: SignLanguage, signId: string): SignEntry | undefined {
  return language.words.find((sign) => sign.id === signId);
}

export function getAllCategories(language: SignLanguage): SignCategory[] {
  const categories = new Set<SignCategory>();
  language.words.forEach((sign) => {
    if (sign.category) categories.add(sign.category);
  });
  return Array.from(categories).sort();
}

export function getUniqueHandshapes(language: SignLanguage): HandshapeInfo[] {
  const handshapes = new Map<string, HandshapeInfo>();
  language.words.forEach((sign) => {
    if (sign.handshape && !handshapes.has(sign.handshape.name)) {
      handshapes.set(sign.handshape.name, sign.handshape);
    }
  });
  return Array.from(handshapes.values());
}

export function getUniqueLocations(language: SignLanguage): LocationInfo[] {
  const locations = new Map<string, LocationInfo>();
  language.words.forEach((sign) => {
    if (sign.location && !locations.has(sign.location.body_part)) {
      locations.set(sign.location.body_part, sign.location);
    }
  });
  return Array.from(locations.values());
}
