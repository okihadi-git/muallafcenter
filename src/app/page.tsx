"use client";

import { useState } from "react";
import {
  ArrowRight, BookOpen, CalendarDays, Check, Compass, Heart, Home,
  MoonStar, Plus, Sparkles, UserRound
} from "lucide-react";
import PrayerSchedule from "@/components/PrayerSchedule";
import PrayerTracker from "@/components/PrayerTracker";
import QuranView from "@/components/QuranView";

const nav = [
  { label: "Beranda", icon: Home },
  { label: "Quran", icon: BookOpen },
  { label: "Ibadah", icon: Plus },
  { label: "Kiblat", icon: Compass },
  { label: "Profil", icon: UserRound }
];

export default function HomePage() {
  const [active, setActive] = useState("Beranda");
  const now = new Date();
  const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  const hijri = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(now);

  return (
    <main className="app-shell mx-auto min-h-screen max-w-md pb-32 shadow-[0_0_60px_rgba(23,54,43,.06)]">
      <header className="flex items-center justify-between px-5 pb-5 pt-7">
        <div className="flex items-center gap-3">
          <div className="brand-mark grid h-11 w-11 place-items-center rounded-[17px] text-white"><MoonStar size={22} strokeWidth={1.8}/></div>
          <div>
            <p className="text-[18px] font-bold tracking-[-.04em] text-forest-900">HijrahApp<span className="text-sand-500">.</span></p>
            <p className="mt-0.5 text-[11px] tracking-wide text-slate-400">TEMAN PERJALANAN IMANMU</p>
          </div>
        </div>
        <button aria-label="Pengingat" className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-sm">
          <CalendarDays size={18} strokeWidth={1.8}/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sand-500 ring-2 ring-white"/>
        </button>
      </header>

      {active === "Quran" ? (
        <QuranView />
      ) : (
        <>
      <section className="px-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[13px] font-medium text-slate-500">Assalamu’alaikum,</p>
            <h1 className="mt-1 text-[25px] font-semibold leading-tight tracking-[-.045em] text-forest-900">Selamat datang kembali.</h1>
          </div>
          <div className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-[#edf4ef] text-forest-700"><Heart size={18} strokeWidth={1.8}/></div>
        </div>
        <div className="rounded-2xl border border-[#e9eee9] bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-500">{today}</p>
          <p className="mt-1 text-[12px] font-semibold text-forest-700">{hijri} H</p>
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="hero-card relative overflow-hidden rounded-[26px] p-5 text-white">
          <div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium tracking-wide text-emerald-50"><Sparkles size={12}/> LANGKAH KECIL, ARTI BESAR</div>
            <h2 className="mt-5 max-w-[265px] text-[26px] font-semibold leading-[1.2] tracking-[-.04em]">Bertumbuh dalam iman, satu hari demi satu hari.</h2>
            <p className="mt-2 max-w-[250px] text-[12px] leading-5 text-emerald-50/75">Tak perlu terburu-buru. Setiap langkah baik tetap berarti.</p>
            <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-[#ead9b7]"><Heart size={13}/> Jalani prosesmu dengan tenang.</div>
          </div>
          <MoonStar className="absolute -bottom-5 -right-3 text-white/[.07]" size={142} strokeWidth={1}/>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div><p className="section-kicker">JADWAL HARIAN</p><h2 className="section-title">Waktu sholat</h2></div>
          <span className="rounded-full bg-[#edf4ef] px-3 py-1.5 text-[10px] font-semibold text-forest-700">Hari ini</span>
        </div>
        <PrayerSchedule />
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div><p className="section-kicker">INSPIRASI HARI INI</p><h2 className="section-title">Ayat pengingat</h2></div>
          <BookOpen size={18} className="text-forest-700" strokeWidth={1.7}/>
        </div>
        <div className="rounded-[22px] border border-[#eee9dc] bg-[#fffefa] p-4 shadow-[0_5px_20px_rgba(65,54,30,.035)]">
          <div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-[#f6f1e5] px-2.5 py-1 text-[10px] font-semibold text-[#96743a]">PENGUAT HATI</span><span className="text-[10px] text-slate-400">QS. Al-Insyirah: 5</span></div>
          <p className="text-right font-quran text-[27px] leading-[1.9] text-forest-900" dir="rtl">فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
          <p className="mt-3 text-[13px] font-semibold leading-6 text-forest-900">“Maka sesungguhnya bersama kesulitan ada kemudahan.”</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">Pengingat bahwa selalu ada harapan di setiap proses.</p>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between"><div><p className="section-kicker">TUMBUH PERLAHAN</p><h2 className="section-title">Target ibadah</h2></div><span className="text-[11px] text-slate-400">Tanpa tekanan</span></div>
        <PrayerTracker />
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3"><p className="section-kicker">MULAI DARI DASAR</p><h2 className="section-title">Belajar Islam</h2></div>
        <button onClick={() => setActive("Belajar Islam")} className="flex w-full items-center gap-3 rounded-[22px] border border-slate-100 bg-white p-4 text-left shadow-[0_5px_20px_rgba(23,54,43,.035)]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf4ef] text-forest-700"><BookOpen size={21} strokeWidth={1.7}/></div>
          <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-forest-900">Panduan dasar untuk pemula</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Kenali wudhu, sholat, dan dasar-dasar Islam.</p></div>
          <ArrowRight size={17} className="shrink-0 text-slate-400"/>
        </button>
      </section>
        </>
      )}

      <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-end justify-around border-t border-slate-100/90 bg-white/95 px-3 pt-2.5 shadow-[0_-8px_30px_rgba(20,45,35,.045)] backdrop-blur-xl">
        {nav.map(({ label, icon: Icon }) => {
          const selected = active === label;
          const isCenter = label === "Ibadah";
          return <button key={label} onClick={() => setActive(label)} className={`relative flex min-w-[55px] flex-col items-center gap-1 px-2 pb-1.5 text-[10px] transition ${selected ? "font-semibold text-forest-800" : "text-slate-400"}`} aria-current={selected ? "page" : undefined}>
            <span className={`${isCenter ? "-mt-6 grid h-12 w-12 place-items-center rounded-[18px] bg-forest-800 text-white shadow-[0_7px_18px_rgba(16,56,46,.25)]" : `grid h-8 w-9 place-items-center rounded-xl ${selected ? "bg-[#edf4ef]" : ""}`}`}><Icon size={isCenter ? 22 : 19} strokeWidth={isCenter ? 2 : 1.8}/></span>{label}
          </button>;
        })}
      </nav>
    </main>
  );
}
