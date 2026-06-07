import type { Scores, StudentDecision, DecisionNode } from './types';
import { misconceptionMeta } from './decisions';

// ─── Pattern definitions for reasoning analysis ───

interface ReasoningPattern {
  id: string;
  misconceptionTag: string;
  keywords: string[];
  antonymKeywords: string[]; // words that DISCONFIRM this misconception
  template: (match: string) => string;
}

const patterns: ReasoningPattern[] = [
  {
    id: 'fear-driven-isolation',
    misconceptionTag: 'isolation-myth',
    keywords: ['hide', 'safe from', 'stay away', 'avoid', 'dont want them', 'scared', 'afraid', 'protect', 'keep out', 'wall'],
    antonymKeywords: ['trade', 'learn', 'work together', 'share', 'cooperate', 'help'],
    template: (word) =>
      `You mentioned wanting to "${word}" from the Powhatan. That's a natural feeling when you're in a new place! But think about this: the people who already live here know how to find water, grow food, and survive the winters. Hiding means missing out on all that knowledge. The real Jamestown colonists learned that staying in their fort felt safe — until they ran out of food.`,
  },
  {
    id: 'weapon-supremacy',
    misconceptionTag: 'colonial-entitlement',
    keywords: ['guns', 'weapons', 'stronger', 'more powerful', 'force', 'make them', 'demand', 'because we can', 'defeat', 'conquer', 'army'],
    antonymKeywords: ['trade', 'fair', 'agreement', 'peace', 'negotiate', 'respect'],
    template: (word) =>
      `You're thinking about "${word}" as the way to get what you need. That's how some colonists thought too! But here's what really happened: the Powhatan had over 10,000 warriors who knew every path, river, and hiding spot in the land. English weapons were slow to reload and useless in a forest. When colonists tried using force, it led to years of attacks on both sides. Trade and respect worked much better.`,
  },
  {
    id: 'england-will-save',
    misconceptionTag: 'supply-dependence',
    keywords: ['england will', 'send ships', 'wait for', 'theyll bring', 'home country', 'king will', 'rescue', 'bring supplies', 'help from england'],
    antonymKeywords: ['grow our own', 'farm', 'build', 'self', 'independent', 'local'],
    template: (word) =>
      `You're counting on "${word}" to save the colony. Many colonists felt the same way! But the Atlantic Ocean is dangerous — ships were delayed by storms, pirates, and wars in Europe. During the "Starving Time" of 1609, 80% of the colony died waiting for ships that didn't come. Colonies that learned to feed themselves survived; those that waited didn't.`,
  },
  {
    id: 'rules-from-afar',
    misconceptionTag: 'distant-authority',
    keywords: ['rules', 'company says', 'king says', 'obey', 'follow orders', 'they know better', 'in charge', 'supposed to', 'authority', 'boss'],
    antonymKeywords: ['we know', 'our choice', 'decide ourselves', 'vote', 'assembly', 'our needs'],
    template: (word) =>
      `You mentioned "${word}" — following the rules from people in charge. That makes sense in England! But imagine this: the Virginia Company is 3,000 miles away. They've never seen Jamestown. They don't know the river is salty, the soil is different, or the Powhatan control the food. Their rules were written for making profit, not for surviving. That's why colonists eventually created their own government — the House of Burgesses — in 1619.`,
  },
  {
    id: 'inland-illusion',
    misconceptionTag: 'inland-safety',
    keywords: ['far away', 'deep inland', 'hidden', 'cant find us', 'safe inside', 'away from', 'remote', 'forest', 'isolated'],
    antonymKeywords: ['ships', 'coast', 'escape', 'supply', 'trade route', 'accessible'],
    template: (word) =>
      `You thought going "${word}" would keep the colony safe. The real Jamestown settlers picked a spot up the river too! But here's what they discovered: being far from the coast meant ships couldn't reach them quickly with supplies. And the inland water was swampy and full of disease. Sometimes the place that feels safest has dangers you can't see yet.`,
  },
  {
    id: 'english-superiority',
    misconceptionTag: 'colonial-entitlement',
    keywords: ['better', 'smarter', 'advanced', 'civilized', 'english way', 'our way', 'superior', 'more developed', 'progress'],
    antonymKeywords: ['learn from', 'their knowledge', 'they know', 'adapt', 'local wisdom'],
    template: (word) =>
      `You mentioned "${word}" — and many English colonists felt the same pride in their culture. But the Powhatan had farmed this land for thousands of years. Their "Three Sisters" farming method (corn, beans, and squash together) produced way more food per acre than English crops. The colonists who survived were the ones who humbly learned from the people who already lived here.`,
  },
  {
    id: 'passive-waiting',
    misconceptionTag: 'supply-dependence',
    keywords: ['wait', 'hope', 'maybe', 'eventually', 'someone will', 'it will work out', 'patient', 'soon'],
    antonymKeywords: ['act', 'do something', 'plan', 'build', 'grow', 'take action'],
    template: (word) =>
      `You used the word "${word}" — and waiting feels reasonable when you trust help is coming. But in 1609, the colonists waited through a whole winter for ships. They ate horses, rats, and shoe leather. Only 60 out of 500 survived. In a new colony, waiting is dangerous. The survivors were always the ones who took action — planting, trading, building.`,
  },
];

