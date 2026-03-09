"use client";

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  BrainCircuit,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the AI Response
interface PredictionResult {
  prediction: string;
  probability: number;
  status: string;
  error?: string;
}

export default function OncoVision() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null); // Reset previous results
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Points to your Hugging Face Direct URL set in Vercel Env Vars
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API Connection Failed");

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Could not connect to the AI Engine. Please check if Hugging Face Space is 'Running'.");
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(2,6,23,1))]" />
      
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4"
          >
            <BrainCircuit className="w-10 h-10 text-blue-400" />
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
            OncoVision AI
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Hybrid Multi-Task Learning for Breast Cancer Detection using ResNet50 and 42-Feature Radiomics Fusion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Upload Section */}
          <section className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all
                ${preview ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/50'}`}
            >
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
              
              {preview ? (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl">
                  <img src={preview} alt="Mammogram Preview" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                </div>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <div className="p-5 bg-slate-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-300 font-medium">Click to upload Mammogram</p>
                  <p className="text-slate-500 text-sm mt-1">DICOM, PNG or JPG (Max 10MB)</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                {loading ? "Analyzing Scan..." : "Run AI Inference"}
              </button>
              
              {file && (
                <button onClick={resetSelection} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors">
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
          </section>

          {/* Results Section */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm min-h-[400px] flex flex-col">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-8">
              <FileText className="w-5 h-5 text-blue-400" />
              Analysis Report
            </h2>

            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                  <ShieldAlert className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-slate-500">Upload a scan and click analyze to generate a diagnosis report.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-blue-400 font-medium">Extracting 42 Radiomics Features</p>
                    <p className="text-slate-500 text-sm">Processing through Hybrid ResNet50 Backbone...</p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-8"
                >
                  <div className={`p-6 rounded-2xl border ${result.prediction === 'Malignant' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium uppercase tracking-wider text-slate-400">Diagnosis</span>
                      {result.prediction === 'Malignant' ? <AlertCircle className="text-red-400" /> : <CheckCircle className="text-emerald-400" />}
                    </div>
                    <p className={`text-3xl font-bold ${result.prediction === 'Malignant' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.prediction}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Confidence Score</span>
                      <span className="font-mono text-blue-400">{(result.probability * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${result.probability * 100}%` }}
                        className={`h-full ${result.prediction === 'Malignant' ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
                    <strong>Disclaimer:</strong> This AI tool is for research and educational use only. Results must be validated by a certified radiologist.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}