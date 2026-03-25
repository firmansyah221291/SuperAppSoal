import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  School, 
  User, 
  FileText, 
  Settings, 
  Upload, 
  Type as TypeIcon, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Layers,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import { FormData, Curriculum, Level, BloomLevel, QuestionType } from '../types';
import { cn } from '../lib/utils';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: 'pilihan_ganda', label: 'Pilihan Ganda' },
  { id: 'benar_salah', label: 'Benar / Salah' },
  { id: 'mengurutkan', label: 'Mengurutkan' },
  { id: 'pilihan_ganda_kompleks', label: 'Pilihan Ganda Kompleks' },
  { id: 'menjodohkan', label: 'Menjodohkan' },
  { id: 'multi_pilihan', label: 'Lebih dari satu pilihan' },
  { id: 'isian_singkat', label: 'Isian Singkat' },
  { id: 'esai', label: 'Uraian / Esai' },
];

const BLOOM_LEVELS: { id: BloomLevel; label: string; desc: string }[] = [
  { id: 'C1', label: 'C1', desc: 'Mengingat' },
  { id: 'C2', label: 'C2', desc: 'Memahami' },
  { id: 'C3', label: 'C3', desc: 'Menerapkan' },
  { id: 'C4', label: 'C4', desc: 'Menganalisis' },
  { id: 'C5', label: 'C5', desc: 'Mengevaluasi' },
  { id: 'C6', label: 'C6', desc: 'Mencipta' },
];

const LEVEL_CONFIG = {
  SD: {
    classes: ['1', '2', '3', '4', '5', '6'],
    phases: ['A', 'B', 'C']
  },
  SMP: {
    classes: ['7', '8', '9'],
    phases: ['D']
  },
  SMA: {
    classes: ['10', '11', '12'],
    phases: ['E', 'F']
  }
};

