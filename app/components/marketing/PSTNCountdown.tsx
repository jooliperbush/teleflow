"use client";
import { useState, useEffect } from "react";

const SWITCHOFF = new Date("2027-01-31T00:00:00Z");

function getTimeLeft() {
  const diff = SWITCHOFF.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export default function PSTNCountdown() {
  const [t, setT] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (val: number, label: string) => (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="font-black tabular-nums">{val}</span>
      <span className="text-[10px] opacity-70 ml-0.5">{label}</span>
    </span>
  );

  return (
    <div className="w-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-white"
      style={{ background: "linear-gradient(90deg, #591bff 0%, #f94580 100%)" }}>
      <span className="hidden sm:inline opacity-90">⚠️ PSTN Switch-Off:</span>
      <span className="opacity-90 sm:hidden">⚠️ PSTN:</span>
      <span className="flex items-baseline gap-2">
        {unit(t.days, "days")}
        <span className="opacity-50">:</span>
        {unit(t.hours, "hrs")}
        <span className="opacity-50">:</span>
        {unit(t.minutes, "min")}
        <span className="opacity-50">:</span>
        {unit(t.seconds, "sec")}
      </span>
      <span className="hidden sm:inline opacity-75 text-[11px]">— Is your business ready?</span>
      <a href="#contact" className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap">
        Get Ready →
      </a>
    </div>
  );
}