// ─── Core analysis functions ───

export interface ReasoningAnalysis {
  detectedPatterns: string[];
  misconceptionTags: string[];
  primaryCoaching: string;
  secondaryCoaching: string | null;
  confidence: number;
  reasoningQuality: 'surface' | 'moderate' | 'deep';
}

export function analyzeReasoning(
  reasoning: string,
  optionId: string,
  node: DecisionNode,
  readingLevel: 'below' | 'on' | 'above',
): ReasoningAnalysis {
  const lower = reasoning.toLowerCase();
  const chosenOpt = node.options.find(o => o.id === optionId);
  const hasOptionMisconception = !!chosenOpt?.misconceptionTag;

  // Detect patterns in reasoning text
  const detected: { pattern: ReasoningPattern; match: string }[] = [];
  for (const p of patterns) {
    if (p.id === 'inland-illusion' && node.id !== 'location') continue;
    if (p.id === 'fear-driven-isolation' && node.id !== 'powhatan') continue;
    if (p.id === 'weapon-supremacy' && node.id !== 'powhatan') continue;
    if (p.id === 'england-will-save' && node.id !== 'food-strategy') continue;
    if (p.id === 'rules-from-afar' && node.id !== 'governance') continue;
    if (p.id === 'passive-waiting' && node.id !== 'food-strategy') continue;

    const hasAntonym = p.antonymKeywords.some(kw => lower.includes(kw));
    if (hasAntonym) continue; // student shows understanding, skip

    for (const kw of p.keywords) {
      if (lower.includes(kw)) {
        detected.push({ pattern: p, match: kw });
        break; // one match per pattern
      }
    }
  }

  // Assess reasoning quality
  const wordCount = reasoning.split(/\s+/).filter(Boolean).length;
  const hasBecause = lower.includes('because') || lower.includes('since') || lower.includes('so');
  const hasComparison = lower.includes('but') || lower.includes('however') || lower.includes('instead');
  const quality: ReasoningAnalysis['reasoningQuality'] =
    wordCount >= 15 && (hasBecause || hasComparison) ? 'deep'
    : wordCount >= 8 ? 'moderate'
    : 'surface';

  // Generate coaching
  let primaryCoaching: string;
  let secondaryCoaching: string | null = null;
  const misconceptionTags: string[] = [];

  // Option-based misconception (always include if present)
  if (hasOptionMisconception) {
    misconceptionTags.push(chosenOpt!.misconceptionTag!);
  }

  // Reasoning-detected misconceptions (can catch misconceptions even in "right" choices!)
  for (const d of detected) {
    if (!misconceptionTags.includes(d.pattern.misconceptionTag)) {
      misconceptionTags.push(d.pattern.misconceptionTag);
    }
  }

  if (detected.length > 0) {
    // AI detected a misconception in the reasoning
    primaryCoaching = detected[0].pattern.template(detected[0].match);

    if (detected.length > 1) {
      secondaryCoaching = detected[1].pattern.template(detected[1].match);
    }

    // If student chose the "right" option but revealed flawed reasoning
    if (!hasOptionMisconception && detected.length > 0) {
      primaryCoaching = `You chose well — but let's look at your reasoning. ${primaryCoaching}`;
    }
  } else if (hasOptionMisconception) {
    // Option has a misconception but reasoning didn't trigger any pattern
    primaryCoaching = chosenOpt!.coachingMisconception ?? chosenOpt!.coachingCorrect;
  } else {
    // Good choice with good reasoning
    if (quality === 'deep') {
      primaryCoaching = `Excellent reasoning! ${chosenOpt?.coachingCorrect ?? ''} Your explanation shows you're really thinking like a historian — considering both the obvious factors and the hidden ones.`;
    } else if (quality === 'moderate') {
      primaryCoaching = `Good choice! ${chosenOpt?.coachingCorrect ?? ''} Try to add a "because" next time — explaining your "why" makes your thinking stronger.`;
    } else {
      primaryCoaching = `That's a solid choice! ${chosenOpt?.coachingCorrect ?? ''} Next time, try writing a few more words about why you picked this — historians always explain their reasoning.`;
    }
  }

  // Adapt for reading level
  if (readingLevel === 'below') {
    primaryCoaching = simplifyText(primaryCoaching);
    if (secondaryCoaching) secondaryCoaching = simplifyText(secondaryCoaching);
  }

  const confidence = detected.length > 0 ? 0.85 : hasOptionMisconception ? 0.7 : 0.6;

  return {
    detectedPatterns: detected.map(d => d.pattern.id),
    misconceptionTags,
    primaryCoaching,
    secondaryCoaching,
    confidence,
    reasoningQuality: quality,
  };
}

