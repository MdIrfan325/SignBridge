export type SignLanguageKey = "asl" | "wsl" | "isl";
export type SignMode = "alphabet" | "word";

export interface SignEntry {
  label: string;
  type: "alphabet" | "word";
  description: string;
  movement: string;
  tip: string;
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
}

const aslAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
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
    alphabet: aslAlphabet.map((letter) => ({ label: letter, video: alphabetVideoMap[letter] })),
    words: [
      { label: "Hello", type: "word", description: "A friendly opening used in conversation.", movement: "Raise the hand and move it slightly side to side.", tip: "Keep the palm open and relaxed." },
      { label: "Thank you", type: "word", description: "A gratitude marker used after support or service.", movement: "Touch the chin and move the hand forward.", tip: "Pair with a nod for natural conversation." },
      { label: "Please", type: "word", description: "A polite request marker.", movement: "Rub the chest in a small circular motion.", tip: "Use gently to show courtesy." },
      { label: "Sorry", type: "word", description: "An apology or repair signal.", movement: "Make a fist near the chin and circle downward.", tip: "Keep facial expression sincere." },
      { label: "Yes", type: "word", description: "An affirmative response.", movement: "Close the hand into a nodding fist.", tip: "Small repeated motion is enough." },
      { label: "No", type: "word", description: "A negative response.", movement: "Tap the index and middle fingers against the thumb.", tip: "Keep the motion crisp." },
      { label: "Help", type: "word", description: "A request for assistance.", movement: "Raise one fist with the thumb up, then lift both hands.", tip: "Use when support is needed." },
      { label: "Water", type: "word", description: "A common everyday noun.", movement: "Point toward the chin with a bent hand.", tip: "Use clear handshape." },
      { label: "Food", type: "word", description: "A meal or snack reference.", movement: "Bring a flat hand toward the mouth.", tip: "Keep the wrist steady." },
      { label: "Friend", type: "word", description: "A relationship word.", movement: "Hook the index fingers together, then reverse and repeat.", tip: "Connect both hands smoothly." },
      { label: "Family", type: "word", description: "A household or kinship group.", movement: "Use F handshapes and circle outward.", tip: "Start close, then open outward." },
      { label: "School", type: "word", description: "An education setting.", movement: "Clap both flat hands together twice.", tip: "Use a clear double clap motion." },
      { label: "Work", type: "word", description: "Employment or task activity.", movement: "Tap one S-hand over the other S-hand.", tip: "Keep hands aligned." },
      { label: "Love", type: "word", description: "An affection word.", movement: "Cross both arms over the chest.", tip: "Hold briefly for emphasis." },
      { label: "Good", type: "word", description: "A positive quality marker.", movement: "Move a flat hand from chin to opposite palm.", tip: "Maintain a calm expression." },
      { label: "Home", type: "word", description: "A place of residence.", movement: "Touch the cheek and mouth area with a flat hand.", tip: "Use one smooth movement." },
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
    alphabet: aslAlphabet.map((letter) => ({ label: letter })),
    words: [
      { label: "Hello", type: "word", description: "A greeting used to begin interaction.", movement: "Lift the hand with an open palm and move it gently.", tip: "Use natural eye contact." },
      { label: "Thank you", type: "word", description: "A gratitude expression.", movement: "Bring the hand forward from the face.", tip: "A small nod helps meaning." },
      { label: "Please", type: "word", description: "A courteous request.", movement: "Move the hand across the chest in a soft circle.", tip: "Keep the gesture calm." },
      { label: "Sorry", type: "word", description: "An apology signal.", movement: "Move a closed hand downward from the chin.", tip: "Use a respectful facial expression." },
      { label: "Yes", type: "word", description: "An affirmative answer.", movement: "Nod a closed hand forward.", tip: "Keep the movement small." },
      { label: "No", type: "word", description: "A negative answer.", movement: "Tap two fingers against the thumb.", tip: "Repeat once or twice." },
      { label: "Help", type: "word", description: "A request for support.", movement: "Lift both hands upward with a supported handshape.", tip: "Make the request visible." },
      { label: "Coffee", type: "word", description: "A common drink.", movement: "Mime turning a small grinder or cup handle.", tip: "Context helps recognition." },
      { label: "Tea", type: "word", description: "A common drink.", movement: "Mime lifting and sipping from a cup.", tip: "Keep the handshape cup-like." },
      { label: "House", type: "word", description: "A place to live.", movement: "Create a roof shape with both hands.", tip: "Outline the roof clearly." },
      { label: "School", type: "word", description: "An education place.", movement: "Bring flat hands together twice.", tip: "Use a clean double motion." },
      { label: "Work", type: "word", description: "Employment activity.", movement: "Tap one fist onto the other.", tip: "Keep wrists stable." },
      { label: "Friend", type: "word", description: "A companion or close person.", movement: "Link index fingers in both directions.", tip: "Repeat both directions." },
      { label: "Family", type: "word", description: "A kinship group.", movement: "Move F-shaped hands outward in a circle.", tip: "Start close to the body." },
      { label: "Good", type: "word", description: "A positive assessment.", movement: "Move from chin to palm.", tip: "Use a relaxed hand." },
      { label: "Today", type: "word", description: "The current day.", movement: "Bring both flat hands inward toward the body.", tip: "Keep the motion short." },
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
    alphabet: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द"].map((letter) => ({ label: letter })),
    words: [
      { label: "Hello", type: "word", description: "A greeting used to open conversation.", movement: "Raise the hand and move it side to side.", tip: "Smile and face the person." },
      { label: "Thank you", type: "word", description: "A gratitude expression.", movement: "Move the hand forward from near the chin.", tip: "Use a nod to reinforce meaning." },
      { label: "Please", type: "word", description: "A polite request.", movement: "Rotate the hand near the chest.", tip: "Use a gentle movement." },
      { label: "Sorry", type: "word", description: "An apology marker.", movement: "Circle a closed hand downward from the chin.", tip: "Keep the expression respectful." },
      { label: "Yes", type: "word", description: "An affirmative response.", movement: "Close the hand and nod it forward.", tip: "Use a small repeated motion." },
      { label: "No", type: "word", description: "A negative response.", movement: "Tap the index and middle fingers against the thumb.", tip: "Keep the tap visible." },
      { label: "Help", type: "word", description: "A request for assistance.", movement: "Lift both hands upward with supportive handshapes.", tip: "Use clear eye contact." },
      { label: "Home", type: "word", description: "A residence or household.", movement: "Touch the cheek and mouth area with a flat hand.", tip: "Use one smooth movement." },
      { label: "School", type: "word", description: "An education setting.", movement: "Clap flat hands together twice.", tip: "Make both claps visible." },
      { label: "Water", type: "word", description: "A common everyday noun.", movement: "Point a bent hand toward the chin.", tip: "Keep the handshape consistent." },
      { label: "Food", type: "word", description: "A meal or snack reference.", movement: "Bring a flat hand to the mouth.", tip: "Use a relaxed wrist." },
      { label: "Mother", type: "word", description: "A parent or caregiver.", movement: "Tap the thumb of an open hand at the chin.", tip: "Use the thumb side clearly." },
      { label: "Father", type: "word", description: "A parent or caregiver.", movement: "Tap the thumb of an open hand at the forehead.", tip: "Keep the hand open." },
      { label: "Friend", type: "word", description: "A companion.", movement: "Hook index fingers together in both directions.", tip: "Repeat both directions." },
      { label: "Good", type: "word", description: "A positive quality marker.", movement: "Move a flat hand from chin to palm.", tip: "Keep the movement smooth." },
      { label: "Today", type: "word", description: "The current day.", movement: "Bring both flat hands inward.", tip: "Keep the motion compact." },
    ],
    note: "ISL varies across regions and communities. Production systems should be trained and reviewed with local signers.",
  },
];

export const languageMap = Object.fromEntries(LANGUAGES.map((language) => [language.key, language])) as Record<SignLanguageKey, SignLanguage>;

export function getLanguage(key: string): SignLanguage | undefined {
  return LANGUAGES.find((language) => language.key === key);
}

export function getAllSigns(language: SignLanguage): SignEntry[] {
  return language.words;
}
