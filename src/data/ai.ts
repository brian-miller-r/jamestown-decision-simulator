import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Scores, StudentDecision, DecisionNode, StandardFocus, ReadingLevel } from './types';
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
  evidenceKeywords: string[];
  misconceptionTags: string[];
  primaryCoaching: string;
  secondaryCoaching: string | null;
  confidence: number;
  confidenceBand: 'High' | 'Medium' | 'Low';
  reasoningQuality: 'surface' | 'moderate' | 'deep';
}

export function analyzeReasoningSync(
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
  const evidenceKeywords = Array.from(new Set(detected.map(d => d.match)));

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
  const confidenceBand: ReasoningAnalysis['confidenceBand'] =
    confidence >= 0.8 ? 'High' : confidence >= 0.65 ? 'Medium' : 'Low';

  return {
    detectedPatterns: detected.map(d => d.pattern.id),
    evidenceKeywords,
    misconceptionTags,
    primaryCoaching,
    secondaryCoaching,
    confidence,
    confidenceBand,
    reasoningQuality: quality,
  };
}

export async function analyzeReasoning(
  reasoning: string,
  optionId: string,
  node: DecisionNode,
  readingLevel: 'below' | 'on' | 'above',
): Promise<ReasoningAnalysis> {
  const apiKey = localStorage.getItem('gemini_api_key') || (import.meta.env.VITE_GEMINI_API_KEY as string || '');
  console.log('[AI] analyzeReasoning called. API key status:', apiKey ? `FOUND (starts with "${apiKey.slice(0, 6)}...")` : 'MISSING');
  if (!apiKey) {
    console.log('[AI] No Gemini API key found, falling back to rule-based analysis.');
    return analyzeReasoningSync(reasoning, optionId, node, readingLevel);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are an AI History Coach helping a 4th grade social studies student in Virginia.
The student is playing a Jamestown Decision Simulator.
Your role is to analyze their chosen option and written reasoning for a specific decision node, check for historical misconceptions, evaluate their reasoning quality, and write supportive, personalized coaching feedback.

We are covering standard:
- VS.3 (Jamestown founding: location, Powhatan relations, food strategy, governance)
- VS.4 (Colonial Virginia: expansion, economy/tobacco, labor/slavery, governance/wealthy planters)

Misconceptions we monitor:
1. "inland-safety" (isolation-myth): Believing inland is safe and ignoring water safety / supply routes.
2. "colonial-entitlement" (might makes right): Assumes English weapons/authority automatically commands Powhatan cooperation.
3. "isolation-myth": Thinks avoiding the Powhatan keeps the colony safe.
4. "supply-dependence": Believes waiting for English supply ships is a reliable strategy.
5. "distant-authority": Assumes distant Virginia Company rules fit daily local conditions.
6. "expansion-entitlement": Believes colonists have the right to seize Native American land for profit.
7. "native-slavery-myth": Thinks Native Americans could be easily enslaved as a labor source.
8. "slavery-inevitability": Assumes racial slavery was inevitable from the start rather than a deliberate economic choice.
9. "oligarchy-stability": Assumes concentrated planter power was stable.

Coaching Guidelines:
- Keep coaching positive, educational, and historically grounded.
- Tailor the language complexity to the student's reading level:
  * "below": Use short, simple sentences (around 1st-2nd grade readability). Keep feedback very concise (1-2 sentences).
  * "on": Use standard 4th grade level language.
  * "above": Use richer vocabulary and prompt them to think about long-term cause-and-effect relationships.
- If they made a good choice with good reasoning, praise them and explain the historical connection.
- If they have a misconception, gently nudge them to reconsider using historical evidence. Be supportive and push them to think like a historian.`,
    });

    const chosenOpt = node.options.find(o => o.id === optionId);
    
    const prompt = `Decision Node: ${node.title}
Historical Context: ${node.historicalContext}
Prompt: ${node.prompt}

Student chose option: "${chosenOpt?.shortText}" - Description: "${chosenOpt?.text}"
Student's written reasoning: "${reasoning}"
Reading Level: ${readingLevel}

Analyze this response. Match it to one or more of the misconception tags if applicable, detect any keywords/evidence, assess reasoning quality ('surface' | 'moderate' | 'deep'), and generate the primary coaching response.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            detectedPatterns: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'Identifiers of detected misconception patterns (e.g. fear-driven-isolation, weapon-supremacy, england-will-save, rules-from-afar, inland-illusion, english-superiority, passive-waiting).'
            },
            evidenceKeywords: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'Key words or phrases from the student reasoning indicating their misconceptions.'
            },
            misconceptionTags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'Misconception tags corresponding to detected patterns (e.g. inland-safety, colonial-entitlement, isolation-myth, supply-dependence, distant-authority, expansion-entitlement, native-slavery-myth, slavery-inevitability, oligarchy-stability).'
            },
            primaryCoaching: {
              type: SchemaType.STRING,
              description: 'Personalized Socratic coaching message that addresses the student choice and reasoning, adapted to the requested reading level.'
            },
            secondaryCoaching: {
              type: SchemaType.STRING,
              nullable: true,
              description: 'Additional coaching if a second misconception was detected, otherwise null.'
            },
            confidence: {
              type: SchemaType.NUMBER,
              description: 'Confidence score from 0.0 to 1.0.'
            },
            confidenceBand: {
              type: SchemaType.STRING,
              enum: ['High', 'Medium', 'Low'],
              description: 'Confidence band.'
            },
            reasoningQuality: {
              type: SchemaType.STRING,
              enum: ['surface', 'moderate', 'deep'],
              description: 'Depth of student historical reasoning.'
            }
          },
          required: [
            'detectedPatterns',
            'evidenceKeywords',
            'misconceptionTags',
            'primaryCoaching',
            'confidence',
            'confidenceBand',
            'reasoningQuality'
          ]
        }
      }
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText) as ReasoningAnalysis;
    
    console.log('%c[Gemini API] Success! Response received from live model:', 'color: #10B981; font-weight: bold;', data);

    // Ensure option tags are preserved if they are present in the chosen option
    if (chosenOpt?.misconceptionTag && !data.misconceptionTags.includes(chosenOpt.misconceptionTag)) {
      data.misconceptionTags.push(chosenOpt.misconceptionTag);
    }
    
    return data;
  } catch (error) {
    console.error('[AI] Gemini API failed, falling back to rule-based analysis:', error);
    return analyzeReasoningSync(reasoning, optionId, node, readingLevel);
  }
}

