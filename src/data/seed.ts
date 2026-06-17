import type { Session, StudentResult } from './types';
import { getSessions, getResults } from './store';
import { getDecisionNodes } from './decisions';
import { computeScores, extractMisconceptions } from './store';
import { analyzeReasoningSync } from './ai';

export const DEMO_SESSION_ID = 'demo-session-001';
const DEMO_SESSION_CODE = 'JMS1607';
type DemoDecision = {
  nodeId: string;
  optionId: string;
  reasoning: string;
};

type DemoStudentTemplate = {
  id: string;
  displayName: string;
  decisions: DemoDecision[];
};

const demoStudentTemplates: DemoStudentTemplate[] = [
  {
    id: 'demo-student-emma',
    displayName: 'Emma',
    decisions: [
      { nodeId: 'location', optionId: 'peninsula-river', reasoning: 'A peninsula gives defense and still lets ships bring supplies.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Trade builds trust and helps both groups survive the winter.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'The Powhatan method fits this soil better than English crops.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'People living here should vote on rules because they know daily needs.' },
    ],
  },
  {
    id: 'demo-student-maya',
    displayName: 'Maya',
    decisions: [
      { nodeId: 'location', optionId: 'coastal-port', reasoning: 'A coastal port keeps trade and supply routes open.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Negotiation is safer long term than starting conflict.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'Learning local farming gives faster results than guessing.' },
      { nodeId: 'governance', optionId: 'strong-leader', reasoning: 'In a crisis, a strong leader can organize work quickly.' },
    ],
  },
  {
    id: 'demo-student-jordan',
    displayName: 'Jordan',
    decisions: [
      { nodeId: 'location', optionId: 'peninsula-river', reasoning: 'This location balances defense and ship access.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Trading for corn is better than risking a fight.' },
      { nodeId: 'food-strategy', optionId: 'english-crops', reasoning: 'English crops might work if we start planting immediately.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'Local leaders can adjust rules faster than England can.' },
    ],
  },
  {
    id: 'demo-student-olivia',
    displayName: 'Olivia',
    decisions: [
      { nodeId: 'location', optionId: 'coastal-port', reasoning: 'The coast gives easier access to help and trade ships.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Respectful trade protects peace and food supply.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'Three Sisters farming is adapted to this climate.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'People on the ground understand problems best.' },
    ],
  },
  {
    id: 'demo-student-daniel',
    displayName: 'Daniel',
    decisions: [
      { nodeId: 'location', optionId: 'peninsula-river', reasoning: 'Water around the settlement helps with defense and visibility.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Partnership gives access to food and local knowledge.' },
      { nodeId: 'food-strategy', optionId: 'english-crops', reasoning: 'We can start with familiar crops while learning local methods.' },
      { nodeId: 'governance', optionId: 'strong-leader', reasoning: 'Strong leadership can prevent disorder during shortages.' },
    ],
  },
  {
    id: 'demo-student-lucas',
    displayName: 'Lucas',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'We should go deep inland so we are hidden and safe from attacks.' },
      { nodeId: 'powhatan', optionId: 'force-demand', reasoning: 'We have better weapons, so we can demand what we need.' },
      { nodeId: 'food-strategy', optionId: 'wait-supply-ship', reasoning: 'England will send ships, so we should wait for rescue and supplies.' },
      { nodeId: 'governance', optionId: 'company-rules', reasoning: 'The company says they are in charge, so we should obey orders.' },
    ],
  },
  {
    id: 'demo-student-sofia',
    displayName: 'Sofia',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'Deep inland keeps us far away from danger near the coast.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Trading is smarter than conflict because both sides gain.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'Local crops make more sense for local weather.' },
      { nodeId: 'governance', optionId: 'strong-leader', reasoning: 'One clear leader helps everyone stay focused.' },
    ],
  },
  {
    id: 'demo-student-caleb',
    displayName: 'Caleb',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'Deep inland keeps us hidden and away from enemies.' },
      { nodeId: 'powhatan', optionId: 'avoid-minimize', reasoning: 'We should avoid them and stay away until we are stronger.' },
      { nodeId: 'food-strategy', optionId: 'wait-supply-ship', reasoning: 'It is safer to wait for ships from England than risk new farming.' },
      { nodeId: 'governance', optionId: 'company-rules', reasoning: 'England is in charge and we should follow orders.' },
    ],
  },
  {
    id: 'demo-student-aria',
    displayName: 'Aria',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'If we move deep inland, we are farther away from attacks.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Trade gives us food without creating enemies.' },
      { nodeId: 'food-strategy', optionId: 'wait-supply-ship', reasoning: 'We should wait for supply ships because England will help us.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'People here should vote because they know local needs.' },
    ],
  },
  {
    id: 'demo-student-ethan',
    displayName: 'Ethan',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'Far inland sounds safer because enemies cannot find us.' },
      { nodeId: 'powhatan', optionId: 'avoid-minimize', reasoning: 'We should avoid contact and stay away until we are ready.' },
      { nodeId: 'food-strategy', optionId: 'english-crops', reasoning: 'Planting familiar crops is less confusing for settlers.' },
      { nodeId: 'governance', optionId: 'strong-leader', reasoning: 'Strong leadership helps in emergencies.' },
    ],
  },
  {
    id: 'demo-student-zoe',
    displayName: 'Zoe',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'Deep inland keeps the colony away from coastal threats.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Respectful trade can build better long-term relations.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'Their farming method has worked here for generations.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'Local decisions should be made by people living in Jamestown.' },
    ],
  },
  {
    id: 'demo-student-mason',
    displayName: 'Mason',
    decisions: [
      { nodeId: 'location', optionId: 'inland-river', reasoning: 'Going deep inland makes us harder to attack.' },
      { nodeId: 'powhatan', optionId: 'force-demand', reasoning: 'We are stronger and can force them to give supplies.' },
      { nodeId: 'food-strategy', optionId: 'wait-supply-ship', reasoning: 'We should wait because ships from England will come soon.' },
      { nodeId: 'governance', optionId: 'strong-leader', reasoning: 'One leader should make fast decisions in crisis.' },
    ],
  },
  {
    id: 'demo-student-noah',
    displayName: 'Noah',
    decisions: [
      { nodeId: 'location', optionId: 'coastal-port', reasoning: 'A coastal location keeps transportation easier.' },
      { nodeId: 'powhatan', optionId: 'avoid-minimize', reasoning: 'Avoiding the Powhatan seems safer at first.' },
      { nodeId: 'food-strategy', optionId: 'english-crops', reasoning: 'Settlers know these crops, so they can start quickly.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'Colonists should shape their own laws together.' },
    ],
  },
  {
    id: 'demo-student-grace',
    displayName: 'Grace',
    decisions: [
      { nodeId: 'location', optionId: 'peninsula-river', reasoning: 'This site gives defense while keeping water access.' },
      { nodeId: 'powhatan', optionId: 'avoid-minimize', reasoning: 'We should stay away from them until the colony is stronger.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'Learning local techniques improves harvests.' },
      { nodeId: 'governance', optionId: 'self-govern', reasoning: 'People here know conditions better than leaders far away.' },
    ],
  },
  {
    id: 'demo-student-hannah',
    displayName: 'Hannah',
    decisions: [
      { nodeId: 'location', optionId: 'coastal-port', reasoning: 'Coastal access helps with incoming ships.' },
      { nodeId: 'powhatan', optionId: 'avoid-minimize', reasoning: 'It feels safer to avoid them and keep distance.' },
      { nodeId: 'food-strategy', optionId: 'wait-supply-ship', reasoning: 'England will send ships eventually, so waiting is best.' },
      { nodeId: 'governance', optionId: 'company-rules', reasoning: 'The Virginia Company is in charge and should set rules.' },
    ],
  },
  {
    id: 'demo-student-owen',
    displayName: 'Owen',
    decisions: [
      { nodeId: 'location', optionId: 'peninsula-river', reasoning: 'A peninsula keeps some natural protection.' },
      { nodeId: 'powhatan', optionId: 'avoid-minimize', reasoning: 'We should avoid contact and stay away for now.' },
      { nodeId: 'food-strategy', optionId: 'english-crops', reasoning: 'Try familiar crops first while learning local conditions.' },
      { nodeId: 'governance', optionId: 'strong-leader', reasoning: 'Crisis moments need decisive leadership.' },
    ],
  },
  {
    id: 'demo-student-isabella',
    displayName: 'Isabella',
    decisions: [
      { nodeId: 'location', optionId: 'coastal-port', reasoning: 'This location allows ships to arrive more easily.' },
      { nodeId: 'powhatan', optionId: 'trade-negotiate', reasoning: 'Cooperation and exchange can prevent conflict.' },
      { nodeId: 'food-strategy', optionId: 'three-sisters', reasoning: 'Adapting to local agriculture is practical.' },
      { nodeId: 'governance', optionId: 'company-rules', reasoning: 'The company says they are in charge, so we should follow orders.' },
    ],
  },
];

function buildDemoStudentResult(template: DemoStudentTemplate, index: number, baseTime: number): StudentResult {
  const studentStart = baseTime - (index + 1) * 60_000;
  return {
    id: template.id,
    sessionId: DEMO_SESSION_ID,
    displayName: template.displayName,
    decisions: template.decisions.map((decision, decisionIndex) => ({
      ...decision,
      timestamp: studentStart + (decisionIndex + 1) * 7_000,
    })),
    finalScores: { survival: 0, economy: 0, diplomacy: 0, governance: 0 },
    misconceptionTags: [],
    completedAt: studentStart + 50_000,
  };
}
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
  const baseTime = Date.now() - 2 * 60_000;
  const demoResults = demoStudentTemplates.map((template, index) =>
    computeResultWithAI(buildDemoStudentResult(template, index, baseTime), 'VS.3')
  );
  results.push(...demoResults);
  localStorage.setItem('jamestown_results', JSON.stringify(results));
}

export function resetDemoData() {
  localStorage.removeItem('jamestown_sessions');
  localStorage.removeItem('jamestown_results');
  seedDemoData();
}
