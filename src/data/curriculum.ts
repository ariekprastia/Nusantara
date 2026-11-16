import type {
  Jenjang,
  Kurikulum,
  LearningMethodCategoryId,
  LearningMethodOption,
  SubjectOption,
} from '../types/exam.ts';

export const JENJANG_CLASSES: Record<Jenjang, Array<{ label: string; faseMerdeka: string }>> = {
  SD: [
    { label: 'Kelas 1 SD', faseMerdeka: 'Fase A' },
    { label: 'Kelas 2 SD', faseMerdeka: 'Fase A' },
    { label: 'Kelas 3 SD', faseMerdeka: 'Fase B' },
    { label: 'Kelas 4 SD', faseMerdeka: 'Fase B' },
    { label: 'Kelas 5 SD', faseMerdeka: 'Fase C' },
    { label: 'Kelas 6 SD', faseMerdeka: 'Fase C' },
  ],
  SMP: [
    { label: 'Kelas 7 SMP', faseMerdeka: 'Fase D' },
    { label: 'Kelas 8 SMP', faseMerdeka: 'Fase D' },
    { label: 'Kelas 9 SMP', faseMerdeka: 'Fase D' },
  ],
  SMA: [
    { label: 'Kelas 10 SMA', faseMerdeka: 'Fase E' },
    { label: 'Kelas 11 SMA', faseMerdeka: 'Fase F' },
    { label: 'Kelas 12 SMA', faseMerdeka: 'Fase F' },
  ],
};

export const KURIKULUM_DESCRIPTIONS: Record<
  Kurikulum,
  { title: string; summary: string; structure: string }
> = {
  'Kurikulum Merdeka': {
    title: 'Kurikulum Merdeka (Kemendikbudristek)',
    summary:
      'Berbasis Capaian Pembelajaran (CP) per Fase A–F, penguatan literasi-numerasi, pembelajaran berdiferensiasi, dan Profil Pelajar Pancasila.',
    structure: 'Fase A–C (SD) · Fase D (SMP) · Fase E–F (SMA)',
  },
  'Kurikulum 2013': {
    title: 'Kurikulum 2013 (K-13 Revisi)',
    summary:
      'Berbasis Kompetensi Inti (KI) dan Kompetensi Dasar (KD), tematik terpadu untuk SD serta peminatan MIPA/IPS/Bahasa untuk SMA.',
    structure: 'Tematik Terpadu (SD) · Mapel Wajib & Peminatan (SMP/SMA)',
  },
};

