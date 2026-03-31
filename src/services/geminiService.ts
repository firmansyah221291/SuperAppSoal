import { FormData, QuestionData } from "../types";

export async function generateQuestions(formData: FormData): Promise<QuestionData[]> {
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

  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        type: { type: "STRING", description: "Jenis soal (pilihan_ganda, benar_salah, dll)" },
        soal: { type: "STRING" },
        pilihan: { 
          type: "ARRAY", 
          items: { type: "STRING" },
          description: "Pilihan jawaban (kosongkan jika isian/esai)"
        },
        kunci_jawaban: { type: "STRING" },
        pembahasan: { type: "STRING" },
        indikator_soal: { type: "STRING", description: "Indikator pencapaian kompetensi untuk soal ini" },
        materi: { type: "STRING", description: "Materi pokok soal ini" },
        level_kognitif: { type: "STRING", description: "Level kognitif (C1-C6)" },
        kompetensi_dasar: { type: "STRING", description: "Kompetensi Dasar atau Capaian Pembelajaran" },
      },
      required: ["type", "soal", "pilihan", "kunci_jawaban", "pembahasan", "indikator_soal", "materi", "level_kognitif", "kompetensi_dasar"],
    },
  };

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, schema }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal menghasilkan soal.");
    }

    const data = await response.json();
    const result = JSON.parse(data.text || "[]");
    return result.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q-${index}-${Date.now()}`,
    }));
  } catch (e: any) {
    console.error("AI Generation Error:", e);
    throw new Error(e.message || "Gagal memproses hasil dari AI. Silakan coba lagi.");
  }
}
