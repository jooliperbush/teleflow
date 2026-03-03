"use client";
import { useState, useRef } from "react";
import { Upload, FileText, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import FadeInView from "./FadeInView";

interface Service { name: string; cost: number; itcEquivalent: string; itcCost: number }
interface Analysis {
  provider: string; totalMonthly: number; currency: string;
  services: Service[]; itcTotalMonthly: number; monthlySaving: number;
  annualSaving: number; savingPercent: number;
  recommendations: string[]; redFlags: string[]; summary: string;
}

export default function InvoiceAnalyser() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => { setFile(f); setResult(null); setError(null) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }

  const analyse = async () => {
    if (!file) return
    setLoading(true); setError(null); setResult(null)
    try {
      const fd = new FormData(); fd.append('invoice', file)
      const res = await fetch('/api/analyse-invoice', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  const fmt = (n: number) => `£${n.toFixed(2)}`

  return (
    <section id="invoice-analyser" className="relative overflow-hidden text-white">
      {/* Background image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/invoice-bg.jpg" alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(8,4,25,0.92) 0%, rgba(8,4,25,0.82) 50%, rgba(8,4,25,0.88) 100%)" }} />
        {/* Top/bottom fades */}
        <div className="absolute top-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, hsl(252,92%,8%), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, hsl(252,92%,8%), transparent)" }} />
      </div>

      <div className="relative z-10 py-20 md:py-32 px-5 md:px-20">
        <div className="max-w-7xl mx-auto">
          <FadeInView>
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-5 px-4 py-2 rounded-full"
                style={{ background: "rgba(249,69,128,0.12)", border: "1px solid rgba(249,69,128,0.25)", backdropFilter: "blur(12px)" }}>
                <div className="w-2 h-2 rounded-full bg-[#f94580] animate-pulse" />
                Free Instant Analysis
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6"
                style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                Upload Your <br />
                <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 16px rgba(249,69,128,0.5))" }}>
                  Current Bill
                </span>
              </h2>
              <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto">
                See exactly what you're overpaying — and what ITC would charge instead. Takes 30 seconds.
              </p>
            </div>
          </FadeInView>

          <div className="max-w-2xl mx-auto">
            {!result ? (
              <FadeInView delay={0.1}>
                {/* Drop zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className="border-2 border-dashed rounded-[2rem] p-10 md:p-14 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: dragging ? "#591bff" : file ? "#f94580" : "rgba(255,255,255,0.2)",
                    background: dragging ? "rgba(89,27,255,0.1)" : file ? "rgba(249,69,128,0.08)" : "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)"
                  }}>
                  <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(249,69,128,0.15)", border: "1px solid rgba(249,69,128,0.3)" }}>
                        <FileText className="w-8 h-8 text-[#f94580]" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">{file.name}</p>
                        <p className="text-sm text-white/40">{(file.size / 1024).toFixed(0)}KB</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                        className="text-xs text-white/30 hover:text-white flex items-center gap-1 transition-colors">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(89,27,255,0.15)", border: "1px solid rgba(89,27,255,0.3)" }}>
                        <Upload className="w-8 h-8 text-[#7be7ff]" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">Drop your invoice here</p>
                        <p className="text-sm text-white/40 mt-1">PDF or image · Max 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-4 rounded-xl text-sm flex items-center gap-2"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <button onClick={analyse} disabled={!file || loading}
                  className="mt-5 w-full py-4 md:py-5 rounded-full font-bold text-base md:text-lg text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 30px rgba(249,69,128,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing your invoice...</> : <>Analyse My Bill <ArrowRight className="w-5 h-5" /></>}
                </button>
                <p className="text-center text-xs text-white/25 mt-3">Your invoice is analysed privately and never stored.</p>
              </FadeInView>
            ) : (
              <FadeInView>
                <div className="space-y-4 md:space-y-5">
                  {/* Saving headline */}
                  <div className="rounded-[2rem] p-7 md:p-8 text-white text-center"
                    style={{ background: "linear-gradient(135deg, #f94580, #591bff)", boxShadow: "0 0 40px rgba(249,69,128,0.3)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Your Potential Saving</p>
                    <p className="text-5xl md:text-6xl font-black mb-1" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                      {fmt(result.monthlySaving)}<span className="text-xl md:text-2xl">/mo</span>
                    </p>
                    <p className="text-base md:text-xl opacity-80">{fmt(result.annualSaving)} per year · {result.savingPercent}% less</p>
                    <p className="mt-3 opacity-60 text-sm">{result.summary}</p>
                  </div>

                  {/* Cost comparison */}
                  <div className="rounded-[2rem] p-6 md:p-8"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)" }}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="text-center">
                        <p className="text-xs text-white/40 mb-1">Currently paying</p>
                        <p className="text-2xl md:text-3xl font-black text-white">{fmt(result.totalMonthly)}</p>
                        <p className="text-xs text-white/30">{result.provider}/mo</p>
                      </div>
                      <TrendingDown className="w-7 h-7 text-[#f94580]" />
                      <div className="text-center">
                        <p className="text-xs text-white/40 mb-1">With ITC</p>
                        <p className="text-2xl md:text-3xl font-black text-[#7be7ff]">{fmt(result.itcTotalMonthly)}</p>
                        <p className="text-xs text-white/30">per month</p>
                      </div>
                    </div>
                    {result.services.length > 0 && (
                      <div className="space-y-2 mt-4 border-t border-white/10 pt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Services Detected</p>
                        {result.services.map((s, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/8 last:border-0">
                            <div>
                              <p className="font-medium text-sm text-white">{s.name}</p>
                              <p className="text-xs text-[#7be7ff]">→ {s.itcEquivalent}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm line-through text-white/30">{fmt(s.cost)}</p>
                              <p className="text-sm font-bold text-[#7be7ff]">{fmt(s.itcCost)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {result.recommendations.length > 0 && (
                    <div className="rounded-[2rem] p-6 md:p-8"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Recommendations</p>
                      <div className="space-y-3">
                        {result.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
                            <p className="text-sm text-white/75">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.redFlags.length > 0 && (
                    <div className="rounded-[2rem] p-6 md:p-8"
                      style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", backdropFilter: "blur(20px)" }}>
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">Watch Out</p>
                      <div className="space-y-3">
                        {result.redFlags.map((f, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-200">{f}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/order"
                      className="flex-1 py-4 md:py-5 rounded-full font-bold text-base md:text-lg text-white text-center hover:scale-[1.02] transition-transform"
                      style={{ background: "linear-gradient(135deg, #f94580, #591bff)", boxShadow: "0 0 24px rgba(249,69,128,0.3)" }}>
                      Start Saving with ITC →
                    </Link>
                    <button onClick={() => { setResult(null); setFile(null) }}
                      className="px-6 py-4 md:py-5 rounded-full font-bold text-base text-white/70 transition-colors hover:text-white"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      Analyse Another
                    </button>
                  </div>
                </div>
              </FadeInView>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