export default function QuestionForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    curriculum: 'Merdeka',
    teacherName: '',
    schoolName: '',
    topic: '',
    level: 'SD',
    subject: '',
    class: '',
    phase: '',
    bloomLevels: ['C3'],
    referenceType: 'none',
    referenceText: '',
    difficulty: {
      easy: 30,
      medium: 40,
      hard: 30
    },
    questionCounts: {
      pilihan_ganda: 5,
      benar_salah: 0,
      mengurutkan: 0,
      pilihan_ganda_kompleks: 0,
      menjodohkan: 0,
      multi_pilihan: 0,
      isian_singkat: 0,
      esai: 0,
    }
  });

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPdfLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      setFormData(prev => ({ ...prev, referenceText: fullText }));
    } catch (error) {
      console.error('Error reading PDF:', error);
      alert('Gagal membaca file PDF. Pastikan file tidak rusak.');
    } finally {
      setPdfLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  } as any);

  const handleDifficultyChange = (key: keyof typeof formData.difficulty, value: number) => {
    setFormData(prev => {
      const newDifficulty = { ...prev.difficulty, [key]: value };
      return { ...prev, difficulty: newDifficulty };
    });
  };

  const handleQuestionCountChange = (type: QuestionType, value: number) => {
    setFormData(prev => ({
      ...prev,
      questionCounts: { ...prev.questionCounts, [type]: value }
    }));
  };

  const toggleBloomLevel = (level: BloomLevel) => {
    setFormData(prev => {
      const exists = prev.bloomLevels.includes(level);
      if (exists) {
        if (prev.bloomLevels.length === 1) return prev; // Keep at least one
        return { ...prev, bloomLevels: prev.bloomLevels.filter(l => l !== level) };
      } else {
        return { ...prev, bloomLevels: [...prev.bloomLevels, level] };
      }
    });
  };

  const totalDifficulty = formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard;
  const totalQuestions = Object.values(formData.questionCounts).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Modal for Question Counts */}
      <AnimatePresence>
        {isTypeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTypeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl">Konfigurasi Jumlah Soal</h3>
                    <p className="text-xs text-slate-500">Tentukan jumlah soal untuk setiap jenis.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTypeModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {QUESTION_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-brand-orange/30 transition-all group">
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">{type.label}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="50"
                        value={formData.questionCounts[type.id]}
                        onChange={e => handleQuestionCountChange(type.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all font-bold text-brand-orange"
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Soal</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-orange" />
                  Total: {totalQuestions} Soal
                </div>
                <button 
                  onClick={() => setIsTypeModalOpen(false)}
                  className="px-6 py-2.5 bg-brand-orange text-white rounded-xl font-bold hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/20"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kurikulum Selection */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-brand-green" />
          <h2 className="font-display font-bold text-lg">Pilih Kurikulum</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['Merdeka', 'K13', 'KBC', 'Hybrid'] as Curriculum[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, curriculum: c }))}
              className={cn(
                "py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold",
                formData.curriculum === c 
                  ? "border-brand-green bg-brand-green/5 text-brand-green" 
                  : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Identitas Soal */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <School className="w-5 h-5 text-brand-orange" />
          <h2 className="font-display font-bold text-lg">Identitas & Topik</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nama Guru</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={formData.teacherName}
                onChange={e => setFormData(prev => ({ ...prev, teacherName: e.target.value }))}
                placeholder="Contoh: Budi Santoso, S.Pd"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nama Sekolah</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={formData.schoolName}
                onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="Contoh: SDN 01 Jakarta"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Jenjang</label>
            <select 
              value={formData.level}
              onChange={e => setFormData(prev => ({ ...prev, level: e.target.value as Level, class: '', phase: '' }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
            >
              <option value="SD">SD (Sekolah Dasar)</option>
              <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
              <option value="SMA">SMA (Sekolah Menengah Atas)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Kelas</label>
              <select 
                value={formData.class}
                onChange={e => setFormData(prev => ({ ...prev, class: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
              >
                <option value="">Pilih Kelas</option>
                {LEVEL_CONFIG[formData.level].classes.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fase</label>
              <select 
                value={formData.phase}
                onChange={e => setFormData(prev => ({ ...prev, phase: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
              >
                <option value="">Pilih Fase</option>
                {LEVEL_CONFIG[formData.level].phases.map(p => (
                  <option key={p} value={p}>Fase {p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mata Pelajaran</label>
            <input 
              type="text" 
              value={formData.subject}
              onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Contoh: Matematika, IPA"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Topik Materi</label>
            <input 
              type="text" 
              value={formData.topic}
              onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Contoh: Ekosistem, Pecahan, Sejarah Kemerdekaan"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Materi Referensi */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-brand-green" />
          <h2 className="font-display font-bold text-lg">Materi Referensi</h2>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          {(['none', 'pdf', 'text'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFormData(prev => ({ ...prev, referenceType: type }))}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                formData.referenceType === type 
                  ? "bg-white text-brand-green shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {type === 'none' ? 'Tanpa File' : type === 'pdf' ? 'Unggah PDF' : 'Input Teks'}
            </button>
          ))}
        </div>

        {formData.referenceType === 'pdf' && (
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
              isDragActive ? "border-brand-green bg-brand-green/5" : "border-slate-200 hover:border-brand-green/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-brand-green" />
              </div>
              {pdfLoading ? (
                <p className="text-sm text-slate-500 animate-pulse">Membaca PDF...</p>
              ) : (
                <>
                  <p className="font-semibold">Klik atau seret file PDF ke sini</p>
                  <p className="text-xs text-slate-400">Maksimal 10MB</p>
                </>
              )}
            </div>
          </div>
        )}

        {formData.referenceType === 'text' && (
          <textarea
            value={formData.referenceText}
            onChange={e => setFormData(prev => ({ ...prev, referenceText: e.target.value }))}
            placeholder="Tempelkan materi referensi di sini..."
            className="w-full h-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all resize-none"
          />
        )}

        {formData.referenceText && formData.referenceType !== 'none' && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-emerald-700 font-medium">Materi referensi berhasil dimuat ({formData.referenceText.length} karakter)</p>
          </div>
        )}
      </section>

      {/* Konfigurasi Soal */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-brand-orange" />
          <h2 className="font-display font-bold text-lg">Konfigurasi Soal</h2>
        </div>

        <div className="space-y-8">
          {/* Jenis & Jumlah Soal */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Jenis & Jumlah Soal</label>
              <button 
                onClick={() => setIsTypeModalOpen(true)}
                className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                Atur Jumlah Soal
              </button>
            </div>
            
            <div 
              onClick={() => setIsTypeModalOpen(true)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-brand-orange/30 transition-all flex items-center justify-between"
            >
              <div className="flex flex-wrap gap-2">
                {(Object.entries(formData.questionCounts) as [QuestionType, number][])
                  .filter(([_, count]) => count > 0)
                  .map(([type, count]) => (
                    <span key={type} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                      {count} {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                {totalQuestions === 0 && <span className="text-sm text-slate-400 italic">Belum ada jenis soal dipilih</span>}
              </div>
              <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold">
                Total: {totalQuestions}
              </div>
            </div>
          </div>

          {/* Tingkat Kesulitan */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tingkat Kesulitan (%)</label>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded",
                totalDifficulty === 100 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}>
                Total: {totalDifficulty}%
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'easy', label: 'Mudah', color: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700' },
                { key: 'medium', label: 'Sedang', color: 'bg-brand-orange', border: 'border-brand-orange/20', text: 'text-brand-orange' },
                { key: 'hard', label: 'Sulit', color: 'bg-red-500', border: 'border-red-200', text: 'text-red-700' }
              ].map((diff) => (
                <div key={diff.key} className={cn("p-4 rounded-2xl border-2 transition-all flex flex-col gap-3", diff.border, "bg-slate-50")}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", diff.color)} />
                    <span className="text-sm font-bold uppercase tracking-wide text-slate-600">{diff.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" max="100" 
                      value={formData.difficulty[diff.key as keyof typeof formData.difficulty]}
                      onChange={e => handleDifficultyChange(diff.key as any, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all font-bold text-lg"
                    />
                    <span className="font-bold text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>

            {totalDifficulty !== 100 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-xs text-red-700">Total persentase harus 100%.</p>
              </div>
            )}
          </div>

          {/* Level Kognitif (Taksonomi Bloom) */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Level Kognitif (Taksonomi Bloom)</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {BLOOM_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => toggleBloomLevel(level.id)}
                  className={cn(
                    "aspect-square rounded-full border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden group",
                    formData.bloomLevels.includes(level.id)
                      ? "border-brand-green bg-brand-green text-white shadow-lg shadow-brand-green/20 scale-105"
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <span className="text-lg font-bold leading-none">{level.id}</span>
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-tighter mt-1",
                    formData.bloomLevels.includes(level.id) ? "text-white/80" : "text-slate-400"
                  )}>
                    {level.desc}
                  </span>
                  {formData.bloomLevels.includes(level.id) && (
                    <motion.div 
                      layoutId="bloom-check"
                      className="absolute top-1 right-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">* Anda dapat memilih lebih dari satu level kognitif.</p>
          </div>
        </div>
      </section>

      <button
        type="button"
        disabled={isLoading || totalDifficulty !== 100 || !formData.topic || totalQuestions === 0}
        onClick={() => onSubmit(formData)}
        className={cn(
          "w-full py-4 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
          isLoading || totalDifficulty !== 100 || !formData.topic || totalQuestions === 0
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-brand-green hover:bg-brand-green-dark text-white hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Memproses Soal...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            Generate Soal Sekarang
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
