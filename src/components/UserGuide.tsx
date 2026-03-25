import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, CheckCircle2, FileText, Settings, Sparkles, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuide({ isOpen, onClose }: Props) {
  const steps = [
    {
      icon: <Settings className="w-5 h-5 text-brand-orange" />,
      title: "Konfigurasi Identitas",
      desc: "Isi nama guru, nama sekolah, jenjang, kelas, dan fase untuk menyesuaikan soal dengan kebutuhan kurikulum."
    },
    {
      icon: <FileText className="w-5 h-5 text-brand-green" />,
      title: "Pilih Referensi Materi",
      desc: "Unggah file PDF atau masukkan teks materi sebagai acuan AI dalam meracik soal yang relevan."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-brand-orange" />,
      title: "Generate Soal Otomatis",
      desc: "Klik tombol 'Generate Soal' dan biarkan AI bekerja membuat soal pilihan ganda, esai, hingga menjodohkan."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-brand-green" />,
      title: "Review & Edit",
      desc: "Gunakan icon pensil untuk mengedit soal atau icon tong sampah untuk menghapus soal yang kurang sesuai."
    },
    {
      icon: <Download className="w-5 h-5 text-brand-orange" />,
      title: "Ekspor Hasil",
      desc: "Unduh soal dalam format PDF atau Word yang sudah siap cetak dengan kop surat otomatis."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">Petunjuk Penggunaan</h3>
                  <p className="text-xs text-slate-500">Panduan langkah demi langkah menggunakan Super Soal.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-brand-green/30 transition-all">
                      {step.icon}
                    </div>
                    {idx !== steps.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-100 my-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h4 className="font-display font-bold text-lg text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-center">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20"
              >
                Mulai Sekarang
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
