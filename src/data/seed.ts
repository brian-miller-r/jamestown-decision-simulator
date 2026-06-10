import type { Session, StudentResult } from './types';
import { getSessions, getResults } from './store';
import { getDecisionNodes } from './decisions';
import { computeScores, extractMisconceptions } from './store';
import { analyzeReasoningSync } from './ai';

export const DEMO_SESSION_ID = 'demo-session-001';
const DEMO_SESSION_CODE = 'JMS1607';

const demoStudentA: StudentResult = {
  id: 'demo-student-a',
  sessionId: DEMO_SESSION_ID,
  displayName: 'Emma',
  decisions: [
    { nodeId: 'location', optionId: 'peninsula-river', reasoning: 'Water on three sides means we can see enemies coming and ships can reach us.', timestamp: Date.now() - 50000 },
    { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Trading is fair — we get food and they get useful tools. Everyone wins.', timestamp: Date.now() - 40000 },
    { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'The Powhatan know how to grow food here. We should learn from them instead of guessing.', timestamp: Date.now() - 30000 },
    { nodeId: 'governance', optionId: 'self-govern', reasoning: 'We live here so we should make our own rules. People in England dont know what we need.', timestamp: Date.now() - 20000 },
  ],
  finalScores: { survival: 0, economy: 0, diplomacy: 0, governance: 0 },
  misconceptionTags: [],
  completedAt: Date.now() - 15000,
};

const demoStudentB: StudentResult = {
  id: 'demo-student-b',
  sessionId: DEMO_SESSION_ID,
  displayName: 'Lucas',
  decisions: [
    { nodeId: 'location', optionId: 'inland-river', reasoning: 'If we go deep inland the Powhatan cant find us and we will be safe.', timestamp: Date.now() - 55000 },
    { nodeId: 'powhatan', optionId: 'force-demand', reasoning: 'We have guns and the King owns this land. They have to give us what we need.', timestamp: Date.now() - 45000 },
    { nodeId: 'food-strategy', optionId: 'wait-supply-ship', reasoning: 'England will send more ships. We just need to wait and not waste time farming.', timestamp: Date.now() - 35000 },
    { nodeId: 'governance', optionId: 'company-rules', reasoning: 'The Virginia Company is in charge. We should follow their rules because they know best.', timestamp: Date.now() - 25000 },
  ],
  finalScores: { survival: 0, economy: 0, diplomacy: 0, governance: 0 },
  misconceptionTags: [],
  completedAt: Date.now() - 10000,
};

function computeResultWithAI(r: StudentResult, standard: 'VS.3' | 'VS.4'): StudentResult {
  const decisionNodes = getDecisionNodes(standard);
  const scores = computeScores(r.decisions, decisionNodes);
  const optionTags = extractMisconceptions(r.decisions, decisionNodes);

  // Also run AI reasoning analysis for each decision
  const aiTags: string[] = [];
  for (const d of r.decisions) {
    const node = decisionNodes.find(n => n.id === d.nodeId);
    if (!node) continue;
    const analysis = analyzeReasoningSync(d.reasoning, d.optionId, node, 'on');
    for (const tag of analysis.misconceptionTags) {
      if (!aiTags.includes(tag)) aiTags.push(tag);
    }
  }

  const mergedTags = [...new Set([...optionTags, ...aiTags])];

  return {
    ...r,
    standard,
    finalScores: scores,
    misconceptionTags: mergedTags,
  };
}

export function seedDemoData() {
  const sessions = getSessions();
  if (sessions.find(s => s.id === DEMO_SESSION_ID)) return;

  const demoSession: Session = {
    id: DEMO_SESSION_ID,
    code: DEMO_SESSION_CODE,
    standard: 'VS.3',
    readingLevel: 'on',
    createdAt: Date.now() - 60000,
  };

  sessions.push(demoSession);
  localStorage.setItem('jamestown_sessions', JSON.stringify(sessions));

  const results = getResults();
  const resultA = computeResultWithAI(demoStudentA, 'VS.3');
  const resultB = computeResultWithAI(demoStudentB, 'VS.3');
  results.push(resultA, resultB);
  localStorage.setItem('jamestown_results', JSON.stringify(results));
}

export function resetDemoData() {
  localStorage.removeItem('jamestown_sessions');
  localStorage.removeItem('jamestown_results');
  seedDemoData();
}
