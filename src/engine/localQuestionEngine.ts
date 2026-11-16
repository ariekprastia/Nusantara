import type {
  ConcreteDifficulty,
  DifficultyOption,
  Jenjang,
  Kurikulum,
  QuestionItem,
} from '../types/exam.ts';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeNumericOptions(
  correctVal: number,
  unit: string,
  spread: number[],
  decimals = 0
): { options: string[]; correctIndex: number } {
  const fmt = (n: number) =>
    decimals > 0
      ? n.toFixed(decimals).replace('.', ',')
      : Math.round(n).toLocaleString('id-ID');

  const distractors = new Set<string>();
  const correctStr = unit ? `${fmt(correctVal)} ${unit}` : fmt(correctVal);

  for (const delta of spread) {
    const candidate = correctVal + delta;
    if (candidate >= 0) {
      const s = unit ? `${fmt(candidate)} ${unit}` : fmt(candidate);
      if (s !== correctStr) distractors.add(s);
    }
  }
  let step = 1;
  while (distractors.size < 4) {
    const candidate = Math.max(1, correctVal + step * (spread[0] > 0 ? 1 : 2));
    const s = unit ? `${fmt(candidate)} ${unit}` : fmt(candidate);
    if (s !== correctStr) distractors.add(s);
    step++;
  }

  const chosen = [correctStr, ...Array.from(distractors).slice(0, 3)];
  const shuffled = shuffle(chosen);
  return {
    options: shuffled,
    correctIndex: shuffled.indexOf(correctStr),
  };
}

interface ParametricContext {
  jenjang: Jenjang;
  kelas: string;
  kurikulum: Kurikulum;
  mapel: string;
  difficulty: ConcreteDifficulty;
  learningMethodName: string;
  wantsImage: boolean;
  seq: number;
}

