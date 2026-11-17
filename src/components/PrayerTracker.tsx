"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";

const TASKS = [
  { id: "subuh", name: "Subuh", time: "Fardhu" },
  { id: "dzuhur", name: "Dzuhur", time: "Fardhu" },
  { id: "ashar", name: "Ashar", time: "Fardhu" },
  { id: "maghrib", name: "Maghrib", time: "Fardhu" },
  { id: "isya", name: "Isya", time: "Fardhu" },
  { id: "dhuha", name: "Dhuha", time: "Sunnah" },
  { id: "rawatib", name: "Rawatib", time: "Sunnah" },
  { id: "tahajud", name: "Tahajud", time: "Sunnah" }
] as const;

type TrackerState = Record<string, boolean>;
const STORAGE_KEY = "hijrahapp-worship-v1";
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function PrayerTracker() {
  const [completed, setCompleted] = useState<TrackerState>({});
  const [ready, setReady] = useState(false);
  const [dateKey, setDateKey] = useState(todayKey());

  useEffect(() => {
    setDateKey(todayKey());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) as { date: string; completed: TrackerState } : null;
      if (saved?.date === todayKey()) setCompleted(saved.completed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: dateKey, completed }));
  }, [completed, dateKey, ready]);

  const fardhu = TASKS.filter((task) => task.time === "Fardhu");
  const sunnah = TASKS.filter((task) => task.time === "Sunnah");
  const doneCount = useMemo(() => fardhu.filter((task) => completed[task.id]).length, [completed]);
  const progress = Math.round((doneCount / fardhu.length) * 100);

  function toggle(id: string) {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
  }
  function reset() {
    if (window.confirm("Reset catatan ibadah hari ini?")) setCompleted({});
  }

  return (
    <div className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <div><h2 className="font-bold text-forest-900">Target ibadah</h2><p className="mt-0.5 text-xs text-slate-400">Catatan pribadi · {dateKey}</p></div>
        <button onClick={reset} aria-label="Reset tracker" className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50"><RotateCcw size={15}/></button>
      </div>

      <div className="mt-4 rounded-2xl bg-forest-50 p-3">
        <div className="flex items-center justify-between text-xs"><span className="font-semibold text-forest-800">Sholat wajib</span><span className="font-bold text-forest-800">{doneCount}/{fardhu.length}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-100"><div className="h-full rounded-full bg-forest-600 transition-all" style={{ width: `${progress}%` }}/></div>
        <p className="mt-2 text-[11px] text-forest-700">{progress === 100 ? "Alhamdulillah, semua target wajib sudah dicatat." : "Lakukan sesuai kemampuan dan terus bangun kebiasaan baik."}</p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sholat fardhu</p>
        <div className="space-y-2">{fardhu.map((task) => <TaskRow key={task.id} name={task.name} checked={!!completed[task.id]} onToggle={() => toggle(task.id)}/>)}</div>
      </div>
      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sholat sunnah</p>
        <div className="space-y-2">{sunnah.map((task) => <TaskRow key={task.id} name={task.name} checked={!!completed[task.id]} onToggle={() => toggle(task.id)} />)}</div>
      </div>
      <p className="mt-4 text-[10px] leading-4 text-slate-400">Catatan tersimpan di perangkat ini. Tracker adalah alat bantu kebiasaan, bukan penilaian kualitas ibadah.</p>
    </div>
  );
}

function TaskRow({ name, checked, onToggle }: { name: string; checked: boolean; onToggle: () => void }) {
  return <button onClick={onToggle} aria-pressed={checked} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-100 px-3 text-left transition hover:bg-slate-50">
    <span className={`text-sm ${checked ? "text-slate-400 line-through" : "font-medium text-slate-700"}`}>{name}</span>
    <span className={`grid h-6 w-6 place-items-center rounded-full border ${checked ? "border-forest-700 bg-forest-700 text-white" : "border-slate-300 text-transparent"}`}><Check size={14}/></span>
  </button>;
}