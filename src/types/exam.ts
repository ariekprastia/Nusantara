export type Jenjang = 'SD' | 'SMP' | 'SMA';
export type Kurikulum = 'Kurikulum Merdeka' | 'Kurikulum 2013';
export type ConcreteDifficulty = 'mudah' | 'sedang' | 'sulit';
export type DifficultyOption = ConcreteDifficulty | 'campuran';
export type SimulationMode = 'ujian' | 'latihan';

export type LearningMethodCategoryId =
  | 'utama_populer'
  | 'inovatif_tren'
  | 'karakteristik_sekolah';

export interface LearningMethodOption {
  id: string;
  category: LearningMethodCategoryId;
  categoryLabel: string;
  name: string;
  description: string;
}

export interface SubjectOption {
  id: string;
  name: string;
  group: string;
  kurikulumSupport: Kurikulum[];
  phaseNote?: string;
}

export interface QuestionItem {
  id: string;
  jenjang: Jenjang;
  kelas: string;
  kurikulum: Kurikulum;
  mapel: string;
  difficulty: ConcreteDifficulty;
  learningMethod: string;
  hasImage: boolean;
  imageUrl?: string;
  svgDiagram?: string;
  imageCaption?: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: 'bank' | 'parametric' | 'sheets';
}

export interface ExamConfig {
  studentName: string;
  studentClass: string;
  schoolName: string;
  jenjang: Jenjang;
  kelas: string;
  kurikulum: Kurikulum;
  mapel: string;
  learningMethodId: string;
  learningMethodName: string;
  learningMethodCategory: string;
  mode: SimulationMode;
  totalQuestions: number;
  imageQuestionsCount: number;
  difficulty: DifficultyOption;
  durationMinutes: number;
}

export interface ExamSession {
  sessionId: string;
  config: ExamConfig;
  questions: QuestionItem[];
  answers: Record<number, number>;
  flagged: number[];
  checkedPractice: number[];
  activeIndex: number;
  remainingSeconds: number;
  isLocked: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface ExamResult {
  id: string;
  studentName: string;
  studentClass: string;
  schoolName: string;
  jenjang: Jenjang;
  kelas: string;
  kurikulum: Kurikulum;
  mapel: string;
  learningMethod: string;
  difficulty: DifficultyOption;
  mode: SimulationMode;
  score: number;
  kkm: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  durationUsedSeconds: number;
  breakdownByDifficulty: {
    mudah: { correct: number; total: number };
    sedang: { correct: number; total: number };
    sulit: { correct: number; total: number };
  };
  wrongItems: Array<{
    questionNumber: number;
    question: QuestionItem;
    selectedAnswerIndex: number | null;
  }>;
  allAnswers: Record<number, number>;
  questions: QuestionItem[];
  timestamp: string;
}

export interface PublicAdminConfig {
  defaultKkm: number;
  defaultDurationMinutes: number;
  spreadsheetId: string;
  schoolTitle: string;
}

export interface AdminConfig extends PublicAdminConfig {
  adminPassword: string;
  unlockPin: string;
}