function buildMathQuestion(ctx: ParametricContext): QuestionItem {
  const id = `param-mtk-${Date.now()}-${ctx.seq}-${Math.random().toString(36).slice(2, 6)}`;
  const optionCount = ctx.jenjang === 'SMA' ? 5 : 4;

  // Variant 1: SD Fractions / Area with SVG
  if (ctx.jenjang === 'SD') {
    if (ctx.wantsImage && ctx.seq % 2 === 0) {
      const denom = pickOne([4, 5, 6, 8]);
      const num = randInt(1, denom - 1);
      const mult = randInt(2, 4);
      const p = randInt(6, 15) * 2;
      const l = randInt(4, 10);
      if (ctx.difficulty === 'mudah') {
        const cols = denom;
        const cellW = Math.floor(240 / cols);
        const rects = Array.from({ length: cols }, (_, i) => {
          const fill = i < num ? '#1e3a8a' : '#ffffff';
          return `<rect x="${80 + i * cellW}" y="65" width="${cellW}" height="56" fill="${fill}" stroke="#1e3a8a" stroke-width="2"/>`;
        }).join('');
        const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><text x="200" y="38" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">Pita Pecahan (${cols} Bagian Sama Besar)</text>${rects}<text x="200" y="160" text-anchor="middle" font-size="13" fill="#334155">Bagian berwarna biru = ${num} dari ${cols} kotak</text></svg>`;
        const ans = `${num}/${cols}`;
        const pool = shuffle([
          ans,
          `${cols - num}/${cols}`,
          `${num}/${cols + 1}`,
          `${num + 1}/${cols}`,
        ]);
        return {
          id,
          ...ctx,
          learningMethod: ctx.learningMethodName,
          hasImage: true,
          svgDiagram,
          imageCaption: `Diagram pita pecahan dengan ${cols} bagian sama besar.`,
          topic: 'Bilangan Pecahan Senilai',
          prompt: `Melalui pendekatan ${ctx.learningMethodName}, perhatikan gambar pita pecahan di atas. Nilai pecahan yang ditunjukkan oleh bagian berwarna biru tua (senilai dengan ${num * mult}/${cols * mult}) adalah ....`,
          options: pool,
          correctIndex: pool.indexOf(ans),
          explanation: `Terdapat ${num} kotak berwarna biru dari total ${cols} kotak sama besar, sehingga pecahannya adalah ${num}/${cols} (yang senilai dengan ${num * mult}/${cols * mult}).`,
          source: 'parametric',
        };
      }
      const luas = p * l;
      const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><rect x="95" y="45" width="210" height="110" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.5"/><text x="200" y="178" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">Panjang (p) = ${p} cm</text><text x="318" y="105" font-size="14" font-weight="700" fill="#1e3a8a">l = ${l} cm</text></svg>`;
      const { options, correctIndex } = makeNumericOptions(luas, 'cm²', [-12, 10, 24, -6]);
      return {
        id,
        ...ctx,
        learningMethod: ctx.learningMethodName,
        hasImage: true,
        svgDiagram,
        imageCaption: `Sketsa taman persegi panjang dengan ukuran ${p} cm × ${l} cm.`,
        topic: 'Luas & Keliling Bangun Datar',
        prompt: `Perhatikan gambar denah bidang persegi panjang di atas. Dalam kegiatan ${ctx.learningMethodName}, siswa diminta menghitung luas bidang tersebut. Luasnya adalah ....`,
        options,
        correctIndex,
        explanation: `Luas persegi panjang = panjang × lebar = ${p} cm × ${l} cm = ${luas} cm².`,
        source: 'parametric',
      };
    }

    const harga = randInt(3, 9) * 1000;
    const qty = randInt(3, 8);
    const diskon = ctx.difficulty === 'sulit' ? 2000 : 0;
    const total = harga * qty - diskon;
    const { options, correctIndex } = makeNumericOptions(
      total,
      '',
      [-2000, 3000, 5000, -4000]
    );
    return {
      id,
      ...ctx,
      learningMethod: ctx.learningMethodName,
      hasImage: false,
      topic: 'Operasi Hitung Bilangan Cacah',
      prompt: `Dalam konteks ${ctx.learningMethodName}, seorang siswa membeli ${qty} buku tulis dengan harga satuan Rp${harga.toLocaleString('id-ID')}${diskon > 0 ? ` dan memperoleh potongan harga total Rp${diskon.toLocaleString('id-ID')}` : ''}. Total uang yang harus dibayar adalah Rp....`,
      options,
      correctIndex,
      explanation: `Total harga = (${qty} × Rp${harga.toLocaleString('id-ID')})${diskon > 0 ? ` - Rp${diskon.toLocaleString('id-ID')}` : ''} = Rp${total.toLocaleString('id-ID')}.`,
      source: 'parametric',
    };
  }

  // Variant 2: SMP Pythagoras / Bar Chart / Linear
  if (ctx.jenjang === 'SMP') {
    if (ctx.wantsImage) {
      if (ctx.seq % 2 === 0) {
        const triples: Array<[number, number, number]> = [
          [6, 8, 10],
          [9, 12, 15],
          [5, 12, 13],
          [8, 15, 17],
          [12, 16, 20],
        ];
        const [a, b, c] = pickOne(triples);
        const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><polygon points="110,165 290,165 110,45" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.5"/><rect x="110" y="150" width="15" height="15" fill="none" stroke="#1e3a8a" stroke-width="2"/><text x="96" y="110" text-anchor="end" font-size="14" font-weight="700" fill="#0f172a">${a} cm</text><text x="200" y="186" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">${b} cm</text><text x="220" y="96" font-size="14" font-weight="700" fill="#1e3a8a">c = ? cm</text></svg>`;
        const { options, correctIndex } = makeNumericOptions(c, 'cm', [-2, 2, 4, -3]);
        return {
          id,
          ...ctx,
          learningMethod: ctx.learningMethodName,
          hasImage: true,
          svgDiagram,
          imageCaption: `Segitiga siku-siku dengan sisi tegak ${a} cm dan alas ${b} cm.`,
          topic: 'Teorema Pythagoras',
          prompt: `Berdasarkan metode ${ctx.learningMethodName}, amati diagram segitiga siku-siku di atas. Panjang sisi miring (hipotenusa c) adalah ....`,
          options,
          correctIndex,
          explanation: `Menggunakan Teorema Pythagoras: c = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b} = ${c} cm.`,
          source: 'parametric',
        };
      }
      const d1 = randInt(6, 9) * 10;
      const d2 = randInt(6, 9) * 10;
      const d3 = randInt(6, 9) * 10;
      const d4 = 300 - (d1 + d2 + d3);
      const mean = (d1 + d2 + d3 + d4) / 4;
      const vals = [d1, d2, d3, Math.max(40, d4)];
      const actualMean = vals.reduce((acc, v) => acc + v, 0) / 4;
      const bars = vals
        .map((v, i) => {
          const h = Math.round((v / 100) * 110);
          const x = 85 + i * 65;
          const y = 165 - h;
          return `<rect x="${x}" y="${y}" width="38" height="${h}" fill="#1e3a8a" rx="4"/><text x="${x + 19}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">${v}</text><text x="${x + 19}" y="182" text-anchor="middle" font-size="11" fill="#334155">Kl. ${i + 1}</text>`;
        })
        .join('');
      const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><line x1="60" y1="165" x2="355" y2="165" stroke="#475569" stroke-width="2"/><text x="200" y="28" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Diagram Batang Nilai Proyek 4 Kelompok</text>${bars}</svg>`;
      const { options, correctIndex } = makeNumericOptions(
        actualMean,
        '',
        [-5, 5, 10, -8],
        actualMean % 1 === 0 ? 0 : 1
      );
      return {
        id,
        ...ctx,
        learningMethod: ctx.learningMethodName,
        hasImage: true,
        svgDiagram,
        imageCaption: `Diagram batang capaian nilai 4 kelompok siswa (skala 0–100).`,
        topic: 'Statistika: Rata-rata (Mean)',
        prompt: `Perhatikan diagram batang nilai hasil ${ctx.learningMethodName} di atas (nilai aktual masing-masing kelompok tertera di atas batang). Nilai rata-rata (mean) keempat kelompok tersebut (mengacu total ${vals.reduce((a, b) => a + b, 0)}) adalah ....`,
        options,
        correctIndex,
        explanation: `Rata-rata = (${vals.join(' + ')}) / 4 = ${vals.reduce((a, b) => a + b, 0)} / 4 = ${actualMean % 1 === 0 ? actualMean : actualMean.toFixed(1).replace('.', ',')} (catatan nilai kelompok awal ${mean ? '' : ''}).`,
        source: 'parametric',
      };
    }

    const a = randInt(2, 6);
    const xAns = randInt(3, 12);
    const b = randInt(4, 15);
    const c = a * xAns + b;
    const { options, correctIndex } = makeNumericOptions(xAns, '', [-2, 2, 4, -1]);
    return {
      id,
      ...ctx,
      learningMethod: ctx.learningMethodName,
      hasImage: false,
      topic: 'Persamaan Linear Satu Variabel',
      prompt: `Diketahui persamaan linear ${a}x + ${b} = ${c}. Nilai x yang memenuhi persamaan tersebut adalah ....`,
      options,
      correctIndex,
      explanation: `${a}x = ${c} - ${b} → ${a}x = ${c - b} → x = ${c - b} / ${a} = ${xAns}.`,
      source: 'parametric',
    };
  }

  // Variant 3: SMA Functions / Sequences / Geometry
  if (ctx.wantsImage) {
    const r = pickOne([7, 14]);
    const h = randInt(8, 15);
    const vol = (22 / 7) * r * r * h;
    const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><ellipse cx="200" cy="60" rx="58" ry="18" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.2"/><path d="M142,60 L142,160 A58,18 0 0,0 258,160 L258,60" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2.2"/><ellipse cx="200" cy="160" rx="58" ry="18" fill="none" stroke="#1e3a8a" stroke-width="1.8" stroke-dasharray="4 3"/><line x1="200" y1="60" x2="258" y2="60" stroke="#dc2626" stroke-width="2"/><text x="228" y="54" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">r = ${r} cm</text><text x="274" y="114" font-size="13" font-weight="700" fill="#0f172a">t = ${h} cm</text></svg>`;
    const { options, correctIndex } = makeNumericOptions(vol, 'cm³', [-308, 308, 616, -154]);
    while (options.length < optionCount) {
      options.push(`${(vol + (options.length + 1) * 440).toLocaleString('id-ID')} cm³`);
    }
    return {
      id,
      ...ctx,
      learningMethod: ctx.learningMethodName,
      hasImage: true,
      svgDiagram,
      imageCaption: `Model silinder berjari-jari r = ${r} cm dan tinggi t = ${h} cm.`,
      topic: 'Geometri Ruang & Pengukuran',
      prompt: `Dalam proyek ${ctx.learningMethodName}, sebuah wadah berbentuk tabung seperti ilustrasi memiliki jari-jari r = ${r} cm dan tinggi t = ${h} cm (π = 22/7). Volume maksimal wadah tersebut adalah ....`,
      options: options.slice(0, optionCount),
      correctIndex,
      explanation: `Volume tabung V = π × r² × t = (22/7) × ${r}² × ${h} = ${vol.toLocaleString('id-ID')} cm³.`,
      source: 'parametric',
    };
  }

  const u1 = randInt(3, 12);
  const beda = randInt(2, 7);
  const n = randInt(8, 15);
  const un = u1 + (n - 1) * beda;
  const { options, correctIndex } = makeNumericOptions(un, '', [-beda, beda, 2 * beda, -2 * beda]);
  while (options.length < optionCount) {
    options.push(String(un + (options.length + 2) * beda));
  }
  return {
    id,
    ...ctx,
    learningMethod: ctx.learningMethodName,
    hasImage: false,
    topic: 'Barisan dan Deret Aritmetika',
    prompt: `Diketahui barisan aritmetika dengan suku pertama U₁ = ${u1} dan beda b = ${beda}. Nilai suku ke-${n} (U_${n}) adalah ....`,
    options: options.slice(0, optionCount),
    correctIndex,
    explanation: `Rumus suku ke-n barisan aritmetika adalah Uₙ = a + (n - 1)b = ${u1} + (${n} - 1)×${beda} = ${u1} + ${(n - 1) * beda} = ${un}.`,
    source: 'parametric',
  };
}

