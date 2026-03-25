import React from 'react';
import { Pencil } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-6 px-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
        <span>@superappsoal 2026 - Achmad Firmansyah</span>
        <Pencil className="w-3.5 h-3.5 text-brand-orange" />
      </div>
      <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <a href="#" className="hover:text-brand-green transition-all">Kebijakan Privasi</a>
        <a href="#" className="hover:text-brand-green transition-all">Syarat & Ketentuan</a>
        <a href="#" className="hover:text-brand-green transition-all">Bantuan</a>
      </div>
    </footer>
  );
}
