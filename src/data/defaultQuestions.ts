import type { QuestionItem } from '../types/exam.ts';

export const DEFAULT_QUESTION_BANK: QuestionItem[] = [
  // === SD ===
  {
    id: 'bank-sd-ipas-1',
    jenjang: 'SD',
    kelas: 'Kelas 5 SD',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    difficulty: 'mudah',
    learningMethod: 'Discovery & Inquiry Learning',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_fotosintesis_daun_1794805202550.jpg',
    imageCaption: 'Ilustrasi penampang daun dalam proses fotosintesis tumbuhan hijau.',
    topic: 'Fotosintesis Tumbuhan',
    prompt:
      'Perhatikan ilustrasi proses fotosintesis pada daun di atas. Gas yang masuk melalui stomata pada epidermis bawah sebagai bahan baku utama bersama air untuk menghasilkan glukosa dan oksigen adalah ....',
    options: [
      'Nitrogen (N₂)',
      'Karbon dioksida (CO₂)',
      'Uap air (H₂O)',
      'Metana (CH₄)',
    ],
    correctIndex: 1,
    explanation:
      'Pada proses fotosintesis, tumbuhan hijau menyerap gas karbon dioksida (CO₂) dari udara melalui mulut daun (stoma) dan air (H₂O) dari akar melalui pembuluh xilem, lalu dengan bantuan cahaya matahari di kloroplas menghasilkan glukosa dan gas oksigen (O₂).',
    source: 'bank',
  },
  {
    id: 'bank-sd-mtk-1',
    jenjang: 'SD',
    kelas: 'Kelas 6 SD',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Matematika',
    difficulty: 'sedang',
    learningMethod: 'Contextual Teaching & Learning (CTL)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_geometri_bangun_1794805202993.jpg',
    imageCaption: 'Ilustrasi bangun ruang prisma segitiga siku-siku, tabung, dan limas segiempat.',
    topic: 'Bangun Ruang',
    prompt:
      'Perhatikan gambar bangun ruang tabung (Cylinder) di bagian tengah ilustrasi. Jika jari-jari alas tabung tersebut adalah r = 7 cm dan tingginya 10 cm (π = 22/7), maka volume tabung tersebut adalah ....',
    options: [
      '440 cm³',
      '770 cm³',
      '1.540 cm³',
      '3.080 cm³',
    ],
    correctIndex: 2,
    explanation:
      'Rumus volume tabung adalah V = π × r² × t. Dengan r = 7 cm, t = 10 cm, dan π = 22/7, diperoleh V = (22/7) × 7 × 7 × 10 = 22 × 7 × 10 = 1.540 cm³.',
    source: 'bank',
  },
  {
    id: 'bank-sd-ips-1',
    jenjang: 'SD',
    kelas: 'Kelas 5 SD',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    difficulty: 'sedang',
    learningMethod: 'Sekolah 3T & Kearifan Lokal Nusantara',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_peta_nusantara_1794805203502.jpg',
    imageCaption: 'Peta fisik kepulauan Indonesia beserta garis khatulistiwa dan arus laut.',
    topic: 'Letak Geografis Indonesia',
    prompt:
      'Berdasarkan peta kepulauan Indonesia di atas, pulau besar yang secara langsung dilalui garis khatulistiwa (garis lintang 0°) di bagian tengahnya sehingga memiliki iklim tropis dengan penyinaran matahari sepanjang tahun adalah ....',
    options: [
      'Pulau Jawa dan Bali',
      'Pulau Kalimantan dan Sulawesi',
      'Pulau Nusa Tenggara Timur',
      'Pulau Madura dan Lombok',
    ],
    correctIndex: 1,
    explanation:
      'Garis khatulistiwa (0° LU/LS) pada peta melintasi Pulau Sumatra bagian tengah, Pulau Kalimantan (Kota Pontianak), Pulau Sulawesi bagian tengah, dan wilayah Maluku Utara/Papua bagian utara.',
    source: 'bank',
  },
  {
    id: 'bank-sd-mtk-2',
    jenjang: 'SD',
    kelas: 'Kelas 4 SD',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Matematika',
    difficulty: 'mudah',
    learningMethod: 'Drill & Practice (Latihan Terstruktur)',
    hasImage: true,
    svgDiagram: `<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
      <rect x="0" y="0" width="360" height="160" fill="#f8fafc" rx="8"/>
      <g transform="translate(30,25)">
        <rect x="0" y="0" width="120" height="80" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
        <rect x="0" y="0" width="40" height="40" fill="#1e3a8a" opacity="0.85"/>
        <rect x="40" y="0" width="40" height="40" fill="#1e3a8a" opacity="0.85"/>
        <rect x="80" y="0" width="40" height="40" fill="#1e3a8a" opacity="0.85"/>
        <line x1="40" y1="0" x2="40" y2="80" stroke="#1e3a8a" stroke-width="1.5"/>
        <line x1="80" y1="0" x2="80" y2="80" stroke="#1e3a8a" stroke-width="1.5"/>
        <line x1="0" y1="40" x2="120" y2="40" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="60" y="105" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#0f172a">Gambar A (6 kotak)</text>
      </g>
      <g transform="translate(200,25)">
        <circle cx="55" cy="40" r="40" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
        <path d="M55,40 L55,0 A40,40 0 0,1 95,40 Z" fill="#0284c7" opacity="0.85"/>
        <line x1="55" y1="0" x2="55" y2="80" stroke="#1e3a8a" stroke-width="1.5"/>
        <line x1="15" y1="40" x2="95" y2="40" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="55" y="105" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#0f172a">Gambar B (4 bagian)</text>
      </g>
    </svg>`,
    imageCaption: 'Diagram pecahan bagian yang diarsir pada Gambar A dan Gambar B.',
    topic: 'Bilangan Pecahan',
    prompt:
      'Perhatikan diagram pecahan di atas. Jika pecahan daerah yang diarsir pada Gambar A dijumlahkan dengan pecahan daerah yang diarsir pada Gambar B, maka hasilnya adalah ....',
    options: ['1/4', '2/4', '3/4', '4/4'],
    correctIndex: 2,
    explanation:
      'Gambar A terdiri dari 6 kotak dan 3 bagian diarsir, sehingga nilainya 3/6 = 1/2 = 2/4. Gambar B terdiri dari 4 bagian sama besar dan 1 bagian diarsir, sehingga nilainya 1/4. Penjumlahan: 2/4 + 1/4 = 3/4.',
    source: 'bank',
  },
  {
    id: 'bank-sd-bindo-1',
    jenjang: 'SD',
    kelas: 'Kelas 5 SD',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Bahasa Indonesia',
    difficulty: 'mudah',
    learningMethod: 'HOTS & Literasi-Numerasi (AKM/ANBK)',
    hasImage: false,
    topic: 'Ide Pokok Paragraf',
    prompt:
      'Bacalah paragraf berikut: "Membaca buku setiap hari melatih daya ingat dan memperluas kosakata siswa. Selain itu, kebiasaan membaca juga membantu siswa memahami informasi pelajaran dengan lebih cepat. Oleh karena itu, sekolah membiasakan kegiatan literasi 15 menit sebelum pelajaran dimulai." Ide pokok paragraf tersebut adalah ....',
    options: [
      'Sekolah mewajibkan siswa membeli banyak buku cerita',
      'Manfaat kebiasaan membaca buku bagi siswa',
      'Kegiatan upacara setiap pagi di halaman sekolah',
      'Cara menghafal pelajaran dalam waktu lima belas menit',
    ],
    correctIndex: 1,
    explanation:
      'Kalimat utama terletak di awal paragraf yang menjelaskan manfaat membaca buku (melatih daya ingat, memperluas kosakata, memahami pelajaran). Kalimat berikutnya adalah kalimat penjelas dan kesimpulan pendukung.',
    source: 'bank',
  },
  {
    id: 'bank-sd-ppkn-1',
    jenjang: 'SD',
    kelas: 'Kelas 4 SD',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Pendidikan Pancasila / PPKn',
    difficulty: 'mudah',
    learningMethod: 'Cooperative Learning',
    hasImage: false,
    topic: 'Pengamalan Nilai Pancasila',
    prompt:
      'Saat kelas melakukan musyawarah untuk menentukan tujuan karya wisata, pendapat Dika tidak terpilih oleh suara terbanyak. Sikap yang paling sesuai dengan sila keempat Pancasila adalah ....',
    options: [
      'Menolak ikut karya wisata karena pendapatnya kalah',
      'Menerima hasil keputusan bersama dengan lapang dada dan melaksanakannya',
      'Memaksa teman-teman mengulang pemungutan suara sampai pendapatnya menang',
      'Meninggalkan ruang kelas sebelum rapat selesai',
    ],
    correctIndex: 1,
    explanation:
      'Sila keempat Pancasila mengajarkan pengambilan keputusan melalui musyawarah untuk mufakat serta sikap menghormati dan melaksanakan keputusan bersama dengan penuh tanggung jawab.',
    source: 'bank',
  },

  // === SMP ===
  {
    id: 'bank-smp-ipa-1',
    jenjang: 'SMP',
    kelas: 'Kelas 9 SMP',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Ilmu Pengetahuan Alam (IPA Terpadu)',
    difficulty: 'sedang',
    learningMethod: 'Problem-Based Learning (PBL)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_rangkaian_listrik_1794805203822.jpg',
    imageCaption: 'Perbandingan skema rangkaian listrik seri (kiri) dan paralel (kanan).',
    topic: 'Listrik Dinamis: Rangkaian Seri & Paralel',
    prompt:
      'Perhatikan ilustrasi rangkaian seri dan paralel di atas. Apabila salah satu lampu pada rangkaian paralel (Bulb A) dilepas atau putus saat sakelar dalam kondisi ON, keadaan yang terjadi pada Bulb B adalah ....',
    options: [
      'Ikut padam karena arus listrik terputus total',
      'Tetap menyala karena memiliki cabang arus tersendiri ke sumber tegangan',
      'Menyala jauh lebih redup karena hambatan total menjadi nol',
      'Mengalami korsleting dan memutuskan sakelar utama',
    ],
    correctIndex: 1,
    explanation:
      'Pada rangkaian paralel, setiap cabang lampu terhubung langsung secara mandiri ke kutub positif dan negatif sumber tegangan. Jika Bulb A putus, arus listrik masih dapat mengalir melalui cabang Bulb B sehingga Bulb B tetap menyala.',
    source: 'bank',
  },
  {
    id: 'bank-smp-ipa-2',
    jenjang: 'SMP',
    kelas: 'Kelas 8 SMP',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Ilmu Pengetahuan Alam (IPA Terpadu)',
    difficulty: 'sulit',
    learningMethod: 'Discovery & Inquiry Learning',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_fotosintesis_daun_1794805202550.jpg',
    imageCaption: 'Struktur jaringan daun dan berkas pembuluh xilem-floem pada tumbuhan.',
    topic: 'Struktur dan Fungsi Jaringan Tumbuhan',
    prompt:
      'Berdasarkan ilustrasi struktur anatomi daun di atas, jaringan yang mengandung paling banyak kloroplas sebagai tempat berlangsungnya proses fotosintesis paling aktif serta jaringan pengangkut hasil fotosintesis ke seluruh tubuh tumbuhan berturut-turut ditunjukkan oleh ....',
    options: [
      'Epidermis atas dan Xilem',
      'Mesofil palisade (jaringan tiang) dan Floem',
      'Kutikula dan Stoma',
      'Epidermis bawah dan Ruang udara',
    ],
    correctIndex: 1,
    explanation:
      'Mesofil palisade tersusun rapat di bawah epidermis atas dan kaya akan kloroplas untuk menangkap cahaya matahari maksimal. Sementara floem (pembuluh tapis) berfungsi mengedarkan glukosa hasil fotosintesis dari daun ke seluruh bagian tumbuhan.',
    source: 'bank',
  },
  {
    id: 'bank-smp-mtk-1',
    jenjang: 'SMP',
    kelas: 'Kelas 8 SMP',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Matematika',
    difficulty: 'sedang',
    learningMethod: 'STEM / STEAM Terintegrasi',
    hasImage: true,
    svgDiagram: `<svg viewBox="0 0 360 175" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
      <rect x="0" y="0" width="360" height="175" fill="#f8fafc" rx="8"/>
      <polygon points="80,140 240,140 80,35" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.5"/>
      <rect x="80" y="125" width="15" height="15" fill="none" stroke="#1e3a8a" stroke-width="2"/>
      <text x="64" y="92" text-anchor="end" font-size="14" font-weight="600" fill="#0f172a">9 cm</text>
      <text x="160" y="158" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">12 cm</text>
      <text x="175" y="78" font-size="14" font-weight="700" fill="#1e3a8a">c = ? cm</text>
    </svg>`,
    imageCaption: 'Segitiga siku-siku dengan panjang sisi tegak 9 cm dan alas 12 cm.',
    topic: 'Teorema Pythagoras',
    prompt:
      'Sebuah penyangga rak berbentuk segitiga siku-siku digambarkan seperti diagram di atas. Panjang sisi miring (c) penyangga rak tersebut adalah ....',
    options: ['13 cm', '15 cm', '18 cm', '21 cm'],
    correctIndex: 1,
    explanation:
      'Menurut Teorema Pythagoras, c² = a² + b² = 9² + 12² = 81 + 144 = 225. Jadi c = √225 = 15 cm.',
    source: 'bank',
  },
  {
    id: 'bank-smp-ips-1',
    jenjang: 'SMP',
    kelas: 'Kelas 7 SMP',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Ilmu Pengetahuan Sosial (IPS Terpadu)',
    difficulty: 'mudah',
    learningMethod: 'Sekolah Adiwiyata (Berbasis Lingkungan)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_peta_nusantara_1794805203502.jpg',
    imageCaption: 'Peta astronomis dan posisi silang kepulauan Indonesia.',
    topic: 'Letak Strategis dan Keanekaragaman Hayati',
    prompt:
      'Perhatikan peta kepulauan Indonesia di atas. Indonesia terletak di antara dua samudra dan dua benua. Pengaruh utama letak geografis posisi silang tersebut terhadap kegiatan ekonomi masyarakat Indonesia adalah ....',
    options: [
      'Indonesia mengalami empat musim sepanjang tahun seperti Eropa',
      'Indonesia menjadi jalur persimpangan perdagangan dan pelayaran internasional yang strategis',
      'Indonesia tidak memiliki aktivitas gunung berapi aktif',
      'Seluruh wilayah Indonesia beriklim gurun yang kering',
    ],
    correctIndex: 1,
    explanation:
      'Posisi silang Indonesia di antara Benua Asia dan Benua Australia serta Samudra Hindia dan Samudra Pasifik menjadikan Indonesia jalur lintas perdagangan maritim dunia yang sangat strategis.',
    source: 'bank',
  },
  {
    id: 'bank-smp-bing-1',
    jenjang: 'SMP',
    kelas: 'Kelas 8 SMP',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Bahasa Inggris',
    difficulty: 'sedang',
    learningMethod: 'Flipped Classroom (Pendalaman Mandiri)',
    hasImage: false,
    topic: 'Recount Text & Past Tense',
    prompt:
      'Read the sentence: "Last Sunday, my classmates and I ______ the botanical garden to observe endemic plants for our science project." Which verb correctly completes the sentence?',
    options: ['visit', 'visits', 'visited', 'are visiting'],
    correctIndex: 2,
    explanation:
      'Penanda waktu "Last Sunday" menunjukkan peristiwa lampau (Simple Past Tense), sehingga kata kerja yang tepat adalah bentuk lampau (Verb 2), yaitu "visited".',
    source: 'bank',
  },

  // === SMA ===
  {
    id: 'bank-sma-fisika-1',
    jenjang: 'SMA',
    kelas: 'Kelas 12 SMA',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Fisika',
    difficulty: 'sulit',
    learningMethod: 'Problem-Based Learning (PBL)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_rangkaian_listrik_1794805203822.jpg',
    imageCaption: 'Skema perbandingan rangkaian listrik DC seri dan paralel dengan sumber 3 V.',
    topic: 'Hukum Ohm dan Rangkaian Arus Searah',
    prompt:
      'Perhatikan rangkaian paralel (gambar kanan) dengan sumber baterai E = 3 V (hambatan dalam diabaikan). Jika lampu A memiliki hambatan R_A = 6 Ω dan lampu B memiliki hambatan R_B = 3 Ω, maka besar kuat arus total (I_total) yang keluar dari sumber baterai saat sakelar ON adalah ....',
    options: ['0,5 A', '1,0 A', '1,5 A', '3,0 A'],
    correctIndex: 2,
    explanation:
      'Hambatan pengganti paralel: 1/R_p = 1/6 + 1/3 = 3/6 → R_p = 2 Ω. Menggunakan Hukum Ohm: I_total = V / R_p = 3 V / 2 Ω = 1,5 A (dengan I_A = 0,5 A dan I_B = 1,0 A).',
    source: 'bank',
  },
  {
    id: 'bank-sma-biologi-1',
    jenjang: 'SMA',
    kelas: 'Kelas 12 SMA',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Biologi',
    difficulty: 'sulit',
    learningMethod: 'HOTS & Literasi-Numerasi (AKM/ANBK)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_fotosintesis_daun_1794805202550.jpg',
    imageCaption: 'Penampang daun dan struktur kloroplas tempat berlangsungnya reaksi terang dan gelap.',
    topic: 'Metabolisme Sel: Fotosintesis',
    prompt:
      'Berdasarkan diagram kloroplas pada sudut kanan atas ilustrasi fotosintesis, reaksi terang yang memecah molekul air (fotolisis) untuk menghasilkan O₂, ATP, dan NADPH berlangsung di bagian ..., sedangkan fiksasi CO₂ pada siklus Calvin berlangsung di ....',
    options: [
      'Stroma; Membran tilakoid (grana)',
      'Membran tilakoid (grana); Stroma',
      'Dinding sel; Nukleus',
      'Xilem; Floem',
    ],
    correctIndex: 1,
    explanation:
      'Pada kloroplas, reaksi terang (penangkapan foton dan fotolisis H₂O) terjadi di membran tilakoid/grana, sedangkan reaksi gelap (siklus Calvin untuk fiksasi CO₂ menjadi glukosa) berlangsung di stroma.',
    source: 'bank',
  },
  {
    id: 'bank-sma-mtk-1',
    jenjang: 'SMA',
    kelas: 'Kelas 12 SMA',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Matematika (Umum / Wajib)',
    difficulty: 'sulit',
    learningMethod: 'Project-Based Learning (PjBL)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_geometri_bangun_1794805202993.jpg',
    imageCaption: 'Ilustrasi bangun ruang tiga dimensi: prisma segitiga siku-siku, tabung, dan limas segiempat.',
    topic: 'Geometri Dimensi Tiga',
    prompt:
      'Perhatikan limas segiempat beraturan V.PQRS pada bagian kanan ilustrasi di atas. Jika alas PQRS berbentuk persegi dengan sisi l = w = 6 cm dan tinggi tegak limas dari puncak V ke pusat alas adalah 4 cm, maka tinggi sisi tegak segitiga (apotema s) adalah ....',
    options: ['4 cm', '5 cm', '6 cm', '7 cm'],
    correctIndex: 1,
    explanation:
      'Jarak dari pusat persegi ke tepi sisi alas adalah setengah panjang sisi alas = 6 / 2 = 3 cm. Dengan tinggi limas = 4 cm membentuk segitiga siku-siku, tinggi sisi tegak s = √(3² + 4²) = √(9 + 16) = 5 cm.',
    source: 'bank',
  },
  {
    id: 'bank-sma-ekonomi-1',
    jenjang: 'SMA',
    kelas: 'Kelas 10 SMA',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Ekonomi & Akuntansi',
    difficulty: 'sedang',
    learningMethod: 'HOTS & Literasi-Numerasi (AKM/ANBK)',
    hasImage: true,
    svgDiagram: `<svg viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
      <rect x="0" y="0" width="360" height="190" fill="#f8fafc" rx="8"/>
      <line x1="55" y1="20" x2="55" y2="155" stroke="#334155" stroke-width="2"/>
      <line x1="55" y1="155" x2="320" y2="155" stroke="#334155" stroke-width="2"/>
      <text x="48" y="25" text-anchor="end" font-size="12" font-weight="600" fill="#0f172a">P (Rp)</text>
      <text x="318" y="172" text-anchor="end" font-size="12" font-weight="600" fill="#0f172a">Q (Unit)</text>
      <line x1="80" y1="40" x2="265" y2="140" stroke="#dc2626" stroke-width="2.5"/>
      <text x="270" y="142" font-size="12" font-weight="700" fill="#dc2626">D (Permintaan)</text>
      <line x1="80" y1="140" x2="265" y2="40" stroke="#1e3a8a" stroke-width="2.5"/>
      <text x="270" y="42" font-size="12" font-weight="700" fill="#1e3a8a">S (Penawaran)</text>
      <circle cx="172.5" cy="90" r="5" fill="#059669"/>
      <line x1="55" y1="90" x2="172.5" y2="90" stroke="#64748b" stroke-dasharray="4 3" stroke-width="1.5"/>
      <line x1="172.5" y1="90" x2="172.5" y2="155" stroke="#64748b" stroke-dasharray="4 3" stroke-width="1.5"/>
      <text x="48" y="94" text-anchor="end" font-size="11" font-weight="600" fill="#059669">15.000</text>
      <text x="172.5" y="170" text-anchor="middle" font-size="11" font-weight="600" fill="#059669">400</text>
      <text x="184" y="88" font-size="11" font-weight="700" fill="#059669">E</text>
    </svg>`,
    imageCaption: 'Kurva keseimbangan pasar antara permintaan (D) dan penawaran (S).',
    topic: 'Keseimbangan Pasar',
    prompt:
      'Berdasarkan kurva permintaan (D) dan penawaran (S) di atas, apabila pemerintah menetapkan harga dasar (floor price) di atas titik keseimbangan E (misalnya Rp20.000), maka dampak yang akan terjadi di pasar adalah ....',
    options: [
      'Kelebihan permintaan (excess demand) atau kelangkaan barang',
      'Kelebihan penawaran (excess supply) karena jumlah barang ditawarkan melebihi permintaan',
      'Titik keseimbangan bergeser langsung ke Rp0',
      'Kurva permintaan dan penawaran menjadi sejajar horizontal',
    ],
    correctIndex: 1,
    explanation:
      'Harga di atas titik keseimbangan E (Rp15.000) mendorong produsen menawarkan lebih banyak barang (Q_S > 400), sementara konsumen mengurangi pembelian (Q_D < 400), sehingga timbul kelebihan penawaran (surplus/excess supply).',
    source: 'bank',
  },
  {
    id: 'bank-sma-geografi-1',
    jenjang: 'SMA',
    kelas: 'Kelas 11 SMA',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Geografi',
    difficulty: 'sedang',
    learningMethod: 'Sekolah Adiwiyata (Berbasis Lingkungan)',
    hasImage: true,
    imageUrl: '/src/assets/images/illus_peta_nusantara_1794805203502.jpg',
    imageCaption: 'Peta fisik Indonesia, arus laut lintas Indonesia (Arlindo), dan batas lempeng.',
    topic: 'Poros Maritim & Dinamika Iklim',
    prompt:
      'Perhatikan peta aliran arus laut lintas Indonesia (Indonesia Throughflow / Arlindo) pada ilustrasi di atas. Aliran massa air hangat dari Samudra Pasifik menuju Samudra Hindia melalui perairan Indonesia terjadi terutama karena ....',
    options: [
      'Pembekuan es di Laut Jawa sepanjang musim kemarau',
      'Perbedaan tinggi muka laut dan gradien tekanan antara Samudra Pasifik barat dan Samudra Hindia',
      'Tidak adanya selat laut di wilayah Indonesia timur',
      'Tarikan gravitasi pegunungan Bukit Barisan',
    ],
    correctIndex: 1,
    explanation:
      'Arus Lintas Indonesia (Arlindo) mengalir dari Samudra Pasifik yang memiliki elevasi permukaan laut lebih tinggi akibat angin pasat menuju Samudra Hindia melalui Selat Makassar, Laut Flores, dan Laut Banda.',
    source: 'bank',
  },
  {
    id: 'bank-sma-informatika-1',
    jenjang: 'SMA',
    kelas: 'Kelas 10 SMA',
    kurikulum: 'Kurikulum Merdeka',
    mapel: 'Informatika',
    difficulty: 'sedang',
    learningMethod: 'Sekolah Digital / Smart School',
    hasImage: false,
    topic: 'Berpikir Komputasional & Algoritma',
    prompt:
      'Dalam menyusun algoritma pencarian data pada daftar nilai 1.000 siswa yang sudah terurut dari nilai terkecil hingga terbesar, algoritma yang paling efisien karena membagi ruang pencarian menjadi setengah di setiap langkah adalah ....',
    options: [
      'Linear Search (Pencarian Beruntun)',
      'Bubble Sort',
      'Binary Search (Pencarian Biner)',
      'Brute Force Search',
    ],
    correctIndex: 2,
    explanation:
      'Binary Search bekerja pada data terurut dengan membandingkan elemen tengah dan memangkas separuh data yang tidak relevan setiap langkahnya, sehingga kompleksitas waktunya O(log n) jauh lebih cepat dibanding Linear Search O(n).',
    source: 'bank',
  },
];