function simplifyText(text: string): string {
  // Take first 2 sentences for below-level readers
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(' ');
}

// ─── AI-powered debrief generation ───

export interface AIDebrief {
  narrative: string;
  strengthNarrative: string;
  growthNarrative: string;
  nextStepPersonalized: string;
  historicalConnection: string;
}

export function generateDebrief(
  result: { decisions: StudentDecision[]; finalScores: Scores; misconceptionTags: string[]; displayName: string },
  allNodes: DecisionNode[],
): AIDebrief {
  const { decisions, finalScores, displayName } = result;

  // Find strength and growth areas
  const scoreEntries = Object.entries(finalScores) as [keyof Scores, number][];
  const sorted = [...scoreEntries].sort((a, b) => b[1] - a[1]);
  const strength = sorted[0];
  const growth = sorted[sorted.length - 1];

  const labels: Record<keyof Scores, string> = {
    survival: 'Survival Readiness',
    economy: 'Colony Economy',
    diplomacy: 'Powhatan Diplomacy',
    governance: 'Governance Stability',
  };

  const historicalLinks: Record<keyof Scores, string> = {
    survival: 'John Smith enforced his "work or starve" rule to keep the colony alive',
    economy: 'John Rolfe introduced tobacco as a cash crop, transforming the economy',
    diplomacy: 'Pocahontas helped broker peace and trade between colonists and Powhatan',
    governance: 'The House of Burgesses in 1619 became the first representative government in America',
  };

  // Build narrative from decisions
  const choiceDescriptions = decisions.map(d => {
    const node = allNodes.find(n => n.id === d.nodeId);
    const opt = node?.options.find(o => o.id === d.optionId);
    return { title: node?.title ?? '', choice: opt?.shortText ?? '', reasoning: d.reasoning };
  });

  const narrative = `${displayName}'s colony made four crucial decisions in 1607. ` +
    choiceDescriptions.map((c, i) => `For ${c.title.toLowerCase()}, they chose to "${c.choice}"` +
      (c.reasoning ? ` because ${c.reasoning.charAt(0).toLowerCase()}${c.reasoning.slice(1)}` : '') +
      (i < choiceDescriptions.length - 1 ? '.' : '.')
    ).join(' ') +
    ` These choices shaped the colony's fate across four dimensions of colonial life.`;

  const strengthNarrative = `${displayName}'s strongest area is ${labels[strength[0]]} (${strength[1]}/100). ` +
    `This reflects choices that prioritized ${strength[0] === 'survival' ? 'practical survival needs like food and safety' :
      strength[0] === 'economy' ? 'building sustainable trade and agriculture' :
      strength[0] === 'diplomacy' ? 'cooperation and mutual respect with the Powhatan' :
      'creating fair systems for making decisions together'}. ` +
    `In real Jamestown history, ${historicalLinks[strength[0]]}.`;

  const growthNarrative = `The area with the most room to grow is ${labels[growth[0]]} (${growth[1]}/100). ` +
    `${growth[1] < 30 ? 'This score suggests some key misunderstandings about colonial life that are very common among students — even adults sometimes get these wrong!' :
      growth[1] < 60 ? 'This score shows some understanding but also some gaps in thinking about how colonies really worked.' :
      'This score is decent, but there\'s still room to think more deeply about this aspect of colonial life.'} ` +
    `The historical reality: ${historicalLinks[growth[0]]}.`;

  const nextStepHints: Record<keyof Scores, string> = {
    survival: `Read about the "Starving Time" of 1609. Ask yourself: what could the colonists have done differently to prepare for winter? How did the Powhatan survive the same winters?`,
    economy: `Investigate the "Three Sisters" farming method. Compare how much food an acre of corn/beans/squash produces versus an acre of English wheat. Why did the Powhatan method work better here?`,
    diplomacy: `Research the 1622 Powhatan uprising. What caused the breakdown in relations? How might things have been different if both sides had kept trading and negotiating?`,
    governance: `Learn about the House of Burgesses (1619). Why did colonists need their own government? What problems happened when the Virginia Company tried to rule from 3,000 miles away?`,
  };

  const nextStepPersonalized = nextStepHints[growth[0]];

  // Find an interesting historical connection from their reasoning
  const allReasoningWords = decisions.flatMap(d => d.reasoning.toLowerCase().split(/\s+/));
  const historicalConnection = allReasoningWords.includes('trade') || allReasoningWords.includes('trading')
    ? `Your thinking about trade connects directly to VS.3e: the colonists' dependence on the Powhatan for food. This is one of the most important relationships in early Virginia history — and you're already thinking about it!`
    : allReasoningWords.includes('rule') || allReasoningWords.includes('govern') || allReasoningWords.includes('law')
    ? `Your thinking about rules and government connects to VS.3f: the significance of the General Assembly (House of Burgesses). You're grappling with the same question the colonists faced — who should make the rules when you're far from home?`
    : allReasoningWords.includes('food') || allReasoningWords.includes('farm') || allReasoningWords.includes('crop') || allReasoningWords.includes('grow')
    ? `Your thinking about food and farming connects to VS.3e: how the Powhatan and English adapted to each other's agricultural practices. The blending of farming traditions was key to survival!`
    : `Your decisions connect to the big VS.3 question: how did the choices of early Virginians — both English and Powhatan — shape the colony's survival and growth? Every choice you made mirrors a real historical crossroads.`;

  return { narrative, strengthNarrative, growthNarrative, nextStepPersonalized, historicalConnection };
}