function simplifyText(text: string): string {
  // Take first 2 sentences for below-level readers
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(' ');
}

// ─── Reasoning scaffold hint system ───

export interface ScaffoldHint {
  question: string;
  nudgeLevel: 'gentle' | 'deeper';
}

type HintSet = Record<ReadingLevel, string>;

const scaffoldHintBank: Record<string, { gentle: HintSet; deeper: HintSet }> = {
  'VS.3-location': {
    gentle: {
      below: 'Think about: how will ships bring food to you? What is the water like near your spot?',
      on: 'Consider how supply ships will reach you — and what dangers might be hidden near your chosen location.',
      above: 'Consider the logistical tension between defensibility and resupply access — what does your settlement depend on to survive the first winter?',
    },
    deeper: {
      below: 'What bad things could happen if your land is swampy or the water is salty?',
      on: 'What would happen if the water near your settlement is salty or breeds disease? Does your reasoning account for that?',
      above: 'How does your reasoning weigh water quality, disease risk, and resupply logistics against the defensive advantages you have in mind?',
    },
  },
  'VS.3-powhatan': {
    gentle: {
      below: 'Who already knows how to find food here — you or the Powhatan people?',
      on: 'Think about who has lived here for thousands of years and knows how to grow food in Virginia.',
      above: 'Consider what the Powhatan already know about Virginia\'s soil, seasons, and resources — and what your approach signals to them about your intentions.',
    },
    deeper: {
      below: 'How do you think the Powhatan would feel about your choice?',
      on: 'How might the Powhatan respond to your approach? What would they gain or lose?',
      above: 'How does your approach affect the balance of power and trust between the colonists and the Powhatan Confederacy — and what precedent does it set?',
    },
  },
  'VS.3-food-strategy': {
    gentle: {
      below: 'Ships can take a very long time to cross the ocean. What if they are late?',
      on: 'Ships can take months to cross the Atlantic — and storms or wars can delay them. What is your backup plan?',
      above: 'Given that transatlantic supply chains were deeply unreliable in 1607, what does your strategy assume about England\'s ability to provision the colony?',
    },
    deeper: {
      below: 'Who has been farming this land for a long time? What do they know that you do not?',
      on: 'What farming methods have already worked in Virginia\'s climate for thousands of years — and why might they work better than English methods?',
      above: 'The Powhatan "Three Sisters" polyculture had been optimized for the Chesapeake environment for centuries — how does your reasoning weigh Indigenous agricultural knowledge against English tradition?',
    },
  },
  'VS.3-governance': {
    gentle: {
      below: 'People in England are very far away. Can they really know what your colony needs?',
      on: 'Think about: can someone 3,000 miles away really understand what your colony needs day to day?',
      above: 'Consider the information problem of distant authority — what can the Virginia Company actually know about Jamestown\'s conditions from across the Atlantic?',
    },
    deeper: {
      below: 'What happens when the rules from home do not match what you need here?',
      on: 'What happens to the colony when the rules written in England do not fit the problems you actually face in Virginia?',
      above: 'How does your governance choice balance efficiency with local knowledge? What are the risks of each model when unexpected crises emerge?',
    },
  },
  'VS.4-location': {
    gentle: {
      below: 'What will the Powhatan people think if settlers move onto their farms?',
      on: 'Consider: how would the Powhatan react if settlers move onto land their families have farmed for generations?',
      above: 'Consider how the Powhatan Confederacy would interpret each expansion approach in terms of territorial sovereignty and existing land rights.',
    },
    deeper: {
      below: 'What happens when two groups want to use the same land?',
      on: 'What happens to diplomacy and trade when settlers and Powhatan farmers compete for the same fertile land?',
      above: 'How does your expansion strategy affect the long-term relationship between colony and confederacy — and what does early Virginia history tell us about the consequences of each model?',
    },
  },
  'VS.4-economy': {
    gentle: {
      below: 'What if your one crop fails or nobody wants to buy it?',
      on: 'What happens to a colony that grows only one crop if prices drop, weather turns, or the harvest fails?',
      above: 'Consider the systemic risks of monoculture dependency — how does tobacco specialization create both economic opportunity and structural vulnerability?',
    },
    deeper: {
      below: 'Can you feed everyone in the colony with just tobacco?',
      on: 'How does depending entirely on one cash crop affect the colony\'s ability to feed itself during a bad year?',
      above: 'How does your economic model balance short-term revenue against long-term resilience? What would Virginia\'s tobacco economy look like during a price collapse or crop failure?',
    },
  },
  'VS.4-labor': {
    gentle: {
      below: 'What choices do the workers themselves have? Who benefits and who does not?',
      on: 'Think about what options the workers themselves have in each system. Who benefits, and who is harmed?',
      above: 'Consider the agency, legal status, and long-term prospects of workers under each system — and what each model implies for the structure of Virginia society.',
    },
    deeper: {
      below: 'What does each labor system mean for Virginia in the future — for everyone?',
      on: 'What are the long-term consequences for Virginia\'s society and economy of committing to this labor system?',
      above: 'How does your labor choice reflect and entrench power structures? What social hierarchies does each system create, and how do they compound across generations?',
    },
  },
  'VS.4-governance': {
    gentle: {
      below: 'Who gets to help make rules? Who is left out?',
      on: 'Who gets a say in decisions — and who gets left out — under each option you are considering?',
      above: 'Consider the distribution of political power and whose interests each governance model actually protects. Who is systematically excluded, and what does that mean for representation?',
    },
    deeper: {
      below: 'How do the rules change who gets to keep their wealth and land?',
      on: 'How does your governance model shape who controls Virginia\'s wealth, land, and laws over time?',
      above: 'How does your chosen governance structure reinforce or challenge the existing power of the planter class? What does democratic participation mean when property ownership gates the vote?',
    },
  },
};

