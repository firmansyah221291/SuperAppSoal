import React, { useRef, useState } from 'react';
import { 
  Download, 
  FileJson, 
  CheckCircle2, 
  HelpCircle,
  Printer,
  FileDown,
  FileText as FileWord,
  Copy,
  Edit2,
  Trash2,
  X,
  Save,
  Sparkles,
  Image as ImageIcon,
  ClipboardList,
  Table as TableIcon,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { QuestionData, FormData, QuestionType, KisiKisiItem, RubrikItem, KartuSoalItem } from '../types';
import { cn } from '../lib/utils';

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

type ViewType = 'soal' | 'kisi-kisi' | 'rubrik' | 'kartu-soal';

interface Props {
  questions: QuestionData[];
  formData: FormData | null;
  isLoading: boolean;
  onUpdateQuestion: (q: QuestionData) => void;
  onDeleteQuestion: (id: string) => void;
  onAddQuestion?: (q: QuestionData) => void;
}

export default function QuestionPreview({ questions, formData, isLoading, onUpdateQuestion, onDeleteQuestion, onAddQuestion }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<QuestionData | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('soal');

  const handleStartEdit = (q: QuestionData) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  const handleAddNew = () => {
    const newQ: QuestionData = {
      id: `q-new-${Date.now()}`,
      type: 'pilihan_ganda',
      soal: 'Tulis soal baru di sini...',
      pilihan: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      kunci_jawaban: 'A',
      pembahasan: 'Penjelasan jawaban...'
    };
    handleStartEdit(newQ);
  };

  const handleSaveEdit = () => {
    if (editForm) {
      // If it's a new question (not in the list), we need to add it
      const exists = questions.find(q => q.id === editForm.id);
      if (exists) {
        onUpdateQuestion(editForm);
      } else if (onAddQuestion) {
        onAddQuestion(editForm);
      }
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (editForm) {
      setEditForm({ ...editForm, imageUrl: undefined });
    }
  };

  const exportToPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 1.5, // Reduced scale for smaller file size
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 0.7 quality for optimization
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page if content is too long
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Soal_${formData?.subject || 'Materi'}_${formData?.topic || 'AI'}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    }
  };

  const exportToWord = async () => {
    if (!formData || questions.length === 0) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header / Kop Surat
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: formData.schoolName?.toUpperCase() || 'NAMA SEKOLAH',
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Mata Pelajaran: ${formData.subject} | Guru: ${formData.teacherName}`,
                italics: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Kurikulum: ${formData.curriculum} | Topik: ${formData.topic}`,
                italics: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.DOUBLE,
                size: 24,
              },
            },
            children: [],
          }),
          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
          
          // Student Info Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nama: ............................", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kelas: ............................", size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No. Absen: ....................", size: 20 })] })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "SOAL LATIHAN",
                bold: true,
                underline: {},
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),

          // Questions
          ...questions.flatMap((q, idx) => {
            const questionParagraphs: any[] = [
              new Paragraph({
                spacing: { before: 200 },
                children: [
                  new TextRun({ text: `${idx + 1}. `, bold: true }),
                  new TextRun({ text: `[${q.type.replace(/_/g, ' ').toUpperCase()}] `, bold: true, color: "475569", size: 18 }),
                  new TextRun({ text: q.soal }),
                ],
              })
            ];

            if (q.pilihan && q.pilihan.length > 0) {
              q.pilihan.forEach((opt, i) => {
                questionParagraphs.push(
                  new Paragraph({
                    indent: { left: 720 },
                    children: [
                      new TextRun({ text: `${String.fromCharCode(65 + i)}. `, bold: true }),
                      new TextRun({ text: opt }),
                    ],
                  })
                );
              });
            } else if (q.type === 'esai' || q.type === 'isian_singkat') {
              questionParagraphs.push(
                new Paragraph({
                  indent: { left: 720 },
                  children: [
                    new TextRun({ text: "................................................................................................................................................................................", color: "cbd5e1" }),
                  ],
                })
              );
            }

            return questionParagraphs;
          }),

          // Answer Key
          new Paragraph({ text: "", spacing: { before: 800 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Kunci Jawaban & Pembahasan",
                bold: true,
                underline: {},
                size: 24,
              }),
            ],
          }),
          ...questions.flatMap((q, idx) => [
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({ text: `No ${idx + 1}: `, bold: true }),
                new TextRun({ text: `Kunci: ${q.kunci_jawaban}`, bold: true, color: "059669" }),
              ],
            }),
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `Pembahasan: `, italics: true, color: "64748b" }),
                new TextRun({ text: q.pembahasan, italics: true, color: "64748b" }),
              ],
            }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Soal_${formData?.subject || 'Materi'}_${formData?.topic || 'AI'}.docx`);
  };

  const copyToClipboard = async () => {
    if (!printRef.current) return;
    try {
      const text = printRef.current.innerText;
      await navigator.clipboard.writeText(text);
      alert('Berhasil menyalin teks ke clipboard!');
    } catch (err) {
      console.error('Gagal menyalin:', err);
      alert('Gagal menyalin teks.');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-brand-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl">AI sedang meracik soal...</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Kami menganalisis kurikulum, topik, dan referensi materi Anda untuk hasil terbaik.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
          <FileJson className="w-10 h-10 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl text-slate-400">Belum ada soal dihasilkan</h3>
          <p className="text-slate-400 max-w-xs mx-auto">Isi form di sebelah kiri dan klik tombol generate untuk melihat hasilnya di sini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-display font-bold text-lg text-slate-700">Preview Hasil</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-sm active:scale-95"
              title="Salin Teks"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
            <button
              onClick={exportToWord}
              className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <FileWord className="w-4 h-4" />
              Download Word
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
        
        {/* View Tabs */}
        <div className="flex items-center gap-1 px-4 pb-2">
          <TabButton 
            active={currentView === 'soal'} 
            onClick={() => setCurrentView('soal')}
            icon={<FileWord className="w-4 h-4" />}
            label="Soal Latihan"
          />
          <TabButton 
            active={currentView === 'kisi-kisi'} 
            onClick={() => setCurrentView('kisi-kisi')}
            icon={<ClipboardList className="w-4 h-4" />}
            label="Kisi-Kisi"
          />
          <TabButton 
            active={currentView === 'rubrik'} 
            onClick={() => setCurrentView('rubrik')}
            icon={<TableIcon className="w-4 h-4" />}
            label="Rubrik Penilaian"
          />
          <TabButton 
            active={currentView === 'kartu-soal'} 
            onClick={() => setCurrentView('kartu-soal')}
            icon={<CreditCard className="w-4 h-4" />}
            label="Kartu Soal"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-transparent">
        <div 
          ref={printRef}
          className="bg-white shadow-xl rounded-lg p-12 max-w-[800px] mx-auto min-h-[1100px] text-slate-900 font-serif"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Kop Surat */}
          {formData && (
            <div className="border-b-4 border-double border-slate-900 pb-4 mb-8 text-center">
              <h1 className="text-2xl font-bold uppercase">{formData.schoolName || 'NAMA SEKOLAH'}</h1>
              <p className="text-sm italic">Mata Pelajaran: {formData.subject} | Guru: {formData.teacherName}</p>
              <p className="text-sm italic">
                Kurikulum: {formData.curriculum} | Topik: {formData.topic}
                {formData.class && ` | Kelas: ${formData.class}`}
                {formData.phase && ` | Fase: ${formData.phase}`}
              </p>
              <div className="mt-4 grid grid-cols-3 text-left text-xs border border-slate-900 p-2">
                <div>Nama: ............................</div>
                <div>Kelas: {formData.class ? `Kelas ${formData.class}` : '............................'}</div>
                <div>No. Absen: ....................</div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {currentView === 'soal' && (
              <>
                <div className="text-center font-bold underline mb-6 uppercase">
                  SOAL LATIHAN {formData?.subject}
                </div>
                
                {questions.map((q, idx) => (
                  <div key={q.id} className="group relative space-y-3 p-4 -mx-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    {/* Action Buttons (Hidden on Print) */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all no-print">
                      <button 
                        onClick={() => handleStartEdit(q)}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-brand-green hover:border-brand-green transition-all shadow-sm"
                        title="Edit Soal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteQuestion(q.id)}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-bold">{idx + 1}.</span>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-3">
                          <p className="leading-relaxed">
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded mr-2 uppercase tracking-wider border border-slate-200">
                              {q.type.replace(/_/g, ' ')}
                            </span>
                            {q.soal}
                          </p>
                          {q.imageUrl && (
                            <div className="max-w-md mx-auto my-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                              <img 
                                src={q.imageUrl} 
                                alt={`Ilustrasi soal ${idx + 1}`} 
                                className="w-full h-auto object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                        
                        {q.pilihan && q.pilihan.length > 0 && (
                          <div className="grid grid-cols-1 gap-2">
                            {q.pilihan.map((opt, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {(q.type === 'esai' || q.type === 'isian_singkat') && (
                          <div className="pt-2 border-b border-dotted border-slate-300 h-8" />
                        )}

                        {/* Footer Actions (No Print) */}
                        <div className="flex items-center gap-4 pt-4 mt-4 border-t border-slate-100 no-print">
                          <button 
                            onClick={() => handleStartEdit(q)}
                            className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-brand-green transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                            EDIT SOAL NO {idx + 1}
                          </button>
                          {!q.imageUrl && (
                            <button 
                              onClick={() => handleStartEdit(q)}
                              className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-brand-orange transition-all"
                            >
                              <ImageIcon className="w-3 h-3" />
                              TAMBAH GAMBAR
                            </button>
                          )}
                          <button 
                            onClick={() => onDeleteQuestion(q.id)}
                            className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-all ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            HAPUS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Question Button (No Print) */}
                <div className="pt-8 flex justify-center no-print">
                  <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl hover:border-brand-green hover:text-brand-green transition-all group"
                  >
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    <span className="font-bold">Tambah Soal Manual</span>
                  </button>
                </div>
              </>
            )}

            {currentView === 'kisi-kisi' && (
              <div className="space-y-6">
                <div className="text-center font-bold underline mb-6 uppercase">
                  KISI-KISI PENULISAN SOAL {formData?.subject}
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2">Kompetensi Dasar / CP</th>
                      <th className="border border-slate-900 p-2">Materi</th>
                      <th className="border border-slate-900 p-2">Indikator Soal</th>
                      <th className="border border-slate-900 p-2 w-16">Level</th>
                      <th className="border border-slate-900 p-2 w-24">Bentuk Soal</th>
                      <th className="border border-slate-900 p-2 w-12">No. Soal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-2">{q.kompetensi_dasar || '-'}</td>
                        <td className="border border-slate-900 p-2">{q.materi || '-'}</td>
                        <td className="border border-slate-900 p-2">{q.indikator_soal || '-'}</td>
                        <td className="border border-slate-900 p-2 text-center">{q.level_kognitif || '-'}</td>
                        <td className="border border-slate-900 p-2 text-center capitalize">{q.type.replace(/_/g, ' ')}</td>
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentView === 'rubrik' && (
              <div className="space-y-6">
                <div className="text-center font-bold underline mb-6 uppercase">
                  RUBRIK PENILAIAN {formData?.subject}
                </div>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2">Kriteria Penilaian / Kunci Jawaban</th>
                      <th className="border border-slate-900 p-2 w-24">Skor Maksimal</th>
                      <th className="border border-slate-900 p-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, idx) => (
                      <tr key={q.id}>
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-2">
                          <p className="font-bold mb-1">Kunci: {q.kunci_jawaban}</p>
                          <p className="italic text-slate-600">{q.pembahasan}</p>
                        </td>
                        <td className="border border-slate-900 p-2 text-center">
                          {q.type === 'esai' ? '20' : q.type === 'isian_singkat' ? '10' : '1'}
                        </td>
                        <td className="border border-slate-900 p-2">
                          {q.type === 'pilihan_ganda' ? 'Jawaban benar skor 1, salah 0' : 'Sesuai kedalaman jawaban'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentView === 'kartu-soal' && (
              <div className="space-y-8">
                <div className="text-center font-bold underline mb-6 uppercase">
                  KARTU SOAL {formData?.subject}
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border-2 border-slate-900 p-6 space-y-4">
                      <div className="grid grid-cols-2 border-b border-slate-900 pb-2 text-xs font-bold">
                        <div>KARTU SOAL NOMOR: {idx + 1}</div>
                        <div className="text-right uppercase">{formData?.subject}</div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex gap-2">
                          <span className="w-32 shrink-0">Kompetensi Dasar:</span>
                          <span className="font-medium">{q.kompetensi_dasar || '-'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-32 shrink-0">Materi:</span>
                          <span className="font-medium">{q.materi || '-'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-32 shrink-0">Indikator Soal:</span>
                          <span className="font-medium">{q.indikator_soal || '-'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-32 shrink-0">Level Kognitif:</span>
                          <span className="font-medium">{q.level_kognitif || '-'}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-900 pt-4">
                        <p className="font-bold mb-2">SOAL:</p>
                        <p className="mb-4">{q.soal}</p>
                        {q.pilihan && q.pilihan.length > 0 && (
                          <div className="grid grid-cols-1 gap-1 ml-4 italic">
                            {q.pilihan.map((opt, i) => (
                              <div key={i}>{String.fromCharCode(65 + i)}. {opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-slate-900 pt-4 bg-slate-50 p-2">
                        <p className="font-bold text-xs uppercase">Kunci Jawaban:</p>
                        <p className="text-sm">{q.kunci_jawaban}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          <AnimatePresence>
            {editingId && editForm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCancelEdit}
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
                        <Edit2 className="w-5 h-5 text-brand-green" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl">Edit Soal</h3>
                        <p className="text-xs text-slate-500">Sesuaikan teks soal, pilihan, dan jawaban.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-2 hover:bg-slate-200 rounded-full transition-all"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Jenis Soal</label>
                        <select 
                          value={editForm.type}
                          onChange={e => setEditForm({ ...editForm, type: e.target.value as QuestionType })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                        >
                          {QUESTION_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Level Kognitif</label>
                        <input 
                          type="text"
                          value={editForm.level_kognitif || ''}
                          onChange={e => setEditForm({ ...editForm, level_kognitif: e.target.value })}
                          placeholder="Contoh: L1, L2, L3 atau C1-C6"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Kompetensi Dasar / CP</label>
                        <input 
                          type="text"
                          value={editForm.kompetensi_dasar || ''}
                          onChange={e => setEditForm({ ...editForm, kompetensi_dasar: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Materi</label>
                        <input 
                          type="text"
                          value={editForm.materi || ''}
                          onChange={e => setEditForm({ ...editForm, materi: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Indikator Soal</label>
                      <textarea 
                        value={editForm.indikator_soal || ''}
                        onChange={e => setEditForm({ ...editForm, indikator_soal: e.target.value })}
                        className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Teks Soal</label>
                      <textarea 
                        value={editForm.soal}
                        onChange={e => setEditForm({ ...editForm, soal: e.target.value })}
                        className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Gambar Soal (Opsional)</label>
                      <div className="flex flex-col gap-4">
                        {editForm.imageUrl && (
                          <div className="relative w-full max-w-xs mx-auto group">
                            <img 
                              src={editForm.imageUrl} 
                              alt="Preview" 
                              className="w-full h-auto rounded-xl border border-slate-200 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                            <button 
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-brand-green transition-all cursor-pointer group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-brand-green mb-2" />
                            <p className="text-xs text-slate-500 group-hover:text-brand-green font-bold">Klik untuk unggah gambar</p>
                            <p className="text-[10px] text-slate-400">PNG, JPG (Maks. 2MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>

                    {editForm.pilihan && editForm.pilihan.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilihan Jawaban</label>
                        <div className="space-y-2">
                          {editForm.pilihan.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <input 
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const newPilihan = [...editForm.pilihan];
                                  newPilihan[i] = e.target.value;
                                  setEditForm({ ...editForm, pilihan: newPilihan });
                                }}
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Kunci Jawaban</label>
                        <input 
                          type="text"
                          value={editForm.kunci_jawaban}
                          onChange={e => setEditForm({ ...editForm, kunci_jawaban: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pembahasan</label>
                        <textarea 
                          value={editForm.pembahasan}
                          onChange={e => setEditForm({ ...editForm, pembahasan: e.target.value })}
                          className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button 
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="px-6 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Kunci Jawaban & Pembahasan (Optional for print, but shown here) */}
          <div className="mt-16 pt-8 border-t border-dashed border-slate-300 page-break-before">
            <h2 className="text-lg font-bold underline mb-4">Kunci Jawaban & Pembahasan</h2>
            <div className="space-y-6 text-sm">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">No {idx + 1}:</span>
                    <span className="px-2 py-0.5 bg-brand-green text-white rounded text-xs font-bold">Kunci: {q.kunci_jawaban}</span>
                  </div>
                  <div className="flex gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-slate-600 italic">{q.pembahasan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all no-print",
        active 
          ? "bg-brand-green text-white shadow-lg shadow-brand-green/20" 
          : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