// ─── AI-powered teacher insight generation ───

export interface AIInsight {
  pattern: string;
  students: string[];
  description: string;
  reteachSuggestion: string;
  severity: 'high' | 'medium' | 'low';
}

export function generateTeacherInsights(
  results: { displayName: string; decisions: StudentDecision[]; misconceptionTags: string[]; finalScores: Scores }[],
  allNodes: DecisionNode[],
): AIInsight[] {
  if (results.length === 0) return [];

  const insights: AIInsight[] = [];

  // Pattern 1: Students who chose "right" but revealed misconceptions in reasoning
  const surfaceCorrectStudents: string[] = [];
  for (const r of results) {
    for (const d of r.decisions) {
      const node = allNodes.find(n => n.id === d.nodeId);
      const opt = node?.options.find(o => o.id === d.optionId);
      if (!opt?.misconceptionTag) {
        // Chose a "good" option
        const analysis = analyzeReasoning(d.reasoning, d.optionId, node!, 'on');
        if (analysis.misconceptionTags.length > 0) {
          surfaceCorrectStudents.push(r.displayName);
          break;
        }
      }
    }
  }

  if (surfaceCorrectStudents.length > 0) {
    insights.push({
      pattern: 'Surface-Level Correct',
      students: surfaceCorrectStudents,
      description: `${surfaceCorrectStudents.join(' and ')} chose correctly but revealed misconceptions in their reasoning. They may have guessed or had the right answer for the wrong reasons — a critical distinction for reteaching.`,
      reteachSuggestion: `Use a "Why do you think that?" protocol. Have these students explain their reasoning aloud and compare it with a student who chose the same option for deeper reasons. Surface understanding vs. deep understanding is the key gap.`,
      severity: 'high',
    });
  }

  // Pattern 2: Common misconception clusters
  const tagCounts: Record<string, { count: number; students: string[] }> = {};
  for (const r of results) {
    for (const tag of r.misconceptionTags) {
      if (!tagCounts[tag]) tagCounts[tag] = { count: 0, students: [] };
      tagCounts[tag].count++;
      if (!tagCounts[tag].students.includes(r.displayName)) tagCounts[tag].students.push(r.displayName);
    }
  }

  for (const [tag, data] of Object.entries(tagCounts).sort((a, b) => b[1].count - a[1].count)) {
    const meta = misconceptionMeta[tag];
    if (!meta) continue;
    insights.push({
      pattern: meta.label,
      students: data.students,
      description: `${data.students.join(' and ')} showed the "${meta.label}" misconception: ${meta.description}`,
      reteachSuggestion: meta.reteachAction,
      severity: data.count >= results.length * 0.5 ? 'high' : data.count >= results.length * 0.25 ? 'medium' : 'low',
    });
  }

  // Pattern 3: Low-effort reasoning
  const lowEffortStudents: string[] = [];
  for (const r of results) {
    const avgWords = r.decisions.reduce((sum, d) => sum + d.reasoning.split(/\s+/).filter(Boolean).length, 0) / r.decisions.length;
    if (avgWords < 8) lowEffortStudents.push(r.displayName);
  }

  if (lowEffortStudents.length > 0) {
    insights.push({
      pattern: 'Thin Reasoning',
      students: lowEffortStudents,
      description: `${lowEffortStudents.join(' and ')} wrote very short explanations (under 8 words on average). This may indicate rushing, disengagement, or difficulty articulating historical thinking.`,
      reteachSuggestion: `Use a sentence starter scaffold: "I chose ___ because ___ and this would help the colony by ___." This structure encourages deeper reasoning without requiring students to invent the format.`,
      severity: 'medium',
    });
  }

  // Pattern 4: Diplomacy vs. Force split (common pedagogical insight)
  const diplomacyStudents: string[] = [];
  const forceStudents: string[] = [];
  for (const r of results) {
    const powhatanDecision = r.decisions.find(d => d.nodeId === 'powhatan');
    if (powhatanDecision) {
      if (powhatanDecision.optionId === 'trade-negotiate') diplomacyStudents.push(r.displayName);
      else if (powhatanDecision.optionId === 'force-demand') forceStudents.push(r.displayName);
    }
  }

  if (diplomacyStudents.length > 0 && forceStudents.length > 0) {
    insights.push({
      pattern: 'Diplomacy vs. Force Divide',
      students: [...diplomacyStudents, ...forceStudents],
      description: `Your class is split on Powhatan relations: ${diplomacyStudents.join(' and ')} chose cooperation, while ${forceStudents.join(' and ')} chose force. This mirrors the real debate in Jamestown — and the historical evidence clearly shows which approach worked.`,
      reteachSuggestion: `Set up a structured academic debate. Assign "Trade Team" and "Force Team" and have them use primary source evidence. The Powhatan uprising of 1622 and the First Anglo-Powhatan War provide compelling evidence for both sides to examine.`,
      severity: 'medium',
    });
  }

  return insights.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 };
    return sev[b.severity] - sev[a.severity];
  });
}

