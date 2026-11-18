const BASE = "https://api.alquran.cloud/v1";

export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  arab: string;
  translation: string;
  audio: string;
  juz?: number;
};

export type SurahDetail = { meta: SurahMeta; ayahs: Ayah[] };

type RawAyah = { number: number; numberInSurah: number; text: string; audio?: string; juz?: number };
type RawEdition = SurahMeta & { ayahs: RawAyah[] };

let listCache: SurahMeta[] | null = null;
const surahCache = new Map<number, SurahDetail>();

async function getJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal memuat data Quran (${response.status}).`);
  return response.json();
}

export async function getSurahList(): Promise<SurahMeta[]> {
  if (listCache) return listCache;
  const json = await getJson(`${BASE}/surah`);
  listCache = json.data as SurahMeta[];
  return listCache;
}

// Hapus harakat/tanda baca Arab agar perbandingan kata lebih aman.
function normalizeArabic(text: string) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/\u0671/g, "\u0627");
}

// Pada API ini, ayat 1 tiap surah (kecuali Al-Fatihah dan At-Taubah) diawali basmalah.
// Basmalah ditampilkan terpisah, jadi dibuang dari teks ayat 1 jika memang ada.
function stripBismillah(text: string, surah: number, ayah: number) {
  if (surah === 1 || surah === 9 || ayah !== 1) return text;
  const words = text.trim().split(/\s+/);
  if (words.length > 4 && normalizeArabic(words[0]) === "\u0628\u0633\u0645" && normalizeArabic(words[1]) === "\u0627\u0644\u0644\u0647") {
    return words.slice(4).join(" ");
  }
  return text;
}

export async function getSurah(number: number): Promise<SurahDetail> {
  const cached = surahCache.get(number);
  if (cached) return cached;
  const json = await getJson(`${BASE}/surah/${number}/editions/quran-uthmani,id.indonesian,ar.alafasy`);
  const [arabic, indonesian, audio] = json.data as RawEdition[];
  if (!arabic || !indonesian || !audio) throw new Error("Data surah tidak lengkap.");
  const ayahs: Ayah[] = arabic.ayahs.map((item, index) => ({
    number: item.number,
    numberInSurah: item.numberInSurah,
    arab: stripBismillah(item.text, number, item.numberInSurah),
    translation: indonesian.ayahs[index]?.text ?? "",
    audio: audio.ayahs[index]?.audio ?? "",
    juz: item.juz
  }));
  const detail: SurahDetail = {
    meta: {
      number: arabic.number,
      name: arabic.name,
      englishName: arabic.englishName,
      englishNameTranslation: arabic.englishNameTranslation,
      numberOfAyahs: arabic.numberOfAyahs,
      revelationType: arabic.revelationType
    },
    ayahs
  };
  surahCache.set(number, detail);
  return detail;
}

// Awal tiap juz (mushaf standar): surah dan nomor ayat.
export const JUZ_START: { juz: number; surah: number; ayah: number }[] = [
  [1, 1, 1], [2, 2, 142], [3, 2, 253], [4, 3, 93], [5, 4, 24], [6, 4, 148], [7, 5, 82], [8, 6, 111], [9, 7, 88], [10, 8, 41],
  [11, 9, 93], [12, 11, 6], [13, 12, 53], [14, 15, 1], [15, 17, 1], [16, 18, 75], [17, 21, 1], [18, 23, 1], [19, 25, 21], [20, 27, 56],
  [21, 29, 46], [22, 33, 31], [23, 36, 28], [24, 39, 32], [25, 41, 47], [26, 46, 1], [27, 51, 31], [28, 58, 1], [29, 67, 1], [30, 78, 1]
].map(([juz, surah, ayah]) => ({ juz, surah, ayah }));