export const SUBJECTS_BY_JENJANG: Record<Jenjang, SubjectOption[]> = {
  SD: [
    {
      id: 'sd-pai',
      name: 'Pendidikan Agama & Budi Pekerti',
      group: 'Wajib Nasional',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-ppkn',
      name: 'Pendidikan Pancasila / PPKn',
      group: 'Wajib Nasional',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-bindo',
      name: 'Bahasa Indonesia',
      group: 'Literasi Dasar',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-mtk',
      name: 'Matematika',
      group: 'Numerasi Dasar',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-ipas',
      name: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
      group: 'Sains & Sosial',
      kurikulumSupport: ['Kurikulum Merdeka'],
      phaseNote: 'Terpadu untuk Fase B & C',
    },
    {
      id: 'sd-ipa',
      name: 'Ilmu Pengetahuan Alam (IPA)',
      group: 'Sains & Sosial',
      kurikulumSupport: ['Kurikulum 2013', 'Kurikulum Merdeka'],
    },
    {
      id: 'sd-ips',
      name: 'Ilmu Pengetahuan Sosial (IPS)',
      group: 'Sains & Sosial',
      kurikulumSupport: ['Kurikulum 2013', 'Kurikulum Merdeka'],
    },
    {
      id: 'sd-bing',
      name: 'Bahasa Inggris',
      group: 'Bahasa Asing',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-sbdp',
      name: 'Seni Budaya & Prakarya (SBdP)',
      group: 'Seni & Keterampilan',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-pjok',
      name: 'PJOK (Pendidikan Jasmani, Olahraga & Kesehatan)',
      group: 'Kesehatan & Gerak',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sd-mulok',
      name: 'Muatan Lokal / Bahasa Daerah & Koding Dasar',
      group: 'Muatan Lokal & Pilihan',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
  ],
  SMP: [
    {
      id: 'smp-pai',
      name: 'Pendidikan Agama & Budi Pekerti',
      group: 'Wajib Nasional',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-ppkn',
      name: 'Pendidikan Pancasila / PPKn',
      group: 'Wajib Nasional',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-bindo',
      name: 'Bahasa Indonesia',
      group: 'Literasi & Bahasa',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-mtk',
      name: 'Matematika',
      group: 'Numerasi & Logika',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-ipa',
      name: 'Ilmu Pengetahuan Alam (IPA Terpadu)',
      group: 'Sains',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-ips',
      name: 'Ilmu Pengetahuan Sosial (IPS Terpadu)',
      group: 'Sosial & Humaniora',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-bing',
      name: 'Bahasa Inggris',
      group: 'Bahasa Asing',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-inf',
      name: 'Informatika (TIK & Berpikir Komputasional)',
      group: 'Teknologi',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-seni',
      name: 'Seni Budaya (Musik, Rupa, Tari, Teater)',
      group: 'Seni & Prakarya',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-prakarya',
      name: 'Prakarya & Kewirausahaan Dasar',
      group: 'Seni & Prakarya',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-pjok',
      name: 'PJOK (Pendidikan Jasmani, Olahraga & Kesehatan)',
      group: 'Kesehatan & Gerak',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'smp-mulok',
      name: 'Muatan Lokal / Bahasa Daerah',
      group: 'Muatan Lokal',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
  ],
  SMA: [
    {
      id: 'sma-pai',
      name: 'Pendidikan Agama & Budi Pekerti',
      group: 'Umum / Wajib',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-ppkn',
      name: 'Pendidikan Pancasila / PPKn',
      group: 'Umum / Wajib',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-bindo',
      name: 'Bahasa Indonesia',
      group: 'Umum / Wajib',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-bing',
      name: 'Bahasa Inggris',
      group: 'Umum / Wajib',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-mtk-wajib',
      name: 'Matematika (Umum / Wajib)',
      group: 'Umum / Wajib',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-mtk-lanjut',
      name: 'Matematika Tingkat Lanjut (Peminatan)',
      group: 'Peminatan MIPA',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-fisika',
      name: 'Fisika',
      group: 'Peminatan MIPA',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-kimia',
      name: 'Kimia',
      group: 'Peminatan MIPA',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-biologi',
      name: 'Biologi',
      group: 'Peminatan MIPA',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-ekonomi',
      name: 'Ekonomi & Akuntansi',
      group: 'Peminatan IPS',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-geografi',
      name: 'Geografi',
      group: 'Peminatan IPS',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-sosiologi',
      name: 'Sosiologi',
      group: 'Peminatan IPS',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-sejarah',
      name: 'Sejarah (Indonesia & Tingkat Lanjut)',
      group: 'Umum & IPS',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-antropologi',
      name: 'Antropologi',
      group: 'Peminatan Bahasa & Budaya',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-informatika',
      name: 'Informatika',
      group: 'Pilihan Teknologi',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-pkwu',
      name: 'Prakarya & Kewirausahaan (PKWU)',
      group: 'Keterampilan',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-seni',
      name: 'Seni Budaya',
      group: 'Seni & Budaya',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-pjok',
      name: 'PJOK (Pendidikan Jasmani, Olahraga & Kesehatan)',
      group: 'Umum / Wajib',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
    {
      id: 'sma-bahasa-asing',
      name: 'Bahasa & Sastra Asing Pilihan (Jepang/Arab/Mandarin/Jerman)',
      group: 'Peminatan Bahasa',
      kurikulumSupport: ['Kurikulum Merdeka', 'Kurikulum 2013'],
    },
  ],
};

export const LEARNING_METHOD_CATEGORIES: Array<{
  id: LearningMethodCategoryId;
  title: string;
  subtitle: string;
}> = [
  {
    id: 'utama_populer',
    title: 'Pembelajaran Utama & Populer',
    subtitle: 'Metode pedagogis inti yang paling luas diterapkan di sekolah Indonesia.',
  },
  {
    id: 'inovatif_tren',
    title: 'Metode Inovatif & Berbasis Tren',
    subtitle: 'Pendekatan modern berbasis literasi-numerasi AKM, STEM, dan teknologi.',
  },
  {
    id: 'karakteristik_sekolah',
    title: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    subtitle: 'Penyesuaian konteks lokal, lingkungan sekolah, dan kebutuhan peserta didik.',
  },
];

export const LEARNING_METHODS: LearningMethodOption[] = [
  // 1. Pembelajaran Utama & Populer
  {
    id: 'pbl',
    category: 'utama_populer',
    categoryLabel: 'Pembelajaran Utama & Populer',
    name: 'Problem-Based Learning (PBL)',
    description: 'Soal berbasis studi kasus nyata yang menuntut analisis masalah dan solusi.',
  },
  {
    id: 'pjbl',
    category: 'utama_populer',
    categoryLabel: 'Pembelajaran Utama & Populer',
    name: 'Project-Based Learning (PjBL)',
    description: 'Evaluasi berbasis tahapan proyek, eksperimen terapan, dan produk nyata.',
  },
  {
    id: 'discovery',
    category: 'utama_populer',
    categoryLabel: 'Pembelajaran Utama & Populer',
    name: 'Discovery & Inquiry Learning',
    description: 'Menguji kemampuan observasi, perumusan hipotesis, dan penarikan kesimpulan.',
  },
  {
    id: 'cooperative',
    category: 'utama_populer',
    categoryLabel: 'Pembelajaran Utama & Populer',
    name: 'Cooperative Learning',
    description: 'Konteks diskusi kelompok, pembagian peran, dan pemecahan masalah kolaboratif.',
  },
  {
    id: 'ctl',
    category: 'utama_populer',
    categoryLabel: 'Pembelajaran Utama & Populer',
    name: 'Contextual Teaching & Learning (CTL)',
    description: 'Menghubungkan konsep materi pelajaran langsung dengan kehidupan sehari-hari siswa.',
  },
  {
    id: 'drill',
    category: 'utama_populer',
    categoryLabel: 'Pembelajaran Utama & Populer',
    name: 'Drill & Practice (Latihan Terstruktur)',
    description: 'Penguatan penguasaan konsep inti, rumus, dan ketepatan pengerjaan soal ujian.',
  },

  // 2. Metode Inovatif & Berbasis Tren
  {
    id: 'akm_hots',
    category: 'inovatif_tren',
    categoryLabel: 'Metode Inovatif & Berbasis Tren',
    name: 'HOTS & Literasi-Numerasi (AKM/ANBK)',
    description: 'Soal stimulus wacana, tabel, atau infografis berorientasi penalaran tingkat tinggi.',
  },
  {
    id: 'stem_steam',
    category: 'inovatif_tren',
    categoryLabel: 'Metode Inovatif & Berbasis Tren',
    name: 'STEM / STEAM Terintegrasi',
    description: 'Memadukan Sains, Teknologi, Rekayasa, Seni, dan Matematika dalam satu skenario.',
  },
  {
    id: 'gamifikasi',
    category: 'inovatif_tren',
    categoryLabel: 'Metode Inovatif & Berbasis Tren',
    name: 'Gamifikasi Edukatif & Tantangan Misi',
    description: 'Penyajian soal bertingkat ala misi eksplorasi dengan umpan balik membangun.',
  },
  {
    id: 'flipped',
    category: 'inovatif_tren',
    categoryLabel: 'Metode Inovatif & Berbasis Tren',
    name: 'Flipped Classroom (Pendalaman Mandiri)',
    description: 'Menguji pemahaman konseptual dan aplikasi kritis setelah belajar mandiri.',
  },
  {
    id: 'blended',
    category: 'inovatif_tren',
    categoryLabel: 'Metode Inovatif & Berbasis Tren',
    name: 'Blended Learning & Eksplorasi Digital',
    description: 'Simulasi evaluasi yang memadukan literasi digital dan sumber belajar daring.',
  },
  {
    id: 'microlearning',
    category: 'inovatif_tren',
    categoryLabel: 'Metode Inovatif & Berbasis Tren',
    name: 'Microlearning Adaptif Konsep Inti',
    description: 'Pertanyaan fokus per unit kompetensi mikro agar pemahaman tuntas dan terukur.',
  },

  // 3. Pendekatan Khusus Berdasarkan Karakteristik Sekolah
  {
    id: 'berdiferensiasi',
    category: 'karakteristik_sekolah',
    categoryLabel: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    name: 'Pembelajaran Berdiferensiasi',
    description: 'Menyesuaikan variasi tingkat kesiapan belajar, visualisasi, dan gaya berpikir siswa.',
  },
  {
    id: 'adiwiyata',
    category: 'karakteristik_sekolah',
    categoryLabel: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    name: 'Sekolah Adiwiyata (Berbasis Lingkungan)',
    description: 'Mengaitkan materi dengan kelestarian ekosistem, energi hijau, dan pengelolaan sampah.',
  },
  {
    id: 'ramah_anak',
    category: 'karakteristik_sekolah',
    categoryLabel: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    name: 'Sekolah Ramah Anak & Inklusif',
    description: 'Bahasa soal komunikatif, suportif, bebas bias, dan ramah keberagaman peserta didik.',
  },
  {
    id: 'religius_pesantren',
    category: 'karakteristik_sekolah',
    categoryLabel: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    name: 'Sekolah Berbasis Karakter Religius / Pesantren',
    description: 'Mengintegrasikan nilai akhlak mulia, etika keilmuan, dan keteladanan dalam soal.',
  },
  {
    id: 'kearifan_lokal',
    category: 'karakteristik_sekolah',
    categoryLabel: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    name: 'Sekolah 3T & Kearifan Lokal Nusantara',
    description: 'Mengangkat konteks budaya daerah, pertanian, maritim, dan sumber daya lokal Indonesia.',
  },
  {
    id: 'smart_school',
    category: 'karakteristik_sekolah',
    categoryLabel: 'Pendekatan Khusus Berdasarkan Karakteristik Sekolah',
    name: 'Sekolah Digital / Smart School',
    description: 'Berorientasi analisis data, sistem otomasi modern, dan pemecahan masalah berbasis data.',
  },
];