export function getScaffoldHint(
  reasoning: string,
  nodeId: string,
  standard: StandardFocus,
  readingLevel: ReadingLevel,
): ScaffoldHint | null {
  const wordCount = reasoning.trim().split(/\s+/).filter(Boolean).length;
  console.log('[getScaffoldHint] called with:', { nodeId, standard, readingLevel, wordCount });
  if (wordCount === 0) return null;

  const lower = reasoning.toLowerCase();
  const hasConnector = /\b(because|since|therefore|however|but|although|which means|this means|so that)\b/.test(lower);

  // Deep enough reasoning — no nudge needed
  if (wordCount >= 15 && hasConnector) return null;

  const key = `${standard}-${nodeId}`;
  console.log('[getScaffoldHint] looking up key:', key);
  const hints = scaffoldHintBank[key];
  if (!hints) {
    console.log('[getScaffoldHint] NO HINTS FOUND for key:', key);
    return null;
  }

  const nudgeLevel = wordCount < 8 ? 'gentle' : 'deeper';
  const question = hints[nudgeLevel][readingLevel];
  console.log('[getScaffoldHint] found hint:', { nudgeLevel, question });
  return { question, nudgeLevel };
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
        const analysis = analyzeReasoningSync(d.reasoning, d.optionId, node!, 'on');
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
