"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, RefreshCw, Search } from "lucide-react";
import { getSurah, getSurahList, type Ayah, type SurahDetail, type SurahMeta } from "@/lib/quran";

const simplify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const revelation = (type: string) => (type === "Meccan" ? "Makkiyah" : type === "Medinan" ? "Madaniyah" : type);

export default function QuranView() {
  const [list, setList] = useState<SurahMeta[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [query, setQuery] = useState("");
  const [openNumber, setOpenNumber] = useState<number | null>(null);
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<Ayah[]>([]);
  const idxRef = useRef(0);
  const requestRef = useRef(0);

  const loadList = useCallback(async () => {
    setListError("");
    setListLoading(true);
    try {
      setList(await getSurahList());
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const playAt = useCallback((index: number) => {
    const audio = audioRef.current;
    const ayah = ayahsRef.current[index];
    if (!audio || !ayah || !ayah.audio) {
      setPlayingIdx(null);
      return;
    }
    idxRef.current = index;
    audio.src = ayah.audio;
    audio.play().catch(() => setPlayingIdx(null));
    setPlayingIdx(index);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    const onEnded = () => {
      const next = idxRef.current + 1;
      if (next < ayahsRef.current.length) playAt(next);
      else setPlayingIdx(null);
    };
    const onError = () => setPlayingIdx(null);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, [playAt]);

  useEffect(() => {
    if (playingIdx === null) return;
    document.getElementById(`ayah-${playingIdx}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [playingIdx]);

  function stopAudio() {
    audioRef.current?.pause();
    setPlayingIdx(null);
  }

  async function openSurah(number: number) {
    stopAudio();
    const request = ++requestRef.current;
    setOpenNumber(number);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    window.scrollTo({ top: 0 });
    try {
      const result = await getSurah(number);
      if (request !== requestRef.current) return;
      ayahsRef.current = result.ayahs;
      setDetail(result);
    } catch (err) {
      if (request !== requestRef.current) return;
      setDetailError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      if (request === requestRef.current) setDetailLoading(false);
    }
  }

  function closeSurah() {
    stopAudio();
    requestRef.current++;
    ayahsRef.current = [];
    setOpenNumber(null);
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  }

  function toggleAyah(index: number) {
    if (playingIdx === index) stopAudio();
    else playAt(index);
  }

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return list;
    const simple = simplify(q);
    return list.filter(
      (s) =>
        String(s.number) === q ||
        (simple !== "" && (simplify(s.englishName).includes(simple) || simplify(s.englishNameTranslation).includes(simple))) ||
        s.name.includes(q)
    );
  }, [list, query]);

  if (openNumber !== null) {
    const meta = detail?.meta ?? list.find((s) => s.number === openNumber);
    return (
      <section className="px-5 pt-2">
        <button onClick={closeSurah} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-forest-700">
          <ArrowLeft size={15} /> Daftar surah
        </button>

        {meta && (
          <div className="hero-card relative overflow-hidden rounded-[26px] p-5 text-white">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-wide text-emerald-50/75">SURAH {meta.number}</p>
                <h2 className="mt-1 text-[22px] font-semibold tracking-[-.03em]">{meta.englishName}</h2>
                <p className="mt-1 text-[11px] text-emerald-50/75">
                  {meta.englishNameTranslation} · {revelation(meta.revelationType)} · {meta.numberOfAyahs} ayat
                </p>
              </div>
              <p className="font-serif text-[30px]" dir="rtl">{meta.name}</p>
            </div>
          </div>
        )}

        {detailLoading && <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"><RefreshCw size={14} className="animate-spin" /> Memuat surah…</p>}
        {detailError && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
            {detailError}
            <button onClick={() => void openSurah(openNumber)} className="mt-2 block font-semibold underline">Coba lagi</button>
          </div>
        )}

        {detail && (
          <>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">Qari: Mishary Alafasy</p>
              <button
                onClick={() => (playingIdx === null ? playAt(0) : stopAudio())}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-forest-50 px-3 text-xs font-semibold text-forest-800"
              >
                {playingIdx === null ? <Play size={14} /> : <Pause size={14} />}
                {playingIdx === null ? "Putar dari awal" : "Berhenti"}
              </button>
            </div>

            {detail.meta.number !== 1 && detail.meta.number !== 9 && (
              <p className="mt-4 text-center font-serif text-[24px] text-forest-900" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
            )}

            <div className="mt-4 space-y-3">
              {detail.ayahs.map((ayah, index) => {
                const active = playingIdx === index;
                return (
                  <article
                    id={`ayah-${index}`}
                    key={ayah.number}
                    className={`rounded-[22px] border p-4 transition ${active ? "border-[#bcd5c4] bg-[#f3f8f4]" : "border-slate-100 bg-white"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#edf4ef] px-2 text-[11px] font-semibold text-forest-700">{ayah.numberInSurah}</span>
                      <button
                        aria-label={active ? "Jeda ayat" : "Putar ayat"}
                        onClick={() => toggleAyah(index)}
                        disabled={!ayah.audio}
                        className="grid h-9 w-9 place-items-center rounded-full bg-forest-50 text-forest-800 disabled:opacity-40"
                      >
                        {active ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                    <p className="text-right font-serif text-[26px] leading-[2] text-forest-900" dir="rtl">{ayah.arab}</p>
                    <p className="mt-3 text-[13px] leading-6 text-slate-600">{ayah.translation}</p>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 text-center text-[10px] leading-4 text-slate-400">Teks Arab, terjemahan Indonesia, dan audio dari AlQuran Cloud API.</p>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="px-5 pt-2">
      <div className="mb-3">
        <p className="section-kicker">AL-QURAN</p>
        <h2 className="section-title">Daftar surah</h2>
      </div>

      <label className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3.5 py-3">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau nomor surah"
          className="w-full bg-transparent text-[13px] text-forest-900 outline-none placeholder:text-slate-400"
        />
      </label>

      {listLoading && <p className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400"><RefreshCw size={14} className="animate-spin" /> Memuat daftar surah…</p>}
      {listError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
          {listError}
          <button onClick={() => void loadList()} className="mt-2 block font-semibold underline">Coba lagi</button>
        </div>
      )}
      {!listLoading && !listError && filtered.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Surah tidak ditemukan.</p>}

      <div className="space-y-2.5">
        {filtered.map((s) => (
          <button
            key={s.number}
            onClick={() => void openSurah(s.number)}
            className="flex w-full items-center gap-3 rounded-[20px] border border-slate-100 bg-white p-3.5 text-left shadow-[0_5px_20px_rgba(23,54,43,.035)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf4ef] text-[12px] font-bold text-forest-700">{s.number}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-forest-900">{s.englishName}</span>
              <span className="mt-0.5 block text-[11px] text-slate-400">{s.englishNameTranslation} · {s.numberOfAyahs} ayat · {revelation(s.revelationType)}</span>
            </span>
            <span className="font-serif text-[20px] text-forest-800" dir="rtl">{s.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
