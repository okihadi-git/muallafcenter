"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Info, RotateCcw } from "lucide-react";

type Task = { id: string; name: string; group: "fardhu" | "sunnah"; rakaat?: string; note?: string };

const TASKS: Task[] = [
  { id: "subuh", name: "Subuh", group: "fardhu" },
  { id: "dzuhur", name: "Dzuhur", group: "fardhu" },
  { id: "ashar", name: "Ashar", group: "fardhu" },
  { id: "maghrib", name: "Maghrib", group: "fardhu" },
  { id: "isya", name: "Isya", group: "fardhu" },
  { id: "qobliyah-subuh", name: "Qobliyah Subuh", group: "sunnah", rakaat: "2 rakaat" },
  {
    id: "dhuha",
    name: "Dhuha",
    group: "sunnah",
    rakaat: "2-12 rakaat",
    note: "Dikerjakan 2 rakaat salam, boleh diulang sampai 12 rakaat. Salam setiap 2 rakaat."
  },
  {
    id: "qobliyah-dzuhur",
    name: "Qobliyah Dzuhur",
    group: "sunnah",
    rakaat: "2-4 rakaat",
    note: "Kalau memilih 4 rakaat, salam setiap 2 rakaat (2 + 2), bukan 4 rakaat sekaligus."
  },
  { id: "badiyah-dzuhur", name: "Ba'diyah Dzuhur", group: "sunnah", rakaat: "2 rakaat" },
  { id: "badiyah-maghrib", name: "Ba'diyah Maghrib", group: "sunnah", rakaat: "2 rakaat" },
  { id: "badiyah-isya", name: "Ba'diyah Isya", group: "sunnah", rakaat: "2 rakaat" },
  {
    id: "tahajud",
    name: "Tahajud",
    group: "sunnah",
    rakaat: "2-8 rakaat",
    note: "Dikerjakan setelah tidur malam. Salam setiap 2 rakaat."
  },
  {
    id: "witir",
    name: "Witir",
    group: "sunnah",
    rakaat: "3 rakaat",
    note: "Ada dua cara: 2 rakaat salam, lalu 1 rakaat salam; atau 3 rakaat sekaligus dengan satu tahiyat di akhir (tanpa tahiyat awal)."
  }
];

type TrackerState = Record<string, boolean>;
const STORAGE_KEY = "hijrahapp-worship-v1";
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function PrayerTracker() {
  const [completed, setCompleted] = useState<TrackerState>({});
  const [ready, setReady] = useState(false);
  const [dateKey, setDateKey] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [infoId, setInfoId] = useState<string | null>(null);

  useEffect(() => {
    const key = todayKey();
    setDateKey(key);
    setDateLabel(new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date()));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as { date: string; completed: TrackerState }) : null;
      if (saved?.date === key) setCompleted(saved.completed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && dateKey) localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: dateKey, completed }));
  }, [completed, dateKey, ready]);

  const fardhu = useMemo(() => TASKS.filter((task) => task.group === "fardhu"), []);
  const sunnah = useMemo(() => TASKS.filter((task) => task.group === "sunnah"), []);
  const fardhuDone = fardhu.filter((task) => completed[task.id]).length;
  const sunnahDone = sunnah.filter((task) => completed[task.id]).length;
  const info = sunnah.find((task) => task.id === infoId);

  function toggle(id: string) {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
  }
  function reset() {
    if (window.confirm("Reset catatan ibadah hari ini?")) setCompleted({});
  }

  return (
    <div className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Catatan pribadi · {dateLabel || "hari ini"}</p>
        <button onClick={reset} aria-label="Reset tracker" className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-50"><RotateCcw size={15} /></button>
      </div>

      <div className="mt-2 rounded-2xl bg-forest-50 p-3">
        <div className="grid grid-cols-2 gap-4">
          <Progress label="Sholat wajib" done={fardhuDone} total={fardhu.length} barClass="bg-forest-600" />
          <Progress label="Sholat sunnah" done={sunnahDone} total={sunnah.length} barClass="bg-sand-500" />
        </div>
        <p className="mt-2 text-[11px] text-forest-700">
          {fardhuDone === fardhu.length ? "Alhamdulillah, semua sholat wajib sudah dicatat." : "Lakukan sesuai kemampuan dan terus bangun kebiasaan baik."}
        </p>
      </div>

      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Sholat fardhu</p>
      <div className="grid grid-cols-5 gap-1.5">
        {fardhu.map((task) => {
          const checked = !!completed[task.id];
          return (
            <button
              key={task.id}
              onClick={() => toggle(task.id)}
              aria-pressed={checked}
              className={`flex h-12 flex-col items-center justify-center rounded-xl border text-[11px] font-semibold transition ${checked ? "border-forest-700 bg-forest-700 text-white" : "border-slate-100 bg-white text-slate-700"}`}
            >
              {checked && <Check size={12} className="mb-0.5" />}
              {task.name}
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Sholat sunnah</p>
      <div className="grid grid-cols-2 gap-1.5">
        {sunnah.map((task) => {
          const checked = !!completed[task.id];
          return (
            <div key={task.id} className="relative">
              <button
                onClick={() => toggle(task.id)}
                aria-pressed={checked}
                className={`flex min-h-[52px] w-full flex-col justify-center rounded-xl border px-3 py-1.5 text-left transition ${task.note ? "pr-8" : ""} ${checked ? "border-forest-700 bg-forest-700 text-white" : "border-slate-100 bg-white text-slate-700"}`}
              >
                <span className="flex items-center gap-1 text-[12px] font-semibold leading-tight">
                  {checked && <Check size={12} className="shrink-0" />}
                  {task.name}
                </span>
                <span className={`mt-0.5 text-[10px] ${checked ? "text-emerald-50/80" : "text-slate-400"}`}>{task.rakaat}</span>
              </button>
              {task.note && (
                <button
                  onClick={() => setInfoId((current) => (current === task.id ? null : task.id))}
                  aria-label={`Tata cara ${task.name}`}
                  aria-expanded={infoId === task.id}
                  className={`absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full ${checked ? "text-white/80" : "text-slate-400"} ${infoId === task.id ? "bg-black/10" : ""}`}
                >
                  <Info size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 rounded-xl border border-[#eee9dc] bg-[#fffaf0] p-3 text-[11px] leading-5 text-[#7a6330]">
        {info ? (
          <>
            <span className="font-semibold">{info.name}: </span>
            {info.note}
          </>
        ) : (
          "Ketuk ikon info pada Dhuha, Qobliyah Dzuhur, Tahajud, atau Witir untuk melihat tata cara salamnya."
        )}
      </div>

      <p className="mt-3 text-[10px] leading-4 text-slate-400">Catatan tersimpan di perangkat ini. Tracker adalah alat bantu kebiasaan, bukan penilaian kualitas ibadah.</p>
    </div>
  );
}

function Progress({ label, done, total, barClass }: { label: string; done: number; total: number; barClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-forest-800">{label}</span>
        <span className="font-bold text-forest-800">{done}/{total}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-forest-100">
        <div className={`h-full rounded-full transition-all ${barClass}`} style={{ width: `${Math.round((done / total) * 100)}%` }} />
      </div>
    </div>
  );
}
