export type Prayer = { name: string; time: string; label: string };
export type PrayerApiResponse = {
  data?: {
    timings?: Record<string, string>;
    date?: { readable?: string; hijri?: { date?: string; month?: { en?: string }; year?: string } };
  };
};

const prayerKeys = [
  ["Imsak", "Imsak"], ["Fajr", "Subuh"], ["Sunrise", "Terbit"],
  ["Dhuhr", "Dzuhur"], ["Asr", "Ashar"], ["Maghrib", "Maghrib"], ["Isha", "Isya"]
] as const;

export async function getPrayerTimes(latitude: number, longitude: number): Promise<Prayer[]> {
  const method = process.env.NEXT_PUBLIC_PRAYER_METHOD || "20";
  const url = new URL("https://api.aladhan.com/v1/timings");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("method", method);
  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) throw new Error("Jadwal sholat tidak dapat dimuat.");
  const json = (await response.json()) as PrayerApiResponse;
  const timings = json.data?.timings;
  if (!timings) throw new Error("Data jadwal sholat tidak tersedia.");
  return prayerKeys
    .filter(([key]) => key !== "Imsak" && key !== "Sunrise")
    .map(([key, label]) => ({ name: key, label, time: (timings[key] || "").slice(0, 5) }))
    .filter((item) => /^\d{2}:\d{2}$/.test(item.time));
}

export function getNextPrayer(prayers: Prayer[], now = new Date()) {
  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    if (target.getTime() > now.getTime()) {
      return { ...prayer, remainingMinutes: (target.getTime() - now.getTime()) / 60000 };
    }
  }
  if (prayers.length) {
    const first = prayers[0];
    const [hours, minutes] = first.time.split(":").map(Number);
    const target = new Date(now);
    target.setDate(target.getDate() + 1);
    target.setHours(hours, minutes, 0, 0);
    return { ...first, remainingMinutes: (target.getTime() - now.getTime()) / 60000 };
  }
  return null;
}

export function formatCountdown(totalMinutes: number) {
  const totalSeconds = Math.max(0, Math.ceil(totalMinutes * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}