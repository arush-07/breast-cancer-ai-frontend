"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Activity, ShieldAlert, FileSearch, Loader2, CheckCircle2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Clean up the memory URL when the component unmounts or file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860";
      const res = await fetch(`${baseUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Connection failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend offline. Ensure uvicorn is running on port 7860.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="w-6 h-6 text-blue-400" /></div>
            <h1 className="text-3xl font-bold tracking-tight">Breast Cancer AI <span className="text-blue-500 text-xs font-mono border border-blue-500/30 px-2 rounded ml-2">HYBRID_V42</span></h1>
          </motion.div>
          <p className="text-slate-400 text-sm">Diagnostic Neural Network: ResNet50 + 42-Feature Radiomics Fusion.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Control Panel (4 Columns) */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Input Selection</h2>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'}`}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Upload className={`w-8 h-8 mx-auto mb-3 ${file ? 'text-blue-400' : 'text-slate-600'}`} />
                <p className="text-sm font-medium">{file ? file.name : "Upload Mammogram Scan"}</p>
              </div>

              {/* Small Preview Thumbnail in Sidebar */}
              {previewUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-lg overflow-hidden border border-slate-800 h-32 w-full relative">
                  <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                </motion.div>
              )}

              <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Textures...</> : "Run AI Inference"}
              </button>
            </div>
          </section>

          {/* Right: Results & Main View (8 Columns) */}
          <section className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid md:grid-cols-2 gap-6 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 overflow-hidden">
                  
                  {/* The Uploaded Image Section */}
                  <div className="relative group rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 min-h-[400px]">
                    <img src={previewUrl} alt="Mammogram Scan" className="max-w-full max-h-full object-contain" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Source Scan</span>
                    </div>
                  </div>

                  {/* The Results Section */}
                  <div className="flex flex-col justify-center">
                    {result ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Score</p>
                            <p className={`text-6xl font-black tracking-tighter ${result.risk_score > 30 ? 'text-red-500' : 'text-emerald-400'}`}>
                              {result.risk_score}%
                            </p>
                          </div>
                          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-center">
                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">BI-RADS</p>
                            <p className="text-2xl font-bold">Cat {result.bi_rads}</p>
                          </div>
                        </div>

                        <div className={`p-5 rounded-2xl border flex gap-4 ${result.risk_score > 30 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                          <ShieldAlert className={`w-6 h-6 shrink-0 ${result.risk_score > 30 ? 'text-red-400' : 'text-emerald-400'}`} />
                          <div>
                            <p className="font-bold leading-tight">{result.verdict}</p>
                            <p className="text-sm text-slate-400 mt-1">{result.recommendation}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                          <p className="text-[10px] font-bold text-slate-600 uppercase mb-3">Model Parameters</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-800/50 p-2 rounded">Backbone: ResNet50</div>
                            <div className="bg-slate-800/50 p-2 rounded">Radiomics: 42-F</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Processing scan metadata...</p>
                        <p className="text-xs text-slate-600 mt-1 italic">Computing PyRadiomics texture vectors</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[450px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 bg-slate-900/10">
                  <FileSearch className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-lg font-medium opacity-40">Ready for scan ingestion</p>
                  <p className="text-sm opacity-20 mt-1">Upload a mammogram to begin automated diagnosis</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}