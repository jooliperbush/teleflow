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
    <section id="invoice-analyser" className="relative overflow-hidden py-20 md:py-32 px-5 md:px-20">
      {/* Background image — light, optimised */}
      <div className="absolute inset-0 z-0">
        <img
          src="/invoice-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
        {/* Very subtle white wash to soften image under content */}
        <div className="absolute inset-0" style={{ background: "rgba(240,238,255,0.45)" }} />
        {/* Edge fades to blend with dark sections */}
        <div className="absolute top-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, hsl(252,92%,8%), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, hsl(252,92%,8%), transparent)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <FadeInView>
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-5 px-4 py-2 rounded-full"
              style={{ background: "rgba(249,69,128,0.12)", border: "1px solid rgba(249,69,128,0.3)", backdropFilter: "blur(12px)" }}>
              <div className="w-2 h-2 rounded-full bg-[#f94580] animate-pulse" />
              Free Instant Analysis
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 text-gray-900"
              style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Upload Your <br />
              <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Current Bill
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
              See exactly what you're overpaying — and what ITC would charge instead. Takes 30 seconds.
            </p>
          </div>
        </FadeInView>

        <div className="max-w-2xl mx-auto">
          {!result ? (
            <FadeInView delay={0.1}>
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-[2rem] p-10 md:p-14 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? "#591bff" : file ? "#f94580" : "rgba(89,27,255,0.25)",
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  boxShadow: "0 8px 48px rgba(89,27,255,0.1), inset 0 1px 0 rgba(255,255,255,0.9)"
                }}>
                <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                {file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(249,69,128,0.1)", border: "1px solid rgba(249,69,128,0.2)" }}>
                      <FileText className="w-8 h-8 text-[#f94580]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(0)}KB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(89,27,255,0.08)", border: "1px solid rgba(89,27,255,0.15)" }}>
                      <Upload className="w-8 h-8 text-[#591bff]" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">Drop your invoice here</p>
                      <p className="text-sm text-gray-400 mt-1">PDF or image · Max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <button onClick={analyse} disabled={!file || loading}
                className="mt-5 w-full py-4 md:py-5 rounded-full font-bold text-base md:text-lg text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 30px rgba(89,27,255,0.25), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing...</> : <>Analyse My Bill <ArrowRight className="w-5 h-5" /></>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Your invoice is analysed privately and never stored.</p>
            </FadeInView>
          ) : (
            <FadeInView>
              <div className="rounded-[2rem] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", boxShadow: "0 8px 48px rgba(89,27,255,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                {/* Saving banner */}
                <div className="p-6 md:p-8 text-white text-center"
                  style={{ background: "linear-gradient(135deg, #f94580, #591bff)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Your Potential Saving</p>
                  <p className="text-5xl font-black mb-1" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                    {fmt(result.monthlySaving)}<span className="text-xl">/mo</span>
                  </p>
                  <p className="text-base opacity-80">{fmt(result.annualSaving)}/yr · {result.savingPercent}% less</p>
                  <p className="mt-2 opacity-60 text-sm">{result.summary}</p>
                </div>

                <div className="p-6 md:p-8 space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Currently paying</p>
                      <p className="text-2xl font-black text-gray-900">{fmt(result.totalMonthly)}</p>
                      <p className="text-xs text-gray-400">{result.provider}/mo</p>
                    </div>
                    <TrendingDown className="w-7 h-7 text-[#f94580]" />
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">With ITC</p>
                      <p className="text-2xl font-black text-[#591bff]">{fmt(result.itcTotalMonthly)}</p>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>
                  </div>

                  {result.services.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Services</p>
                      {result.services.map((s, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s.name}</p>
                            <p className="text-xs text-[#591bff]">→ {s.itcEquivalent}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm line-through text-gray-300">{fmt(s.cost)}</p>
                            <p className="text-sm font-bold text-[#591bff]">{fmt(s.itcCost)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Recommendations</p>
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#591bff] shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600">{r}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/order"
                      className="flex-1 py-4 rounded-full font-bold text-base text-white text-center hover:scale-[1.02] transition-transform"
                      style={{ background: "linear-gradient(135deg, #f94580, #591bff)" }}>
                      Start Saving with ITC →
                    </Link>
                    <button onClick={() => { setResult(null); setFile(null) }}
                      className="px-6 py-4 rounded-full font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                      Analyse Another
                    </button>
                  </div>
                </div>
              </div>
            </FadeInView>
          )}
        </div>
      </div>
    </section>
  )
}
