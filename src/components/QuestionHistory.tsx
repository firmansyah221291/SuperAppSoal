import React from 'react';
import { History, Eye, Trash2, Calendar, BookOpen, User } from 'lucide-react';
import { HistoryItem } from '../types';
import { motion } from 'motion/react';

interface Props {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export default function QuestionHistory({ history, onView, onDelete }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <History className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Riwayat</h3>
        <p className="text-slate-500 max-w-xs">
          Soal yang Anda buat akan muncul di sini untuk memudahkan akses di masa mendatang.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Riwayat Pembuatan Soal</h2>
          <p className="text-slate-500">Daftar soal yang telah Anda generate sebelumnya.</p>
        </div>
        <div className="px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold">
          {history.length} Riwayat Tersimpan
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-brand-green/20 transition-all group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-green/10 transition-colors">
                <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-brand-green transition-colors" />
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-all"
                title="Hapus Riwayat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 line-clamp-1">{item.formData.topic}</h3>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                  {item.formData.subject}
                </span>
                <span className="px-2 py-1 bg-brand-green/5 text-brand-green text-[10px] font-bold rounded uppercase">
                  {item.questions.length} Soal
                </span>
              </div>

              <div className="pt-4 space-y-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.timestamp).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  {item.formData.teacherName}
                </div>
              </div>

              <button
                onClick={() => onView(item)}
                className="w-full mt-4 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-brand-green transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Lihat Hasil
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
