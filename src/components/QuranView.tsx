"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, Flag, Pause, Play, RefreshCw, Search, Trash2 } from "lucide-react";
import { getSurah, getSurahList, JUZ_START, type Ayah, type SurahDetail, type SurahMeta } from "@/lib/quran";
import { loadBookmarks, loadLastRead, saveBookmarks, saveLastRead, type LastRead, type QuranBookmark } from "@/lib/quranStore";

type Tab = "surah" | "juz" | "saved";

const simplify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const revelation = (type: string) => (type === "Meccan" ? "Makkiyah" : type === "Medinan" ? "Madaniyah" : type);

export default function QuranView() {
  const [list, setList] = useState<SurahMeta[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("surah");
  const [openNumber, setOpenNumber] = useState<number | null>(null);
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [storeReady, setStoreReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsRef = useRef<Ayah[]>([]);
  const idxRef = useRef(0);
  const requestRef = useRef(0);
  const pendingAyahRef = useRef<number | null>(null);

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

  useEffect(() => {
    setBookmarks(loadBookmarks());
    setLastRead(loadLastRead());
    setStoreReady(true);
  }, []);

  useEffect(() => {
    if (storeReady) saveBookmarks(bookmarks);
  }, [bookmarks, storeReady]);

  useEffect(() => {
    if (storeReady) saveLastRead(lastRead);
  }, [lastRead, storeReady]);

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

  // Setelah surah tampil, gulir ke ayat tujuan (dari juz, bookmark, atau terakhir dibaca).
  useEffect(() => {
    if (!detail) return;
    const target = pendingAyahRef.current;
    if (target === null) return;
    pendingAyahRef.current = null;
    requestAnimationFrame(() => document.getElementById(`ayah-${target - 1}`)?.scrollIntoView({ block: "start" }));
  }, [detail]);

  function stopAudio() {
    audioRef.current?.pause();
    setPlayingIdx(null);
  }

  async function openSurah(number: number, startAyah?: number) {
    stopAudio();
    const request = ++requestRef.current;
    pendingAyahRef.current = startAyah && startAyah > 1 ? startAyah : null;
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
    pendingAyahRef.current = null;
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

  function toggleBookmark(meta: SurahMeta, ayah: number) {
    setBookmarks((current) =>
      current.some((b) => b.surah === meta.number && b.ayah === ayah)
        ? current.filter((b) => !(b.surah === meta.number && b.ayah === ayah))
        : [{ surah: meta.number, ayah, surahName: meta.englishName, savedAt: Date.now() }, ...current]
    );
  }

  function removeBookmark(surah: number, ayah: number) {
    setBookmarks((current) => current.filter((b) => !(b.surah === surah && b.ayah === ayah)));
  }

  function toggleLastRead(meta: SurahMeta, ayah: number) {
    setLastRead((current) =>
      current && current.surah === meta.number && current.ayah === ayah
        ? null
        : { surah: meta.number, ayah, surahName: meta.englishName, savedAt: Date.now() }
    );
  }

  const nameOf = useCallback((number: number) => list.find((s) => s.number === number)?.englishName ?? `Surah ${number}`, [list]);

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
          <ArrowLeft size={15} /> Kembali
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
              <p className="font-quran text-[30px]" dir="rtl">{meta.name}</p>
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
              <p className="mt-4 text-center font-quran text-[24px] text-forest-900" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
            )}

            <div className="mt-4 space-y-3">
              {detail.ayahs.map((ayah, index) => {
                const active = playingIdx === index;
                const marked = bookmarks.some((b) => b.surah === detail.meta.number && b.ayah === ayah.numberInSurah);
                const isLastRead = lastRead?.surah === detail.meta.number && lastRead.ayah === ayah.numberInSurah;
                const prevJuz = index > 0 ? detail.ayahs[index - 1].juz : undefined;
                const showJuz = ayah.juz !== undefined && (index === 0 || ayah.juz !== prevJuz);
                return (
                  <div key={ayah.number}>
                    {showJuz && (
                      <p className="mb-2 mt-1 text-center text-[10px] font-bold tracking-[.14em] text-[#96743a]">JUZ {ayah.juz}</p>
                    )}
                    <article
                      id={`ayah-${index}`}
                      className={`scroll-mt-4 rounded-[22px] border p-4 transition ${active ? "border-[#bcd5c4] bg-[#f3f8f4]" : "border-slate-100 bg-white"}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#edf4ef] px-2 text-[11px] font-semibold text-forest-700">{ayah.numberInSurah}</span>
                          {isLastRead && <span className="rounded-full bg-forest-700 px-2 py-0.5 text-[10px] font-semibold text-white">Terakhir dibaca</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            aria-label={isLastRead ? "Hapus tanda terakhir dibaca" : "Tandai terakhir dibaca"}
                            aria-pressed={isLastRead}
                            onClick={() => toggleLastRead(detail.meta, ayah.numberInSurah)}
                            className={`grid h-9 w-9 place-items-center rounded-full ${isLastRead ? "bg-forest-700 text-white" : "bg-forest-50 text-forest-800"}`}
                          >
                            <Flag size={15} />
                          </button>
                          <button
                            aria-label={marked ? "Hapus bookmark" : "Simpan bookmark"}
                            aria-pressed={marked}
                            onClick={() => toggleBookmark(detail.meta, ayah.numberInSurah)}
                            className={`grid h-9 w-9 place-items-center rounded-full ${marked ? "bg-[#f6f1e5] text-[#96743a]" : "bg-forest-50 text-forest-800"}`}
                          >
                            <Bookmark size={15} className={marked ? "fill-current" : ""} />
                          </button>
                          <button
                            aria-label={active ? "Jeda ayat" : "Putar ayat"}
                            onClick={() => toggleAyah(index)}
                            disabled={!ayah.audio}
                            className="grid h-9 w-9 place-items-center rounded-full bg-forest-50 text-forest-800 disabled:opacity-40"
                          >
                            {active ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                        </div>
                      </div>
                      <p className="text-right font-quran text-[26px] leading-[2] text-forest-900" dir="rtl">{ayah.arab}</p>
                      <p className="mt-3 text-[13px] leading-6 text-slate-600">{ayah.translation}</p>
                    </article>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-center text-[10px] leading-4 text-slate-400">Teks Arab, terjemahan Indonesia, dan audio dari AlQuran Cloud API.</p>
          </>
        )}
      </section>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "surah", label: "Surah" },
    { id: "juz", label: "Juz" },
    { id: "saved", label: bookmarks.length ? `Tersimpan (${bookmarks.length})` : "Tersimpan" }
  ];

  return (
    <section className="px-5 pt-2">
      <div className="mb-3">
        <p className="section-kicker">AL-QURAN</p>
        <h2 className="section-title">Baca Quran</h2>
      </div>

      {lastRead && (
        <button
          onClick={() => void openSurah(lastRead.surah, lastRead.ayah)}
          className="hero-card relative mb-4 flex w-full items-center justify-between overflow-hidden rounded-[22px] p-4 text-left text-white"
        >
          <span className="relative z-10">
            <span className="block text-[10px] font-semibold tracking-[.14em] text-emerald-50/75">LANJUTKAN MEMBACA</span>
            <span className="mt-1 block text-[15px] font-semibold">{lastRead.surahName} · ayat {lastRead.ayah}</span>
          </span>
          <Flag size={20} className="relative z-10 text-[#ead9b7]" />
        </button>
      )}

      <div className="mb-4 grid grid-cols-3 rounded-2xl bg-[#edf4ef] p-1 text-xs font-semibold">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`h-9 rounded-xl transition ${tab === item.id ? "bg-white text-forest-800 shadow-sm" : "text-slate-500"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "surah" && (
        <>
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
                <span className="font-quran text-[20px] text-forest-800" dir="rtl">{s.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "juz" && (
        <div className="grid grid-cols-2 gap-2.5">
          {JUZ_START.map((item) => (
            <button
              key={item.juz}
              onClick={() => void openSurah(item.surah, item.ayah)}
              className="rounded-[18px] border border-slate-100 bg-white p-3.5 text-left shadow-[0_5px_20px_rgba(23,54,43,.035)]"
            >
              <span className="block text-[13px] font-semibold text-forest-900">Juz {item.juz}</span>
              <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{nameOf(item.surah)} ayat {item.ayah}</span>
            </button>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="space-y-2.5">
          {bookmarks.length === 0 && (
            <p className="py-8 text-center text-xs leading-5 text-slate-400">Belum ada bookmark. Ketuk ikon bookmark pada sebuah ayat untuk menyimpannya.</p>
          )}
          {bookmarks.map((b) => (
            <div key={`${b.surah}:${b.ayah}`} className="flex items-center gap-2 rounded-[20px] border border-slate-100 bg-white p-2 pl-3.5 shadow-[0_5px_20px_rgba(23,54,43,.035)]">
              <button onClick={() => void openSurah(b.surah, b.ayah)} className="min-w-0 flex-1 py-1.5 text-left">
                <span className="block text-[13px] font-semibold text-forest-900">{b.surahName}</span>
                <span className="mt-0.5 block text-[11px] text-slate-400">Surah {b.surah} · ayat {b.ayah}</span>
              </button>
              <button
                aria-label={`Hapus bookmark ${b.surahName} ayat ${b.ayah}`}
                onClick={() => removeBookmark(b.surah, b.ayah)}
                className="grid h-10 w-10 place-items-center rounded-full text-slate-400 hover:bg-slate-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {bookmarks.length > 0 && <p className="pt-2 text-center text-[10px] leading-4 text-slate-400">Bookmark tersimpan di perangkat ini.</p>}
        </div>
      )}
    </section>
  );
}
