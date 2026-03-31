import { GoogleGenAI, Type } from "@google/genai";
import { FormData, QuestionData } from "../types";

export async function generateQuestions(formData: FormData): Promise<QuestionData[]> {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please add it to your secrets.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const questionTypesDesc = Object.entries(formData.questionCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `${count} soal ${type.replace(/_/g, ' ')}`)
    .join(', ');

  const prompt = `
    Buatlah total ${Object.values(formData.questionCounts).reduce((a, b) => a + b, 0)} soal dengan rincian: ${questionTypesDesc}.
    
    Data Konteks:
    Kurikulum: ${formData.curriculum}
    Jenjang: ${formData.level}
    Kelas: ${formData.class}
    Fase: ${formData.phase}
    Mata Pelajaran: ${formData.subject}
    Topik: ${formData.topic}
    Level Taksonomi Bloom: ${formData.bloomLevels.join(', ')}
    Proporsi Kesulitan: Mudah ${formData.difficulty.easy}%, Sedang ${formData.difficulty.medium}%, Sulit ${formData.difficulty.hard}%
    Referensi Materi: ${formData.referenceText || "Gunakan pengetahuan umum sesuai topik."}

    Instruksi Khusus Format Jawaban:
    - Untuk soal Pilihan Ganda: Berikan 4-5 pilihan jawaban.
    - Untuk soal Benar/Salah: Field 'pilihan' HARUS berisi ["Benar", "Salah"].
    - Untuk soal Mengurutkan: Field 'pilihan' berisi item-item yang harus diurutkan secara ACAK. Kunci jawaban berisi urutan yang benar.
    - Untuk soal Pilihan Ganda Kompleks: Field 'pilihan' berisi opsi-opsi. Kunci jawaban menyebutkan semua opsi yang benar.
    - Untuk soal Menjodohkan: Field 'soal' berisi daftar premis. Field 'pilihan' berisi daftar pasangan/respon yang diacak. Kunci jawaban menjelaskan pasangannya.
    - Untuk soal Isian Singkat & Esai: Field 'pilihan' HARUS berupa array kosong [].
    
    Berikan kunci jawaban dan pembahasan yang mendalam untuk setiap soal.
    Output HARUS dalam format JSON sesuai schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, description: "Jenis soal (pilihan_ganda, benar_salah, dll)" },
            soal: { type: Type.STRING },
            pilihan: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Pilihan jawaban (kosongkan jika isian/esai)"
            },
            kunci_jawaban: { type: Type.STRING },
            pembahasan: { type: Type.STRING },
            indikator_soal: { type: Type.STRING, description: "Indikator pencapaian kompetensi untuk soal ini" },
            materi: { type: Type.STRING, description: "Materi pokok soal ini" },
            level_kognitif: { type: Type.STRING, description: "Level kognitif (C1-C6)" },
            kompetensi_dasar: { type: Type.STRING, description: "Kompetensi Dasar atau Capaian Pembelajaran" },
          },
          required: ["type", "soal", "pilihan", "kunci_jawaban", "pembahasan", "indikator_soal", "materi", "level_kognitif", "kompetensi_dasar"],
        },
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "[]");
    return result.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q-${index}-${Date.now()}`,
    }));
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Gagal memproses hasil dari AI. Silakan coba lagi.");
  }
}
