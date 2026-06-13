export type StandardFocus = 'VS.3' | 'VS.4';
export type ReadingLevel = 'below' | 'on' | 'above';

export interface Session {
  id: string;
  code: string;
  standard: StandardFocus;
  readingLevel: ReadingLevel;
  createdAt: number;
}

export interface Scores {
  survival: number;    // 0-100
  economy: number;     // 0-100
  diplomacy: number;   // 0-100
  governance: number;  // 0-100
}

export interface DecisionOption {
  id: string;
  text: string;
  shortText: string;
  scores: Partial<Scores>;
  misconceptionTag?: string;
  coachingCorrect: string;
  coachingMisconception?: string;
}

export interface DecisionNode {
  id: string;
  title: string;
  historicalContext: string;
  prompt: string;
  options: DecisionOption[];
  order: number;
}

export interface StudentDecision {
  nodeId: string;
  optionId: string;
  reasoning: string;
  timestamp: number;
}

export interface StudentResult {
  id: string;
  sessionId: string;
  displayName: string;
  standard?: StandardFocus; // which standard was this for?
  decisions: StudentDecision[];
  finalScores: Scores;
  misconceptionTags: string[];
  completedAt: number;
}

export type View =
  | { kind: 'home' }
  | { kind: 'simulator' }
  | { kind: 'teacher-setup' }
  | { kind: 'teacher-dashboard'; sessionId: string }
  | { kind: 'student-join' }
  | { kind: 'student-sim'; sessionId: string; studentId: string; studentName: string }
  | { kind: 'student-debrief'; sessionId: string; studentId: string }
  | { kind: 'settings' };