function buildScienceQuestion(ctx: ParametricContext): QuestionItem {
  const id = `param-sci-${Date.now()}-${ctx.seq}-${Math.random().toString(36).slice(2, 6)}`;
  const optionCount = ctx.jenjang === 'SMA' ? 5 : 4;
  const lowerMapel = ctx.mapel.toLowerCase();

  if (lowerMapel.includes('fisika') || (lowerMapel.includes('ipa') && ctx.seq % 2 === 0)) {
    if (ctx.wantsImage) {
      const r1 = pickOne([4, 6, 8, 12]);
      const r2 = pickOne([4, 6, 12]);
      const v = pickOne([12, 24, 36]);
      const rTotal = r1 + r2;
      const iVal = Number((v / rTotal).toFixed(2));
      const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><rect x="75" y="48" width="250" height="125" fill="none" stroke="#1e3a8a" stroke-width="2.5" rx="6"/><rect x="130" y="34" width="54" height="26" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" rx="4"/><text x="157" y="51" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">R₁=${r1}Ω</text><rect x="216" y="34" width="54" height="26" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" rx="4"/><text x="243" y="51" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">R₂=${r2}Ω</text><rect x="165" y="158" width="70" height="28" fill="#fef3c7" stroke="#d97706" stroke-width="2" rx="4"/><text x="200" y="176" text-anchor="middle" font-size="12" font-weight="700" fill="#92400e">V = ${v} V</text><text x="200" y="112" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">Rangkaian Seri DC</text></svg>`;
      const { options, correctIndex } = makeNumericOptions(
        iVal,
        'A',
        [-0.5, 0.5, 1, 1.5],
        iVal % 1 === 0 ? 0 : 2
      );
      while (options.length < optionCount) {
        options.push(`${(iVal + options.length * 0.75).toFixed(2).replace('.', ',')} A`);
      }
      return {
        id,
        ...ctx,
        learningMethod: ctx.learningMethodName,
        hasImage: true,
        svgDiagram,
        imageCaption: `Skema rangkaian seri dengan R₁ = ${r1} Ω, R₂ = ${r2} Ω, dan sumber ${v} V.`,
        topic: 'Hukum Ohm & Rangkaian Seri',
        prompt: `Perhatikan skema rangkaian listrik seri pada gambar di atas. Besar kuat arus listrik (I) yang mengalir dalam rangkaian tersebut adalah ....`,
        options: options.slice(0, optionCount),
        correctIndex,
        explanation: `Pada rangkaian seri, hambatan total R_total = R₁ + R₂ = ${r1} + ${r2} = ${rTotal} Ω. Dengan Hukum Ohm: I = V / R_total = ${v} / ${rTotal} = ${String(iVal).replace('.', ',')} A.`,
        source: 'parametric',
      };
    }

    const m = randInt(2, 10);
    const a = randInt(2, 6);
    const f = m * a;
    const { options, correctIndex } = makeNumericOptions(f, 'N', [-4, 4, 8, -2]);
    while (options.length < optionCount) {
      options.push(`${f + options.length * 6} N`);
    }
    return {
      id,
      ...ctx,
      learningMethod: ctx.learningMethodName,
      hasImage: false,
      topic: 'Hukum II Newton tentang Gerak',
      prompt: `Dalam eksperimen ${ctx.learningMethodName}, sebuah benda bermassa ${m} kg didorong di atas permukaan datar licin sehingga mengalami percepatan ${a} m/s². Besar gaya resultan yang bekerja pada benda tersebut adalah ....`,
      options: options.slice(0, optionCount),
      correctIndex,
      explanation: `Berdasarkan Hukum II Newton, F = m × a = ${m} kg × ${a} m/s² = ${f} N.`,
      source: 'parametric',
    };
  }

  if (lowerMapel.includes('kimia')) {
    const ph = pickOne([2, 3, 5, 7, 9, 11, 13]);
    const sifat =
      ph < 7
        ? 'Asam kuat/lemah (memerahkan kertas lakmus biru)'
        : ph === 7
          ? 'Netral (tidak mengubah warna kertas lakmus)'
          : 'Basa kuat/lemah (membirukan kertas lakmus merah)';
    const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><text x="200" y="38" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">Indikator Skala pH Larutan (0–14)</text><rect x="40" y="75" width="120" height="32" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/><rect x="160" y="75" width="80" height="32" fill="#dcfce7" stroke="#059669" stroke-width="1.5"/><rect x="240" y="75" width="120" height="32" fill="#dbeafe" stroke="#1e3a8a" stroke-width="1.5"/><text x="100" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#991b1b">Asam (0–6)</text><text x="200" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#065f46">Netral (7)</text><text x="300" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#1e3a8a">Basa (8–14)</text><circle cx="${40 + (ph / 14) * 320}" cy="135" r="8" fill="#0f172a"/><text x="${40 + (ph / 14) * 320}" y="162" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Sampel pH = ${ph}</text></svg>`;
    const opts = shuffle([
      sifat,
      'Bersifat gas mulia stabil yang tidak bereaksi dengan air',
      ph < 7
        ? 'Basa (membirukan kertas lakmus merah)'
        : 'Asam (memerahkan kertas lakmus biru)',
      'Larutan koloid jenuh tanpa ion terlarut',
      'Zat radioaktif pengemisi sinar alfa',
    ]).slice(0, optionCount);
    if (!opts.includes(sifat)) opts[0] = sifat;
    return {
      id,
      ...ctx,
      learningMethod: ctx.learningMethodName,
      hasImage: ctx.wantsImage,
      svgDiagram: ctx.wantsImage ? svgDiagram : undefined,
      imageCaption: ctx.wantsImage ? `Posisi nilai pH = ${ph} pada skala asam-basa.` : undefined,
      topic: 'Larutan Asam, Basa, dan pH',
      prompt: `${ctx.wantsImage ? 'Perhatikan skala pH pada ilustrasi di atas. ' : ''}Sebuah sampel larutan diuji menggunakan pH meter dan menunjukkan angka pH = ${ph}. Sifat kimia larutan sampel tersebut yang tepat adalah ....`,
      options: opts,
      correctIndex: opts.indexOf(sifat),
      explanation: `Larutan dengan pH < 7 bersifat asam (memerahkan lakmus biru), pH = 7 bersifat netral, dan pH > 7 bersifat basa (membirukan lakmus merah). Karena pH = ${ph}, sifatnya ${sifat}.`,
      source: 'parametric',
    };
  }

  // Biologi / IPA umum / IPAS
  const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><text x="200" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Piramida Energi Ekosistem</text><polygon points="200,45 90,185 310,185" fill="#ecfdf5" stroke="#059669" stroke-width="2"/><line x1="126" y1="138" x2="274" y2="138" stroke="#059669" stroke-width="1.5"/><line x1="162" y1="92" x2="238" y2="92" stroke="#059669" stroke-width="1.5"/><text x="200" y="78" text-anchor="middle" font-size="11" font-weight="700" fill="#065f46">Konsumen II</text><text x="200" y="120" text-anchor="middle" font-size="11" font-weight="700" fill="#065f46">Konsumen I (Herbivora)</text><text x="200" y="168" text-anchor="middle" font-size="12" font-weight="700" fill="#064e3b">Produsen (Tumbuhan Hijau)</text></svg>`;
  const ans = 'Populasi produsen menempati dasar piramida dengan jumlah energi terbesar';
  const opts = [
    ans,
    'Konsumen puncak memiliki biomassa dan energi paling besar di ekosistem',
    'Energi berpindah 100% utuh dari produsen ke konsumen tingkat II',
    'Produsen memperoleh energi utama dengan memangsa herbivora',
  ];
  if (optionCount === 5) opts.push('Pengurai tidak berperan dalam siklus materi ekosistem');
  const shuffled = shuffle(opts);
  return {
    id,
    ...ctx,
    learningMethod: ctx.learningMethodName,
    hasImage: ctx.wantsImage,
    svgDiagram: ctx.wantsImage ? svgDiagram : undefined,
    imageCaption: ctx.wantsImage ? 'Bagan tingkat trofik pada piramida energi ekosistem.' : undefined,
    topic: 'Ekosistem & Aliran Energi',
    prompt: `Melalui pendekatan ${ctx.learningMethodName}${ctx.wantsImage ? ' dan pengamatan bagan piramida energi di atas' : ''}, pernyataan yang paling tepat mengenai hubungan antar-tingkat trofik dalam ekosistem seimbang adalah ....`,
    options: shuffled,
    correctIndex: shuffled.indexOf(ans),
    explanation: `Produsen (tumbuhan hijau autotrof) menangkap energi matahari melalui fotosintesis dan menyediakan energi dasar terbesar bagi seluruh rantai makanan di atasnya.`,
    source: 'parametric',
  };
}

function buildSocialEconomyQuestion(ctx: ParametricContext): QuestionItem {
  const id = `param-soc-${Date.now()}-${ctx.seq}-${Math.random().toString(36).slice(2, 6)}`;
  const optionCount = ctx.jenjang === 'SMA' ? 5 : 4;
  const lower = ctx.mapel.toLowerCase();

  if (lower.includes('ekonomi')) {
    const pEq = pickOne([10000, 15000, 20000, 25000]);
    const qEq = pickOne([200, 300, 400, 500]);
    const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><line x1="65" y1="25" x2="65" y2="175" stroke="#334155" stroke-width="2"/><line x1="65" y1="175" x2="350" y2="175" stroke="#334155" stroke-width="2"/><line x1="95" y1="45" x2="310" y2="155" stroke="#dc2626" stroke-width="2.5"/><line x1="95" y1="155" x2="310" y2="45" stroke="#1e3a8a" stroke-width="2.5"/><circle cx="202.5" cy="100" r="5" fill="#059669"/><line x1="65" y1="100" x2="202.5" y2="100" stroke="#64748b" stroke-dasharray="4 3"/><line x1="202.5" y1="100" x2="202.5" y2="175" stroke="#64748b" stroke-dasharray="4 3"/><text x="58" y="104" text-anchor="end" font-size="11" font-weight="700" fill="#059669">${pEq.toLocaleString('id-ID')}</text><text x="202.5" y="192" text-anchor="middle" font-size="11" font-weight="700" fill="#059669">${qEq}</text><text x="315" y="156" font-size="12" font-weight="700" fill="#dc2626">D</text><text x="315" y="48" font-size="12" font-weight="700" fill="#1e3a8a">S</text><text x="212" y="96" font-size="12" font-weight="700" fill="#059669">E</text></svg>`;
    const ans = `Harga keseimbangan Rp${pEq.toLocaleString('id-ID')} dan kuantitas keseimbangan ${qEq} unit`;
    const opts = [
      ans,
      `Harga keseimbangan Rp${(pEq + 5000).toLocaleString('id-ID')} dan kuantitas ${qEq + 150} unit`,
      `Terjadi kelangkaan permanen di titik E`,
      `Penawaran selalu bernilai nol saat harga Rp${pEq.toLocaleString('id-ID')}`,
    ];
    if (optionCount === 5) opts.push(`Kurva permintaan bergeser ke kiri ketika harga tetap`);
    const shuffled = shuffle(opts);
    return {
      id,
      ...ctx,
      learningMethod: ctx.learningMethodName,
      hasImage: ctx.wantsImage,
      svgDiagram: ctx.wantsImage ? svgDiagram : undefined,
      imageCaption: ctx.wantsImage
        ? `Titik keseimbangan pasar E pada P = Rp${pEq.toLocaleString('id-ID')} dan Q = ${qEq}.`
        : undefined,
      topic: 'Mekanisme Harga & Keseimbangan Pasar',
      prompt: `Dalam analisis studi kasus ${ctx.learningMethodName}, apabila kurva permintaan (D) dan kurva penawaran (S) berpotongan di titik E${ctx.wantsImage ? ' seperti pada grafik di atas' : ` dengan P = Rp${pEq.toLocaleString('id-ID')} dan Q = ${qEq} unit`}, maka kondisi keseimbangan pasar yang terbentuk adalah ....`,
      options: shuffled,
      correctIndex: shuffled.indexOf(ans),
      explanation: `Titik keseimbangan pasar (Equilibrium E) tercapai saat jumlah barang yang diminta sama dengan jumlah yang ditawarkan pada tingkat harga Rp${pEq.toLocaleString('id-ID')} dan kuantitas ${qEq} unit.`,
      source: 'parametric',
    };
  }

  const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><text x="200" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Pembagian Zona Waktu Wilayah Indonesia</text><rect x="35" y="68" width="100" height="84" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" rx="6"/><rect x="150" y="68" width="100" height="84" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" rx="6"/><rect x="265" y="68" width="100" height="84" fill="#ecfdf5" stroke="#059669" stroke-width="2" rx="6"/><text x="85" y="102" text-anchor="middle" font-size="13" font-weight="700" fill="#1e3a8a">WIB (UTC+7)</text><text x="85" y="124" text-anchor="middle" font-size="11" fill="#334155">Sumatra, Jawa</text><text x="200" y="102" text-anchor="middle" font-size="13" font-weight="700" fill="#0369a1">WITA (UTC+8)</text><text x="200" y="124" text-anchor="middle" font-size="11" fill="#334155">Bali, Kalimantan, Sulawesi</text><text x="315" y="102" text-anchor="middle" font-size="13" font-weight="700" fill="#065f46">WIT (UTC+9)</text><text x="315" y="124" text-anchor="middle" font-size="11" fill="#334155">Maluku, Papua</text></svg>`;
  const jamWib = randInt(7, 15);
  const jamWit = jamWib + 2;
  const ans = `Pukul ${String(jamWit).padStart(2, '0')}.00 WIT`;
  const opts = [
    ans,
    `Pukul ${String(jamWib + 1).padStart(2, '0')}.00 WIT`,
    `Pukul ${String(Math.max(1, jamWib - 2)).padStart(2, '0')}.00 WIT`,
    `Pukul ${String(jamWib).padStart(2, '0')}.00 WIT`,
  ];
  if (optionCount === 5) opts.push(`Pukul ${String(jamWib + 3).padStart(2, '0')}.00 WIT`);
  const shuffled = shuffle(opts);
  return {
    id,
    ...ctx,
    learningMethod: ctx.learningMethodName,
    hasImage: ctx.wantsImage,
    svgDiagram: ctx.wantsImage ? svgDiagram : undefined,
    imageCaption: ctx.wantsImage ? 'Bagan zona waktu WIB, WITA, dan WIT di Indonesia.' : undefined,
    topic: 'Letak Astronomis & Pembagian Waktu Indonesia',
    prompt: `${ctx.wantsImage ? 'Perhatikan bagan pembagian zona waktu di atas. ' : ''}Sebuah rapat koordinasi sekolah dimulai pada pukul ${String(jamWib).padStart(2, '0')}.00 WIB di Jakarta. Peserta dari Jayapura (zona waktu WIT) harus bergabung pada pukul ....`,
    options: shuffled,
    correctIndex: shuffled.indexOf(ans),
    explanation: `Selisih waktu antara WIB (UTC+7) dan WIT (UTC+9) adalah +2 jam. Sehingga pukul ${String(jamWib).padStart(2, '0')}.00 WIB sama dengan pukul ${String(jamWit).padStart(2, '0')}.00 WIT.`,
    source: 'parametric',
  };
}

function buildGeneralCurriculumQuestion(ctx: ParametricContext): QuestionItem {
  const id = `param-gen-${Date.now()}-${ctx.seq}-${Math.random().toString(36).slice(2, 6)}`;
  const optionCount = ctx.jenjang === 'SMA' ? 5 : 4;
  const lower = ctx.mapel.toLowerCase();

  let topic = `Kompetensi Inti ${ctx.mapel}`;
  let promptBody = '';
  let correctAns = '';
  let distractors: string[] = [];
  let explanation = '';

  if (lower.includes('indonesia')) {
    topic = 'Literasi Teks & Kalimat Efektif';
    promptBody =
      'Perhatikan kalimat berikut: "Para siswa-siswa diwajibkan untuk segera mengumpulkan laporan hasil pengamatan tepat pada waktunya." Perbaikan kalimat tersebut agar menjadi kalimat efektif sesuai kaidah PUEBI/EYD V adalah ....';
    correctAns =
      'Para siswa diwajibkan segera mengumpulkan laporan hasil pengamatan tepat waktu.';
    distractors = [
      'Semua para siswa-siswa diwajibkan mengumpulkan laporan tepat pada waktunya.',
      'Siswa-siswa sekalian diwajibkan untuk agar segera mengumpulkan laporan.',
      'Para siswa-siswa wajib untuk mengumpulkan hasil pengamatan laporan tepat waktu.',
      'Para siswa-siswa diwajibkan segera untuk mengumpulkan laporan pengamatan.',
    ];
    explanation =
      'Kata "para" sudah menyatakan jamak sehingga tidak perlu diulang dengan "siswa-siswa" (pleonasme), serta penggunaan preposisi "untuk" sebelum "segera" dapat dihilangkan agar efektif.';
  } else if (lower.includes('inggris')) {
    topic = 'Reading Comprehension & Functional Grammar';
    promptBody =
      'Read the notice: "Please keep the laboratory clean and return all microscopes to the cabinet after completing your observation." What is the main purpose of the notice?';
    correctAns = 'To remind students to maintain cleanliness and store lab equipment properly';
    distractors = [
      'To forbid students from entering the science laboratory',
      'To announce the cancellation of biology experiments',
      'To ask students to buy new microscopes for the school',
      'To invite parents to clean the school library',
    ];
    explanation =
      'Kata kunci "keep the laboratory clean" dan "return all microscopes to the cabinet" bertujuan mengingatkan siswa menjaga kebersihan dan merapikan alat setelah praktikum.';
  } else if (lower.includes('pancasila') || lower.includes('ppkn')) {
    topic = 'Nilai Pancasila & Konstitusi UUD 1945';
    promptBody =
      'Dalam penerapan tata tertib sekolah yang berlandaskan Pancasila dan UUD NRI Tahun 1945, sikap warga sekolah yang mencerminkan keseimbangan antara hak dan kewajiban adalah ....';
    correctAns =
      'Menuntut hak memperoleh pembelajaran bermutu sekaligus menaati peraturan sekolah dengan disiplin';
    distractors = [
      'Mengutamakan kepentingan pribadi di atas kesepakatan musyawarah kelas',
      'Menuntut hak nilai maksimal tanpa melaksanakan tugas belajar',
      'Mengabaikan kebersihan lingkungan sekolah karena merasa sudah membayar iuran',
      'Menolak menghargai perbedaan pendapat saat diskusi kelompok',
    ];
    explanation =
      'Setiap warga negara dan peserta didik memiliki hak dan kewajiban yang seimbang: menerima hak pendidikan sambil menjalankan kewajiban menaati aturan bersama.';
  } else if (lower.includes('agama')) {
    topic = 'Akhlak Mulia & Moderasi Beragama';
    promptBody =
      'Di lingkungan sekolah yang majemuk, sikap toleransi dan budi pekerti luhur yang paling tepat ditunjukkan peserta didik ketika teman berbeda keyakinan sedang menjalankan ibadah adalah ....';
    correctAns =
      'Menghormati dengan menjaga ketenangan dan tidak mengganggu jalannya ibadah mereka';
    distractors = [
      'Memaksakan kebiasaan pribadi agar diikuti seluruh teman di kelas',
      'Menghindari kerja sama kelompok belajar karena perbedaan latar belakang',
      'Membuat kegaduhan di dekat ruang ibadah sekolah',
      'Meremehkan tradisi keagamaan yang berbeda dari dirinya',
    ];
    explanation =
      'Pendidikan Agama & Budi Pekerti menekankan akhlak mulia, saling menghormati kebebasan beribadah, dan menjaga kerukunan antarumat beragama.';
  } else if (lower.includes('informatika')) {
    topic = 'Berpikir Komputasional & Literasi Digital';
    promptBody =
      'Seorang siswa memecah tugas pembuatan aplikasi sekolah menjadi bagian kecil: desain tampilan, penyimpanan data, dan pengujian. Konsep berpikir komputasional yang diterapkan tersebut adalah ....';
    correctAns = 'Dekomposisi (Decomposition)';
    distractors = [
      'Perulangan tak hingga (Infinite Loop)',
      'Enkripsi data simetris (Symmetric Encryption)',
      'Pemformatan perangkat keras (Hard Reset)',
      'Duplikasi data berulang (Redundancy)',
    ];
    explanation =
      'Dekomposisi adalah pilar berpikir komputasional berupa pemecahan masalah kompleks menjadi sub-masalah kecil yang lebih mudah dikelola dan diselesaikan.';
  } else if (lower.includes('pjok')) {
    topic = 'Kebugaran Jasmani & Pola Hidup Sehat';
    promptBody =
      'Sebelum melakukan olahraga inti seperti lari jarak menengah atau permainan bola basket, peserta didik wajib melakukan pemanasan (warming up) dengan tujuan utama ....';
    correctAns =
      'Meningkatkan suhu otot secara bertahap dan menyiapkan sendi guna mencegah cedera';
    distractors = [
      'Menghabiskan seluruh cadangan energi sebelum pertandingan dimulai',
      'Menghentikan aliran darah menuju otot kaki dan tangan',
      'Menggantikan kebutuhan minum air putih selama latihan',
      'Menurunkan detak jantung hingga kondisi tidur',
    ];
    explanation =
      'Pemanasan mempersiapkan sistem kardiovaskular, meningkatkan elastisitas otot dan kelenturan sendi sehingga risiko kram atau cedera berkurang drastis.';
  } else if (lower.includes('seni') || lower.includes('prakarya') || lower.includes('pkwu')) {
    topic = 'Kreativitas Karya, Budaya & Kewirausahaan';
    promptBody =
      'Dalam merancang produk kerajinan atau karya seni berbasis limbah ramah lingkungan, langkah awal yang paling menentukan keberhasilan karya adalah ....';
    correctAns =
      'Mengidentifikasi potensi bahan lokal, fungsi guna, dan sketsa rancangan produk';
    distractors = [
      'Langsung menjual produk tanpa melalui tahap perancangan dan uji kualitas',
      'Menggunakan bahan kimia berbahaya agar proses pembuatan lebih cepat',
      'Meniru persis kemasan produk luar negeri tanpa inovasi',
      'Mengabaikan keselamatan kerja saat memakai alat potong',
    ];
    explanation =
      'Perencanaan matang mulai dari riset bahan lokal, nilai fungsi/estetika, hingga pembuatan sketsa desain menjadi fondasi utama dalam Seni Budaya dan Prakarya.';
  } else {
    topic = `Analisis Konsep ${ctx.mapel}`;
    promptBody = `Dalam penerapan ${ctx.learningMethodName} pada mata pelajaran ${ctx.mapel} (${ctx.kelas}, ${ctx.kurikulum}), langkah berpikir paling tepat untuk menyimpulkan fenomena atau data belajar secara objektif adalah ....`;
    correctAns =
      'Mengumpulkan bukti/fakta terverifikasi, membandingkan antar-konsep, lalu menarik simpulan logis';
    distractors = [
      'Menarik kesimpulan secara tergesa-gesa berdasarkan asumsi pribadi tanpa data',
      'Mengabaikan informasi pembanding yang bertentangan dengan dugaan awal',
      'Menyalin pendapat tanpa memahami keterkaitan sebab-akibat materi',
      'Menghindari diskusi dan pengujian ulang terhadap temuan awal',
    ];
    explanation = `Pendekatan ${ctx.learningMethodName} menuntut peserta didik menguji fakta secara sistematis dan menyusun simpulan berbasis bukti pada materi ${ctx.mapel}.`;
  }

  const svgDiagram = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><text x="200" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Alur Penalaran Materi: ${ctx.mapel.slice(0, 26)}</text><rect x="28" y="68" width="96" height="64" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="8"/><text x="76" y="96" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a8a">1. Stimulus</text><text x="76" y="114" text-anchor="middle" font-size="10" fill="#475569">Identifikasi Fakta</text><line x1="124" y1="100" x2="150" y2="100" stroke="#1e3a8a" stroke-width="2"/><rect x="152" y="68" width="96" height="64" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" rx="8"/><text x="200" y="96" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">2. Analisis</text><text x="200" y="114" text-anchor="middle" font-size="10" fill="#1e3a8a">Uji Konsep Inti</text><line x1="248" y1="100" x2="274" y2="100" stroke="#1e3a8a" stroke-width="2"/><rect x="276" y="68" width="96" height="64" fill="#ecfdf5" stroke="#059669" stroke-width="2" rx="8"/><text x="324" y="96" text-anchor="middle" font-size="11" font-weight="700" fill="#065f46">3. Simpulan</text><text x="324" y="114" text-anchor="middle" font-size="10" fill="#047857">Solusi Terukur</text><text x="200" y="170" text-anchor="middle" font-size="11" fill="#64748b">Metode: ${ctx.learningMethodName.slice(0, 42)}</text></svg>`;

  const options = shuffle([correctAns, ...distractors.slice(0, optionCount - 1)]);
  return {
    id,
    jenjang: ctx.jenjang,
    kelas: ctx.kelas,
    kurikulum: ctx.kurikulum,
    mapel: ctx.mapel,
    difficulty: ctx.difficulty,
    learningMethod: ctx.learningMethodName,
    hasImage: ctx.wantsImage,
    svgDiagram: ctx.wantsImage ? svgDiagram : undefined,
    imageCaption: ctx.wantsImage
      ? `Diagram alur penalaran ${ctx.mapel} dengan metode ${ctx.learningMethodName}.`
      : undefined,
    topic,
    prompt: `${ctx.wantsImage ? 'Amati diagram alur penalaran di atas sebagai panduan konteks. ' : ''}${promptBody}`,
    options,
    correctIndex: options.indexOf(correctAns),
    explanation,
    source: 'parametric',
  };
}

