export type Curriculum = 'Merdeka' | 'K13' | 'KBC' | 'Hybrid';
export type Level = 'SD' | 'SMP' | 'SMA';
export type BloomLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type QuestionType = 
  | 'pilihan_ganda' 
  | 'benar_salah' 
  | 'mengurutkan' 
  | 'pilihan_ganda_kompleks' 
  | 'menjodohkan' 
  | 'multi_pilihan' 
  | 'isian_singkat' 
  | 'esai';

export interface QuestionData {
  id: string;
  soal: string;
  pilihan: string[];
  kunci_jawaban: string;
  pembahasan: string;
  type: QuestionType;
  imageUrl?: string;
  indikator_soal?: string;
  materi?: string;
  level_kognitif?: string;
  kompetensi_dasar?: string;
}

export interface KisiKisiItem {
  no: number;
  kompetensi: string;
  materi: string;
  indikator: string;
  level: string;
  bentuk: string;
  noSoal: number;
}

export interface RubrikItem {
  no: number;
  kriteria: string;
  skorMaks: number;
  keterangan: string;
}

export interface KartuSoalItem {
  no: number;
  kompetensi: string;
  materi: string;
  indikator: string;
  level: string;
  soal: string;
  kunci: string;
}

export interface FormData {
  curriculum: Curriculum;
  teacherName: string;
  schoolName: string;
  topic: string;
  level: Level;
  class: string;
  phase: string;
  subject: string;
  bloomLevels: BloomLevel[];
  referenceType: 'none' | 'pdf' | 'text';
  referenceText: string;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionCounts: {
    [key in QuestionType]: number;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  formData: FormData;
  questions: QuestionData[];
}
