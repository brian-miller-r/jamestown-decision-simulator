import type { Session, StudentResult, Scores, DecisionNode } from './types';

const STORAGE_SESSIONS = 'jamestown_sessions';
const STORAGE_RESULTS = 'jamestown_results';

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSessions(): Session[] {
  return load<Session>(STORAGE_SESSIONS);
}

export function getSessionByCode(code: string): Session | undefined {
  return getSessions().find(s => s.code === code);
}

export function getSessionById(id: string): Session | undefined {
  return getSessions().find(s => s.id === id);
}

export function createSession(standard: Session['standard'], readingLevel: Session['readingLevel']): Session {
  const sessions = getSessions();
  const code = 'JMS' + String(Math.floor(1000 + Math.random() * 9000));
  const session: Session = {
    id: crypto.randomUUID(),
    code,
    standard,
    readingLevel,
    createdAt: Date.now(),
  };
  sessions.push(session);
  save(STORAGE_SESSIONS, sessions);
  return session;
}

export function getResults(sessionId?: string): StudentResult[] {
  const all = load<StudentResult>(STORAGE_RESULTS);
  return sessionId ? all.filter(r => r.sessionId === sessionId) : all;
}

export function getResult(studentId: string): StudentResult | undefined {
  return getResults().find(r => r.id === studentId);
}

export function saveResult(result: StudentResult) {
  const results = getResults();
  const idx = results.findIndex(r => r.id === result.id);
  if (idx >= 0) results[idx] = result;
  else results.push(result);
  save(STORAGE_RESULTS, results);
}

export function computeScores(decisions: StudentResult['decisions'], allNodes: DecisionNode[]): Scores {
  const scores: Scores = { survival: 30, economy: 30, diplomacy: 30, governance: 30 };
  for (const decision of decisions) {
    const node = allNodes.find(n => n.id === decision.nodeId);
    const option = node?.options.find(o => o.id === decision.optionId);
    if (!option) continue;
    scores.survival = clamp(scores.survival + (option.scores.survival ?? 0));
    scores.economy = clamp(scores.economy + (option.scores.economy ?? 0));
    scores.diplomacy = clamp(scores.diplomacy + (option.scores.diplomacy ?? 0));
    scores.governance = clamp(scores.governance + (option.scores.governance ?? 0));
  }
  return scores;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function extractMisconceptions(decisions: StudentResult['decisions'], allNodes: DecisionNode[]): string[] {
  const tags: string[] = [];
  for (const decision of decisions) {
    const node = allNodes.find(n => n.id === decision.nodeId);
    const option = node?.options.find(o => o.id === decision.optionId);
    if (option?.misconceptionTag) tags.push(option.misconceptionTag);
  }
  return Array.from(new Set(tags));
}
