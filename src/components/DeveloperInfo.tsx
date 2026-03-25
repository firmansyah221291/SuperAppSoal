import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, School, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperInfo({ isOpen, onClose }: Props) {
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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-xl">Info Pengembang</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 rounded-2xl border-4 border-brand-green/20 overflow-hidden shadow-lg">
                  <img 
                    src="https://ais-dev-rrtrwhrukxcakef3wlla4z-738044003753.asia-southeast1.run.app/attachment/1" 
                    alt="Achmad Firmansyah" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ais-dev-rrtrwhrukxcakef3wlla4z-738044003753.asia-southeast1.run.app/attachment/0';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-2xl text-slate-900">Achmad Firmansyah</h4>
                  <p className="text-brand-green font-semibold">Developer & Educator</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <InfoItem icon={<School className="w-4 h-4" />} label="Asal Instansi" value="SD NEGERI 5 MOJOSARI" />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Alamat Lembaga" value="Desa Mojosari Kecamatan Asembagus Kabupaten Situbondo Jawa Timur" />
                <InfoItem icon={<Phone className="w-4 h-4" />} label="No Hp" value="082143175291" />
                <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value="achmadfirmansyah221@guru.sd.belajar.id / toyanpek@gmail.com" />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-center">
              <p className="text-xs text-slate-400 font-medium italic">"Membangun Masa Depan Pendidikan dengan Teknologi"</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-700 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