export function generateParametricQuestion(ctx: ParametricContext): QuestionItem {
  const lower = ctx.mapel.toLowerCase();
  if (lower.includes('matematika')) {
    return buildMathQuestion(ctx);
  }
  if (
    lower.includes('ipa') ||
    lower.includes('ipas') ||
    lower.includes('fisika') ||
    lower.includes('kimia') ||
    lower.includes('biologi')
  ) {
    return buildScienceQuestion(ctx);
  }
  if (
    lower.includes('ips') ||
    lower.includes('ekonomi') ||
    lower.includes('geografi') ||
    lower.includes('sejarah') ||
    lower.includes('sosiologi') ||
    lower.includes('antropologi')
  ) {
    return buildSocialEconomyQuestion(ctx);
  }
  return buildGeneralCurriculumQuestion(ctx);
}

export function generateLocalExamPackage(params: {
  bank: QuestionItem[];
  jenjang: Jenjang;
  kelas: string;
  kurikulum: Kurikulum;
  mapel: string;
  learningMethodName: string;
  difficulty: DifficultyOption;
  totalQuestions: number;
  imageQuestionsCount: number;
}): {
  questions: QuestionItem[];
  meta: { fromBank: number; fromParametric: number; imageCount: number };
} {
  const {
    bank,
    jenjang,
    kelas,
    kurikulum,
    mapel,
    learningMethodName,
    difficulty,
    totalQuestions,
    imageQuestionsCount,
  } = params;

  const matchingBank = bank.filter((q) => {
    const matchJenjang = q.jenjang === jenjang;
    const matchMapel =
      q.mapel.toLowerCase() === mapel.toLowerCase() ||
      q.mapel.toLowerCase().includes(mapel.toLowerCase()) ||
      mapel.toLowerCase().includes(q.mapel.toLowerCase());
    const matchDiff = difficulty === 'campuran' || q.difficulty === difficulty;
    return matchJenjang && matchMapel && matchDiff;
  });

  const bankImages = shuffle(matchingBank.filter((q) => q.hasImage)).slice(
    0,
    imageQuestionsCount
  );
  const textNeededTotal = totalQuestions - imageQuestionsCount;
  const bankTexts = shuffle(matchingBank.filter((q) => !q.hasImage)).slice(
    0,
    textNeededTotal
  );

  const missingImages = imageQuestionsCount - bankImages.length;
  const missingTexts = textNeededTotal - bankTexts.length;

  const generated: QuestionItem[] = [];
  const diffCycle: ConcreteDifficulty[] = ['mudah', 'sedang', 'sulit'];

  for (let i = 0; i < missingImages; i++) {
    const d =
      difficulty === 'campuran' ? diffCycle[i % diffCycle.length] : difficulty;
    generated.push(
      generateParametricQuestion({
        jenjang,
        kelas,
        kurikulum,
        mapel,
        difficulty: d,
        learningMethodName,
        wantsImage: true,
        seq: i + 1,
      })
    );
  }

  for (let j = 0; j < missingTexts; j++) {
    const d =
      difficulty === 'campuran'
        ? diffCycle[(j + missingImages) % diffCycle.length]
        : difficulty;
    generated.push(
      generateParametricQuestion({
        jenjang,
        kelas,
        kurikulum,
        mapel,
        difficulty: d,
        learningMethodName,
        wantsImage: false,
        seq: missingImages + j + 1,
      })
    );
  }

  const combined = shuffle([...bankImages, ...bankTexts, ...generated]).slice(
    0,
    totalQuestions
  );

  return {
    questions: combined,
    meta: {
      fromBank: bankImages.length + bankTexts.length,
      fromParametric: generated.length,
      imageCount: combined.filter((q) => q.hasImage).length,
    },
  };
}