// ─── Smart student comparison ───

export interface SmartComparison {
  headline: string;
  analysis: string;
  teachingMove: string;
}

export function generateSmartComparison(
  a: { displayName: string; decisions: StudentDecision[]; finalScores: Scores; misconceptionTags: string[] },
  b: { displayName: string; decisions: StudentDecision[]; finalScores: Scores; misconceptionTags: string[] },
): SmartComparison[] {
  const comparisons: SmartComparison[] = [];

  // Find a decision where they diverged significantly
  for (let i = 0; i < Math.min(a.decisions.length, b.decisions.length); i++) {
    const da = a.decisions[i];
    const db = b.decisions[i];
    if (da.nodeId !== db.nodeId) continue;
    if (da.optionId === db.optionId) continue;

    // They chose differently on this node — analyze
    const aChose = da.optionId;

    // Generate comparison for Powhatan decision specifically
    if (da.nodeId === 'powhatan') {
      comparisons.push({
        headline: `Different approaches to the Powhatan`,
        analysis: `${a.displayName} and ${b.displayName} made opposite choices about the Powhatan. ${aChose === 'trade-negotiate' ? a.displayName : b.displayName} chose cooperation, while ${aChose === 'force-demand' ? a.displayName : b.displayName} chose force. Their reasoning reveals ${aChose === 'trade-negotiate' ? a.displayName : b.displayName} saw the Powhatan as partners, while ${aChose === 'force-demand' ? a.displayName : b.displayName} saw them as obstacles. Historically, the colonists who traded with the Powhatan survived; those who tried force faced devastating counterattacks.`,
        teachingMove: `Pair these students to discuss: "If you were Powhatan, how would you respond to each approach?" This perspective-taking exercise builds empathy and historical understanding simultaneously.`,
      });
      break;
    }

    if (da.nodeId === 'governance') {
      comparisons.push({
        headline: `Different visions for governing the colony`,
        analysis: `${a.displayName} and ${b.displayName} disagreed on governance. One leaned toward self-rule (mirroring the House of Burgesses), while the other trusted distant authority (the Virginia Company model). This exact debate played out over decades in real Jamestown — and the self-governance camp eventually won, leading to representative democracy in America.`,
        teachingMove: `Create a T-chart comparing "Rules from England" vs. "Rules from Jamestown." Have students fill in what each system would know and not know about daily colonial life. The gaps reveal why self-governance was necessary.`,
      });
      break;
    }
  }

  // Score-based comparison
  const aTotal = Object.values(a.finalScores).reduce((s, v) => s + v, 0);
  const bTotal = Object.values(b.finalScores).reduce((s, v) => s + v, 0);
  const gap = Math.abs(aTotal - bTotal);

  if (gap > 100) {
    const higher = aTotal > bTotal ? a : b;
    const lower = aTotal > bTotal ? b : a;
    comparisons.push({
      headline: `Big picture: choices have compounding effects`,
      analysis: `${higher.displayName}'s colony scored ${aTotal > bTotal ? aTotal : bTotal}/400 vs. ${lower.displayName}'s ${aTotal > bTotal ? bTotal : aTotal}/400 — a ${gap}-point gap. This isn't luck; it's compounding decisions. Good choices in diplomacy led to food, which led to survival, which enabled governance. The same cascade worked in reverse for poor choices. This is exactly how real colonies succeeded or failed.`,
      teachingMove: `Draw a "decision cascade" diagram showing how one good/poor choice cascades into the next. Students can trace how ${higher.displayName}'s trade decision led to food security, which freed up energy for self-governance.`,
    });
  }

  if (comparisons.length === 0) {
    comparisons.push({
      headline: `Similar paths, different thinking`,
      analysis: `${a.displayName} and ${b.displayName} made similar choices overall but may have had different reasons. Reading their explanations reveals the depth of their historical thinking — which matters as much as the choices themselves.`,
      teachingMove: `Use a "Same Choice, Different Reason" activity. Even when students pick the same option, their reasoning reveals different levels of historical understanding. Share anonymized reasoning samples and have students rank them by depth of thinking.`,
    });
  }

  return comparisons;
}
