"use client";

import { useEffect, useMemo, useState } from "react";
import { LocateFixed, MapPin, RefreshCw } from "lucide-react";
import { formatCountdown, getNextPrayer, getPrayerTimes, type Prayer } from "@/lib/prayer";

type LocationState = { latitude: number; longitude: number };

export default function PrayerSchedule() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  async function loadForLocation(coords?: LocationState) {
    setError("");
    setLoading(true);
    try {
      let chosen = coords ?? location;
      if (!chosen) {
        if (!navigator.geolocation) throw new Error("Browser tidak mendukung akses lokasi.");
        chosen = await new Promise<LocationState>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            () => reject(new Error("Izin lokasi belum diberikan. Aktifkan lokasi atau coba lagi.")),
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
          );
        });
      }
      setLocation(chosen);
      const result = await getPrayerTimes(chosen.latitude, chosen.longitude);
      setPrayers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    // Ask for location only after the user taps the location button.
  }, []);

  const nextPrayer = useMemo(() => getNextPrayer(prayers, now), [prayers, now]);
  const countdown = nextPrayer ? formatCountdown(nextPrayer.remainingMinutes) : "--:--:--";

  return (
    <div className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div><h2 className="font-bold text-forest-900">Waktu sholat</h2><p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400"><MapPin size={12}/>{location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : "Aktifkan lokasi untuk jadwal akurat"}</p></div>
        <button onClick={() => loadForLocation()} disabled={loading} className="flex h-10 items-center gap-1.5 rounded-xl bg-forest-50 px-3 text-xs font-semibold text-forest-800 disabled:opacity-50">
          {loading ? <RefreshCw size={14} className="animate-spin"/> : <LocateFixed size={14}/>} {loading ? "Memuat" : "Lokasi"}
        </button>
      </div>

      {nextPrayer && <div className="mt-4 rounded-2xl bg-forest-900 p-4 text-white">
        <p className="text-xs text-emerald-100/70">Menuju waktu {nextPrayer.label}</p>
        <div className="mt-1 flex items-end justify-between"><p className="text-3xl font-semibold tracking-wider tabular-nums">{countdown}</p><p className="pb-1 text-sm text-sand-300">{nextPrayer.time}</p></div>
      </div>}

      {error && <div role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">{error}</div>}
      {!prayers.length && !error && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Jadwal sholat akan ditampilkan setelah kamu mengizinkan akses lokasi.</div>}

      {!!prayers.length && <div className="mt-4 grid grid-cols-5 gap-2">
        {prayers.map((prayer) => {
          const isNext = nextPrayer?.name === prayer.name;
          return <div key={prayer.name} className={`rounded-xl px-1 py-3 text-center ${isNext ? "bg-sand-100" : "bg-slate-50"}`}>
            <p className={`text-[10px] ${isNext ? "font-bold text-forest-800" : "text-slate-400"}`}>{prayer.label}</p>
            <p className={`mt-1 text-xs font-bold tabular-nums ${isNext ? "text-forest-900" : "text-slate-700"}`}>{prayer.time}</p>
          </div>;
        })}
      </div>}
      <p className="mt-3 text-[10px] leading-4 text-slate-400">Jadwal dihitung berdasarkan koordinat dan metode perhitungan yang dipilih. Cocokkan dengan ketetapan masjid atau otoritas setempat.</p>
    </div>
  );
}
