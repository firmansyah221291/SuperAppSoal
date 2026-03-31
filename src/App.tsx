import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  History as HistoryIcon, 
  Settings, 
  LogOut,
  Menu,
  X,
  Github,
  Twitter,
  Info,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QuestionForm from './components/QuestionForm';
import QuestionPreview from './components/QuestionPreview';
import DeveloperInfo from './components/DeveloperInfo';
import UserGuide from './components/UserGuide';
import QuestionHistory from './components/QuestionHistory';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';
import { FormData, QuestionData, HistoryItem } from './types';
import { generateQuestions } from './services/geminiService';
import { cn } from './lib/utils';

type ViewType = 'dashboard' | 'history';

export default function App() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [appBgColor, setAppBgColor] = useState(() => {
    return localStorage.getItem('super_soal_bg_color') || '#f8fafc';
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('super_soal_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('super_soal_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('super_soal_bg_color', appBgColor);
  }, [appBgColor]);

  const handleGenerate = async (data: FormData) => {
    setIsLoading(true);
    setCurrentFormData(data);
    try {
      const result = await generateQuestions(data);
      setQuestions(result);
      
      // Save to history
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formData: data,
        questions: result
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setCurrentView('dashboard'); // Ensure we're on dashboard to see results
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = (item: HistoryItem) => {
    setCurrentFormData(item.formData);
    setQuestions(item.questions);
    setCurrentView('dashboard');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuestion = (updatedQuestion: QuestionData) => {
    setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleAddQuestion = (newQuestion: QuestionData) => {
    setQuestions(prev => [...prev, newQuestion]);
  };

  return (
    <div className="min-h-screen flex transition-colors duration-500" style={{ backgroundColor: appBgColor }}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 lg:relative"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-xl shadow-sm border border-slate-100 bg-white p-1">
                  <img 
                    src="https://image2url.com/r2/default/images/1774972532622-63bd11d0-b0c3-48cd-939d-c666313846b6.png" 
                    alt="Super App Soal Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h1 className="font-display font-bold text-xl tracking-tight">Super <span className="text-brand-green">App Soal</span></h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <SidebarItem 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                label="Dashboard" 
                active={currentView === 'dashboard'} 
                onClick={() => setCurrentView('dashboard')}
              />
              <SidebarItem 
                icon={<HistoryIcon className="w-5 h-5" />} 
                label="Riwayat Soal" 
                active={currentView === 'history'}
                onClick={() => setCurrentView('history')}
              />
              <SidebarItem 
                icon={<Settings className="w-5 h-5" />} 
                label="Pengaturan" 
                onClick={() => setIsSettingsModalOpen(true)}
              />
              <div className="pt-4 pb-2 px-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi</p>
              </div>
              <SidebarItem 
                icon={<Info className="w-5 h-5" />} 
                label="Info Pengembang" 
                onClick={() => setIsDevModalOpen(true)}
              />
              <SidebarItem 
                icon={<BookOpen className="w-5 h-5" />} 
                label="Petunjuk Penggunaan" 
                onClick={() => setIsGuideModalOpen(true)}
              />
            </nav>

            <div className="p-6 border-t border-slate-100 space-y-4">
              <div className="bg-brand-orange/5 p-4 rounded-2xl border border-brand-orange/10">
                <p className="text-xs font-bold text-brand-orange uppercase tracking-widest mb-1">Pro Plan</p>
                <p className="text-sm text-slate-600 mb-3">Dapatkan akses ke fitur premium & ekspor Word.</p>
                <button className="w-full py-2 bg-brand-orange text-white rounded-xl text-xs font-bold hover:bg-brand-orange-dark transition-all">
                  Upgrade Sekarang
                </button>
              </div>
              <button className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all text-sm font-semibold px-2">
                <LogOut className="w-5 h-5" />
                Keluar Akun
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-500">Selamat Datang,</p>
              <p className="text-sm font-bold text-slate-900">Admin Super App Soal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">AI Engine Online</span>
            </div>
            
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'dashboard' ? (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Column: Form */}
              <div className="w-full lg:w-[450px] xl:w-[500px] border-r border-slate-200 bg-white overflow-y-auto p-6 scrollbar-hide">
                <div className="max-w-xl mx-auto">
                  <div className="mb-8">
                    <h2 className="font-display font-bold text-2xl text-slate-900">Buat Soal Baru</h2>
                    <p className="text-slate-500">Konfigurasi parameter soal Anda di bawah ini.</p>
                  </div>
                  <QuestionForm onSubmit={handleGenerate} isLoading={isLoading} />
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="flex-1 bg-transparent overflow-hidden">
                <QuestionPreview 
                  questions={questions} 
                  formData={currentFormData} 
                  isLoading={isLoading} 
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                />
              </div>
            </div>
          ) : (
            <QuestionHistory 
              history={history} 
              onView={handleViewHistory} 
              onDelete={handleDeleteHistory} 
            />
          )}
        </div>

        <Footer />

        <DeveloperInfo isOpen={isDevModalOpen} onClose={() => setIsDevModalOpen(false)} />
        <UserGuide isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
        <SettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
          currentBg={appBgColor}
          onBgChange={setAppBgColor}
        />
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm",
        active 
          ? "bg-brand-green/10 text-brand-green" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
