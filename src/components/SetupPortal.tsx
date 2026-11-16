import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Image as ImageIcon,
  Layers,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import {
  JENJANG_CLASSES,
  KURIKULUM_DESCRIPTIONS,
  LEARNING_METHODS,
  LEARNING_METHOD_CATEGORIES,
  SUBJECTS_BY_JENJANG,
} from '../data/curriculum.ts';
import type {
  DifficultyOption,
  ExamConfig,
  Jenjang,
  Kurikulum,
  LearningMethodCategoryId,
  PublicAdminConfig,
  SimulationMode,
} from '../types/exam.ts';

interface SetupPortalProps {
  publicConfig: PublicAdminConfig;
  isGenerating: boolean;
  generationError: string | null;
  onStartSimulation: (config: ExamConfig) => void;
}

export const SetupPortal: React.FC<SetupPortalProps> = ({
  publicConfig,
  isGenerating,
  generationError,
  onStartSimulation,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [nameError, setNameError] = useState('');

  const [mode, setMode] = useState<SimulationMode>('ujian');
  const [jenjang, setJenjang] = useState<Jenjang>('SMP');
  const [kelas, setKelas] = useState<string>(JENJANG_CLASSES.SMP[0].label);
  const [kurikulum, setKurikulum] = useState<Kurikulum>('Kurikulum Merdeka');

  const availableSubjects = SUBJECTS_BY_JENJANG[jenjang].filter((s) =>
    s.kurikulumSupport.includes(kurikulum)
  );
  const [mapel, setMapel] = useState<string>(availableSubjects[3]?.name || availableSubjects[0].name);

  const [methodCategory, setMethodCategory] =
    useState<LearningMethodCategoryId>('utama_populer');
  const categoryMethods = LEARNING_METHODS.filter((m) => m.category === methodCategory);
  const [learningMethodId, setLearningMethodId] = useState<string>(LEARNING_METHODS[0].id);

  const [totalQuestionsInput, setTotalQuestionsInput] = useState<string>('10');
  const [imageQuestionsInput, setImageQuestionsInput] = useState<string>('2');
  const [difficulty, setDifficulty] = useState<DifficultyOption>('campuran');
  const [durationInput, setDurationInput] = useState<string>(
    String(publicConfig.defaultDurationMinutes || 30)
  );

  const parsedTotal = Math.max(1, Math.min(50, Number(totalQuestionsInput) || 1));
  const parsedImages = Math.max(
    0,
    Math.min(parsedTotal, Number(imageQuestionsInput) || 0)
  );
  const parsedDuration = Math.max(5, Math.min(180, Number(durationInput) || 30));

  const selectedMethod =
    LEARNING_METHODS.find((m) => m.id === learningMethodId) || LEARNING_METHODS[0];

  const handleJenjangChange = (nextJenjang: Jenjang) => {
    setJenjang(nextJenjang);
    const nextClasses = JENJANG_CLASSES[nextJenjang];
    setKelas(nextClasses[0].label);
    const nextSubjects = SUBJECTS_BY_JENJANG[nextJenjang].filter((s) =>
      s.kurikulumSupport.includes(kurikulum)
    );
    if (nextSubjects.length > 0) {
      setMapel(nextSubjects[0].name);
    }
  };

  const handleKurikulumChange = (nextKurikulum: Kurikulum) => {
    setKurikulum(nextKurikulum);
    const nextSubjects = SUBJECTS_BY_JENJANG[jenjang].filter((s) =>
      s.kurikulumSupport.includes(nextKurikulum)
    );
    if (nextSubjects.length > 0 && !nextSubjects.some((s) => s.name === mapel)) {
      setMapel(nextSubjects[0].name);
    }
  };

  const handleMethodCategoryChange = (cat: LearningMethodCategoryId) => {
    setMethodCategory(cat);
    const firstInCat = LEARNING_METHODS.find((m) => m.category === cat);
    if (firstInCat) {
      setLearningMethodId(firstInCat.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = studentName.trim();
    if (!trimmedName) {
      setNameError('Nama peserta didik wajib diisi dan tidak boleh kosong.');
      const el = document.getElementById('student-name-input');
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setNameError('');
    onStartSimulation({
      studentName: trimmedName,
      studentClass: studentClass.trim() || kelas,
      schoolName: schoolName.trim(),
      jenjang,
      kelas,
      kurikulum,
      mapel,
      learningMethodId: selectedMethod.id,
      learningMethodName: selectedMethod.name,
      learningMethodCategory: selectedMethod.categoryLabel,
      mode,
      totalQuestions: parsedTotal,
      imageQuestionsCount: parsedImages,
      difficulty,
      durationMinutes: mode === 'ujian' ? parsedDuration : parsedDuration,
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Title Block */}
      <section className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-900">
              Portal Asesmen Digital Indonesia
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
              Simulasi Ujian Online &amp; Latihan Mandiri SD, SMP, SMA
            </h1>
            <p className="mt-2.5 text-base leading-relaxed text-slate-600">
              Lengkap untuk seluruh mata pelajaran Kurikulum Merdeka dan Kurikulum 2013, dilengkapi soal ilustrasi gambar, pilihan metode pembelajaran, serta evaluasi pembahasan soal yang salah.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 shrink-0">
            <span className="font-semibold text-emerald-700">100% Gratis Tanpa Token &amp; API</span>
            <span aria-hidden="true">·</span>
            <span>Kurikulum Merdeka &amp; K-13</span>
            <span aria-hidden="true">·</span>
            <span>Google Sheets &amp; GAS</span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Configuration Column */}
        <div className="space-y-8 lg:col-span-8">
          {/* 1. Identitas Peserta Didik & Mode */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <GraduationCap className="h-5 w-5 text-blue-900" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                01. Identitas Peserta Didik &amp; Mode Simulasi
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="student-name-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Nama Peserta Didik <span className="text-red-600">* (Wajib diisi)</span>
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (nameError && e.target.value.trim()) setNameError('');
                  }}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className={`mt-1.5 w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                    nameError
                      ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-red-200'
                      : 'border-slate-300 bg-white focus:border-blue-900 focus:ring-blue-900/15'
                  }`}
                />
                {nameError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="student-class-input" className="block text-sm font-medium text-slate-700">
                  Rombel / Kelas (Opsional)
                </label>
                <input
                  id="student-class-input"
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder={`Default: ${kelas}`}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
                />
              </div>

              <div>
                <label htmlFor="school-name-input" className="block text-sm font-medium text-slate-700">
                  Asal Sekolah (Opsional)
                </label>
                <input
                  id="school-name-input"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: SMP Negeri 1 Nusantara"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
                />
              </div>
            </div>

            <div className="mt-6">
              <span className="block text-sm font-semibold text-slate-800">
                Pilih Mode Pembelajaran
              </span>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode('ujian')}
                  className={`flex flex-col items-start rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                    mode === 'ujian'
                      ? 'border-blue-900 bg-blue-50/70 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900">
                    Simulasi Ujian Resmi (CBT Timer)
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-600">
                    Menggunakan penghitung waktu mundur, penilaian akhir serentak, dan pembahasan soal salah setelah selesai.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('latihan')}
                  className={`flex flex-col items-start rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                    mode === 'latihan'
                      ? 'border-blue-900 bg-blue-50/70 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900">
                    Simulasi Pembelajaran Latihan Mandiri
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-600">
                    Dilengkapi tombol cek jawaban &amp; pembahasan langsung per soal agar siswa bisa belajar bertahap sebelum dikumpulkan.
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Jenjang, Kurikulum & Mata Pelajaran */}
          <section
            id="kurikulum-section"
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <BookOpen className="h-5 w-5 text-blue-900" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                02. Jenjang Pendidikan, Kurikulum &amp; Mata Pelajaran
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <span className="block text-sm font-semibold text-slate-800">Jenjang Sekolah</span>
                <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
                  {(['SD', 'SMP', 'SMA'] as Jenjang[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleJenjangChange(item)}
                      className={`rounded-md py-2 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        jenjang === item
                          ? 'bg-blue-900 text-white shadow-sm'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="kelas-select" className="block text-sm font-semibold text-slate-800">
                  Tingkat Kelas
                </label>
                <select
                  id="kelas-select"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
                >
                  {JENJANG_CLASSES[jenjang].map((c) => (
                    <option key={c.label} value={c.label}>
                      {c.label} ({c.faseMerdeka})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <span className="block text-sm font-semibold text-slate-800">Kurikulum Berlaku</span>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(['Kurikulum Merdeka', 'Kurikulum 2013'] as Kurikulum[]).map((kur) => (
                  <button
                    key={kur}
                    type="button"
                    onClick={() => handleKurikulumChange(kur)}
                    className={`rounded-lg border p-3.5 text-left transition-colors cursor-pointer ${
                      kurikulum === kur
                        ? 'border-blue-900 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-900">
                      {KURIKULUM_DESCRIPTIONS[kur].title}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {KURIKULUM_DESCRIPTIONS[kur].structure}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="mapel-select" className="block text-sm font-semibold text-slate-800">
                Mata Pelajaran ({availableSubjects.length} Mapel Tersedia untuk {jenjang})
              </label>
              <select
                id="mapel-select"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name} — {sub.group}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 3. Metode Pembelajaran (3 Kategori Lengkap) */}
          <section
            id="metode-section"
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Layers className="h-5 w-5 text-blue-900" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                03. Metode &amp; Pendekatan Pembelajaran
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 rounded-lg bg-slate-100 p-1 sm:grid-cols-3">
              {LEARNING_METHOD_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleMethodCategoryChange(cat.id)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-center ${
                    methodCategory === cat.id
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-600">
              {LEARNING_METHOD_CATEGORIES.find((c) => c.id === methodCategory)?.subtitle}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categoryMethods.map((method) => {
                const active = learningMethodId === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setLearningMethodId(method.id)}
                    className={`rounded-lg border p-3.5 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-blue-900 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-900">{method.name}</div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-600">
                      {method.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Parameter Jumlah Soal, Kesulitan, Gambar & Timer */}
          <section
            id="parameter-section"
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Clock className="h-5 w-5 text-blue-900" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                04. Jumlah Soal, Tingkat Kesulitan, Ilustrasi Gambar &amp; Timer
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="total-questions-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Jumlah Soal (Isi Manual)
                </label>
                <input
                  id="total-questions-input"
                  type="number"
                  min={1}
                  max={50}
                  value={totalQuestionsInput}
                  onChange={(e) => {
                    setTotalQuestionsInput(e.target.value);
                    const nextTotal = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                    if (Number(imageQuestionsInput) > nextTotal) {
                      setImageQuestionsInput(String(nextTotal));
                    }
                  }}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-semibold tabular-nums text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
                />
                <p className="mt-1 text-xs text-slate-500">Rentang 1 sampai 50 butir soal.</p>
              </div>

              <div>
                <label
                  htmlFor="image-questions-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Jumlah Soal dengan Gambar
                </label>
                <input
                  id="image-questions-input"
                  type="number"
                  min={0}
                  max={parsedTotal}
                  value={imageQuestionsInput}
                  onChange={(e) => setImageQuestionsInput(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-semibold tabular-nums text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Maksimal {parsedTotal} soal (ilustrasi gambar/diagram).
                </p>
              </div>

              <div>
                <label
                  htmlFor="timer-duration-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Setting Timer (Menit)
                </label>
                <input
                  id="timer-duration-input"
                  type="number"
                  min={5}
                  max={180}
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm font-semibold tabular-nums text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {mode === 'ujian'
                    ? 'Hitung mundur aktif selama ujian berlangsung.'
                    : 'Acuan target durasi saat latihan mandiri.'}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <span className="block text-sm font-semibold text-slate-800">
                Pilihan Tingkat Kesulitan Soal
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {(
                  [
                    { id: 'mudah', label: 'Mudah', desc: 'C1–C2 Dasar' },
                    { id: 'sedang', label: 'Sedang', desc: 'C3–C4 Aplikasi' },
                    { id: 'sulit', label: 'Sulit', desc: 'C5–C6 HOTS' },
                    { id: 'campuran', label: 'Campuran', desc: 'Proporsional' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      difficulty === d.id
                        ? 'border-blue-900 bg-blue-900 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-bold">{d.label}</div>
                    <div
                      className={`text-xs ${
                        difficulty === d.id ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {d.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview contoh ilustrasi gambar yang tersedia */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <ImageIcon className="h-4 w-4 text-blue-900" />
                <span>Contoh Ilustrasi Visual Kurikulum yang Tersedia</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    src: '/src/assets/images/illus_fotosintesis_daun_1794805202550.jpg',
                    label: 'Biologi / IPA Daun',
                  },
                  {
                    src: '/src/assets/images/illus_rangkaian_listrik_1794805203822.jpg',
                    label: 'Fisika Rangkaian Listrik',
                  },
                  {
                    src: '/src/assets/images/illus_geometri_bangun_1794805202993.jpg',
                    label: 'Matematika Bangun Ruang',
                  },
                  {
                    src: '/src/assets/images/illus_peta_nusantara_1794805203502.jpg',
                    label: 'Geografi / IPS Nusantara',
                  },
                ].map((thumb) => (
                  <div
                    key={thumb.src}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={thumb.src}
                      alt={thumb.label}
                      referrerPolicy="no-referrer"
                      className="h-20 w-full object-cover"
                    />
                    <div className="px-2 py-1.5 text-[11px] font-medium text-slate-700 truncate">
                      {thumb.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Sticky Summary Column */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Ringkasan Paket Simulasi
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pastikan nama dan parameter ujian sudah sesuai sebelum generate soal.
            </p>

            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Peserta Didik</dt>
                <dd className="font-semibold text-slate-900 text-right truncate max-w-[190px]">
                  {studentName.trim() || 'Belum diisi'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Mode</dt>
                <dd className="font-semibold text-blue-900 text-right">
                  {mode === 'ujian' ? 'Simulasi Ujian' : 'Latihan Mandiri'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Jenjang / Kelas</dt>
                <dd className="font-medium text-slate-900 text-right">{kelas}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Kurikulum</dt>
                <dd className="font-medium text-slate-900 text-right">{kurikulum}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Mata Pelajaran</dt>
                <dd className="font-semibold text-slate-900 text-right max-w-[190px]">
                  {mapel}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Metode Belajar</dt>
                <dd className="font-medium text-slate-900 text-right max-w-[190px]">
                  {selectedMethod.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Jumlah Soal</dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900">
                  {parsedTotal} butir ({parsedImages} bergambar)
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Tingkat Kesulitan</dt>
                <dd className="font-medium capitalize text-slate-900">{difficulty}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500">Timer</dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900">
                  {parsedDuration} menit
                </dd>
              </div>
            </dl>

            {generationError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{generationError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <span>{isGenerating ? 'Menyusun Paket Soal...' : 'Generate Soal & Mulai'}</span>
              {!isGenerating && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 border border-slate-200">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-900 mt-0.5" />
              <span>
                Setelah soal digenerate, navigasi kembali ke Beranda dan Generate Soal Baru akan terkunci oleh <strong>PIN Admin</strong>.
              </span>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
};
