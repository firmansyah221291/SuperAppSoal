import React from 'react';
import { X, Settings, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBg: string;
  onBgChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Default Slate', value: '#f8fafc' },
  { name: 'Soft Blue', value: '#eff6ff' },
  { name: 'Soft Green', value: '#f0fdf4' },
  { name: 'Soft Purple', value: '#faf5ff' },
  { name: 'Soft Pink', value: '#fdf2f8' },
  { name: 'Soft Orange', value: '#fff7ed' },
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Warm Gray', value: '#fafaf9' },
  { name: 'Cool Gray', value: '#f9fafb' },
];

export default function SettingsModal({ isOpen, onClose, currentBg, onBgChange }: Props) {
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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">Pengaturan</h3>
                  <p className="text-xs text-slate-500">Sesuaikan tampilan aplikasi Anda.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Palette className="w-4 h-4 text-brand-green" />
                  <span>Warna Background Aplikasi</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onBgChange(color.value)}
                      className={`
                        relative h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1
                        ${currentBg === color.value 
                          ? 'border-brand-green bg-slate-50 shadow-md' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'}
                      `}
                      style={{ backgroundColor: color.value }}
                    >
                      {currentBg === color.value && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-brand-green text-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className={`text-[10px] font-bold ${currentBg === color.value ? 'text-brand-green' : 'text-slate-400'}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Warna Kustom</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={currentBg}
                      onChange={(e) => onBgChange(e.target.value)}
                      className="w-12 h-12 rounded-xl border-2 border-slate-100 cursor-pointer overflow-hidden p-0"
                    />
                    <input 
                      type="text" 
                      value={currentBg}
                      onChange={(e) => onBgChange(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-green/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
