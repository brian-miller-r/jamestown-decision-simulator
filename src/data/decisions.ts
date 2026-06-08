import type { DecisionNode, StandardFocus } from './types';

// ─── VS.3: FIRST PERMANENT SETTLEMENT (1607 Jamestown founding) ───

const vs3Decisions: DecisionNode[] = [
  {
    id: 'location',
    order: 1,
    title: 'Choosing a Settlement Location',
    historicalContext:
      'In May 1607, 104 English settlers arrived at the Chesapeake Bay aboard three small ships. After months at sea, they needed to find a place to build their new home. The land they saw was not empty — many Powhatan people already lived there.',
    prompt: 'Where should the settlers build their town?',
    options: [
      {
        id: 'inland-river',
        shortText: 'Up the river, deep inland',
        text: 'Move far up the James River into the forest, away from the coast and ships.',
        scores: { survival: 5, economy: 10, diplomacy: -15, governance: 5 },
        misconceptionTag: 'inland-safety',
        coachingCorrect: 'Smart thinking about fresh water! But being far from ships makes trade and escape very hard. The settlers did pick an inland spot — but it turned out to be swampy and deadly.',
        coachingMisconception: 'Being far inland felt safe, but it actually meant no quick escape by ship, swampy water, and more disease. The real Jamestown site had this exact problem!',
      },
      {
        id: 'coastal-port',
        shortText: 'On the coast near the bay',
        text: 'Build right on the Chesapeake Bay coast where ships can easily reach you.',
        scores: { survival: 25, economy: 30, diplomacy: -5, governance: 20 },
        coachingCorrect: 'Good choice! A coastal spot means ships can bring supplies. But watch out — the coast is also exposed to Spanish ships and storms.',
        coachingMisconception: 'The coast is easy for ships, but it also means enemies can see you from the sea. And there may not be fresh water nearby.',
      },
      {
        id: 'peninsula-river',
        shortText: 'A peninsula up the river',
        text: 'Pick a peninsula up the James River — surrounded by water on three sides for defense, but still reachable by ship.',
        scores: { survival: 35, economy: 20, diplomacy: -10, governance: 30 },
        coachingCorrect: 'This is exactly what the settlers chose! A peninsula gave defense and ship access. But the narrow river crossing also made it hard to farm or trade with the Powhatan.',
        coachingMisconception: 'The peninsula seemed perfect for defense, but the swampy land caused disease and the river water was salty and unsafe to drink.',
      },
    ],
  },
  {
    id: 'powhatan',
    order: 2,
    title: 'Meeting the Powhatan',
    historicalContext:
      'The Powhatan people had lived on this land for thousands of years. They grew corn, beans, and squash, and fished the rivers. Their chief, Powhatan, ruled over 30 tribes. The English arrived with different ideas about land and ownership.',
    prompt: 'How should the settlers deal with the Powhatan people?',
    options: [
      {
        id: 'force-demand',
        shortText: 'Demand what we need',
        text: 'The English crown claims this land. Demand food and supplies from the Powhatan — show them we are in charge.',
        scores: { survival: 5, economy: -5, diplomacy: -30, governance: -10 },
        misconceptionTag: 'colonial-entitlement',
        coachingCorrect: 'This is a dangerous path. Demanding supplies makes enemies, not friends. When the settlers actually did this, it led to attacks and the "Starving Time."',
        coachingMisconception: 'Having guns and ships does not mean you are safe. The Powhatan knew the land, controlled the food, and outnumbered the settlers by a lot.',
      },
      {
        id: 'trade-negotiate',
        shortText: 'Trade and negotiate',
        text: 'Offer English tools and copper in exchange for food. Learn from the Powhatan about local farming and fishing.',
        scores: { survival: 25, economy: 20, diplomacy: 30, governance: 10 },
        coachingCorrect: 'Excellent choice! John Smith actually did this — trading copper and tools for corn. This is how the colony survived its first winter.',
        coachingMisconception: 'Trade only works if both sides trust each other. If you take more than you give, the Powhatan will stop trading.',
      },
      {
        id: 'avoid-minimize',
        shortText: 'Avoid contact for now',
        text: 'Stay inside the fort, build our own farms, and try not to deal with the Powhatan until we are stronger.',
        scores: { survival: -10, economy: -15, diplomacy: -15, governance: 5 },
        misconceptionTag: 'isolation-myth',
        coachingCorrect: 'Avoiding the Powhatan means missing out on food and knowledge. The settlers who tried this nearly starved — they did not know how to farm this new land.',
        coachingMisconception: 'Staying in the fort felt safe, but the settlers had no farming skills for Virginia soil, and their supplies ran out fast. They needed Powhatan help.',
      },
    ],
  },
  {
    id: 'food-strategy',
    order: 3,
    title: 'Food and Crop Strategy',
    historicalContext:
      'By late 1607, the settlers were running out of food from England. Most were not farmers — they were gentlemen, soldiers, and craftsmen. Virginia soil and seasons were different from England. The Powhatan grew the "Three Sisters": corn, beans, and squash together.',
    prompt: 'What should the settlers do about food?',
    options: [
      {
        id: 'wait-supply-ship',
        shortText: 'Wait for ships from England',
        text: 'Ration what we have and wait for the next supply ship from England. We cannot farm this unfamiliar land.',
        scores: { survival: -20, economy: -10, diplomacy: -5, governance: -15 },
        misconceptionTag: 'supply-dependence',
        coachingCorrect: 'Waiting for ships was a real plan — but ships were delayed, lost, or wrecked. The "Starving Time" of 1609 happened precisely because ships did not come.',
        coachingMisconception: 'Supply ships were unreliable. A storm or war in Europe could delay them for months. Colonies that depended on supply ships often starved.',
      },
      {
        id: 'english-crops',
        shortText: 'Plant English crops',
        text: 'Clear land and plant wheat, barley, and peas just like in England. We know how to grow these.',
        scores: { survival: 10, economy: 15, diplomacy: -5, governance: 10 },
        coachingCorrect: 'English crops did grow — but poorly. Virginia hot summers and poor soil meant small harvests. Blending English and Powhatan methods worked best.',
        coachingMisconception: 'English crops were not adapted to Virginia climate. Wheat and barley produced much less here than in England. The soil was also exhausted quickly.',
      },
      {
        id: 'three-sisters',
        shortText: 'Learn the Three Sisters method',
        text: 'Ask the Powhatan to teach us the Three Sisters — planting corn, beans, and squash together. Adapt to this land.',
        scores: { survival: 30, economy: 25, diplomacy: 15, governance: 15 },
        coachingCorrect: 'Brilliant! The Three Sisters method is genius: corn supports beans, squash shades the soil, and beans add nutrients. This is still used today!',
        coachingMisconception: 'The Powhatan had farmed this land for centuries. Their method produced far more food per acre than English crops. Learning from them was smart, not weak.',
      },
    ],
  },
  {
    id: 'governance',
    order: 4,
    title: 'Leadership and Government',
    historicalContext:
      'The early colony nearly fell apart. Gentlemen refused to work, supplies were hoarded, and arguments broke out. The Virginia Company back in England appointed leaders, but many were unpopular. By 1608, John Smith forced everyone to work: "He who does not work, shall not eat."',
    prompt: 'How should the colony be governed?',
    options: [
      {
        id: 'company-rules',
        shortText: 'Follow the Virginia Company rules',
        text: 'The Virginia Company appointed our leaders and wrote our laws. We must obey them — they own this colony.',
        scores: { survival: 5, economy: 10, diplomacy: -10, governance: -5 },
        misconceptionTag: 'distant-authority',
        coachingCorrect: 'The Virginia Company did send rules, but they often did not fit real life in Jamestown. Following orders from people 3,000 miles away who had never been there was a real problem.',
        coachingMisconception: 'Rules from England often did not make sense in Virginia. The Company cared about profit, not survival. Colonists needed rules that fit their real situation.',
      },
      {
        id: 'strong-leader',
        shortText: 'Let a strong leader take charge',
        text: 'One person should make decisions quickly — like John Smith did. In a crisis, democracy is too slow.',
        scores: { survival: 25, economy: 15, diplomacy: 5, governance: 25 },
        coachingCorrect: 'John Smith saved the colony this way! His "work or starve" rule got results. But when he left, the colony collapsed again — one strong leader is fragile.',
        coachingMisconception: 'A strong leader works in a crisis, but what happens when that leader leaves? The colony fell apart after Smith returned to England.',
      },
      {
        id: 'self-govern',
        shortText: 'Governing ourselves together',
        text: 'Create our own assembly where every adult male can vote on rules and leaders. We know what we need better than anyone in England.',
        scores: { survival: 20, economy: 20, diplomacy: 10, governance: 35 },
        coachingCorrect: 'This is exactly what happened in 1619! The House of Burgesses was the first representative government in the English colonies — a huge step for democracy in America.',
        coachingMisconception: 'Self-government sounds risky, but the colonists knew their own needs best. The House of Burgesses proved that people can govern themselves — even in a tiny colony.',
      },
    ],
  },
];

// ─── VS.4: COLONIAL VIRGINIA (broader colonial period, later developments) ───

const vs4Decisions: DecisionNode[] = [
  {
    id: 'location',
    order: 1,
    title: 'Expanding Colonial Settlement',
    historicalContext:
      'By the 1620s, Virginia was growing. The Powhatan Confederacy was powerful but facing pressure. English colonists wanted to expand beyond the original settlement. Should they push inland, spread along the coast, or carefully negotiate borders with the Powhatan?',
    prompt: 'How should colonial Virginia expand?',
    options: [
      {
        id: 'rapid-inland',
        shortText: 'Expand rapidly inland',
        text: 'Push aggressively into Powhatan territory to establish new plantations and farms. More land means more wealth.',
        scores: { survival: 10, economy: 25, diplomacy: -40, governance: 5 },
        misconceptionTag: 'expansion-entitlement',
        coachingCorrect: 'Rapid expansion was tempting, but it directly caused the 1622 Powhatan uprising where hundreds of colonists died. Aggressive land-taking destroyed the fragile peace.',
        coachingMisconception: 'Land seizure seemed profitable short-term, but triggered devastating warfare. The colonists who survived were those who negotiated carefully.',
      },
      {
        id: 'negotiate-borders',
        shortText: 'Negotiate clear borders',
        text: 'Work with Powhatan leaders to agree on colonial territory. Respect their lands and trade instead of fight.',
        scores: { survival: 35, economy: 20, diplomacy: 35, governance: 20 },
        coachingCorrect: 'This was the path chosen under better leaders. Negotiated borders gave colonists room to grow while maintaining peace — until aggressive expansion resumed later.',
        coachingMisconception: 'Negotiation seemed weak to some colonists, but it allowed both cultures to coexist and trade. Peace was more profitable than warfare.',
      },
      {
        id: 'coastal-trading-posts',
        shortText: 'Establish coastal trading posts',
        text: 'Build small trading stations along the coast to trade with Powhatan, not conquer their land.',
        scores: { survival: 25, economy: 30, diplomacy: 20, governance: 15 },
        coachingCorrect: 'Trading posts created wealth without warfare. But colonists were often impatient and pushed for more land, breaking the peace agreements.',
        coachingMisconception: 'Trading seemed less profitable than plantations, but it was more reliable and didn\'t create enemies who could destroy the colony overnight.',
      },
    ],
  },
  {
    id: 'economy',
    order: 2,
    title: 'Economic Development Strategy',
    historicalContext:
      'By the 1610s-1620s, Virginia faced a question: what would make the colony profitable for investors? The Virginia Company needed returns. Tobacco emerged as a cash crop. But should colonists focus on tobacco exports, food self-sufficiency, or trade goods like timber and furs?',
    prompt: 'What should drive the colonial economy?',
    options: [
      {
        id: 'tobacco-plantation',
        shortText: 'Tobacco plantations (cash crop)',
        text: 'Grow tobacco for export to Europe. It is profitable and investors love it. Land and enslaved labor will make us rich.',
        scores: { survival: 15, economy: 40, diplomacy: -10, governance: -5 },
        coachingCorrect: 'Tobacco made colonists rich — but it also led to massive demand for labor, which drove the slave trade. This choice shaped all of future America.',
        coachingMisconception: 'Tobacco was wildly profitable, but it depended on slave labor and made colonists ignore food security. When harvests failed, they starved.',
      },
      {
        id: 'diverse-exports',
        shortText: 'Diverse exports (timber, furs, etc.)',
        text: 'Export timber, furs, and naval supplies alongside some tobacco. Diversification is safer than betting on one crop.',
        scores: { survival: 30, economy: 25, diplomacy: 15, governance: 20 },
        coachingCorrect: 'Diversification was sensible but less profitable than tobacco. Many colonists abandoned it for tobacco\'s quick wealth — a short-term choice with long-term consequences.',
        coachingMisconception: 'Diverse exports seemed boring compared to tobacco fortunes. But colonies that kept diversity were more resilient when prices crashed.',
      },
      {
        id: 'self-sufficient-farming',
        shortText: 'Self-sufficient local farming',
        text: 'Focus on feeding ourselves — corn, beans, squash, local livestock. Export only surplus. Security over wealth.',
        scores: { survival: 40, economy: 10, diplomacy: 20, governance: 30 },
        coachingCorrect: 'Self-sufficiency was smart and prevented starvation. But it made the Virginia Company angry — they invested expecting profits, not survival.',
        coachingMisconception: 'Steady farming seemed boring and unprofitable. But colonies with food security survived economic crashes; those dependent on single crops did not.',
      },
    ],
  },
  {
    id: 'labor',
    order: 3,
    title: 'Labor and Society Structure',
    historicalContext:
      'As Virginia grew in the 1620s-1640s, colonists needed workers for plantations. Some arrived as indentured servants from England. But who would work the land? Should colonists rely on indentured servants, try to enslave Native Americans, or develop a permanent enslaved African population?',
    prompt: 'How should Virginia get labor for plantations?',
    options: [
      {
        id: 'indentured-servants',
        shortText: 'Indentured servants from England',
        text: 'Bring English men and women as indentured servants. They work for 5-7 years, then are freed with land grants.',
        scores: { survival: 25, economy: 20, diplomacy: 10, governance: 25 },
        coachingCorrect: 'This was Virginia\'s main strategy early on. It worked but created a problem: freed servants wanted land, but there wasn\'t enough. This led to Bacon\'s Rebellion in 1676.',
        coachingMisconception: 'Indentured servitude seemed temporary and fair. But freed servants with nothing created a restless underclass of poor colonists angry at the wealthy planters.',
      },
      {
        id: 'native-american-slavery',
        shortText: 'Enslave Native Americans',
        text: 'Force Powhatan people and other Native Americans to work the plantations. They know the land and can be forced to labor.',
        scores: { survival: 5, economy: 15, diplomacy: -50, governance: -20 },
        misconceptionTag: 'native-slavery-myth',
        coachingCorrect: 'Some colonists tried this, but it backfired. Native Americans resisted, escaped, or died from European diseases. The Powhatan fought back with the 1622 uprising.',
        coachingMisconception: 'Enslaving the Powhatan seemed logical, but they outnumbered the colonists, knew the land, and rebelled fiercely. This strategy created enemies, not workers.',
      },
      {
        id: 'african-slavery',
        shortText: 'Import enslaved Africans',
        text: 'Bring enslaved Africans from Africa via slave traders. They can work forever — no freedom dues, no land grants.',
        scores: { survival: 20, economy: 35, diplomacy: -5, governance: -10 },
        misconceptionTag: 'slavery-inevitability',
        coachingCorrect: 'This tragic choice was made in the 1640s-1660s. It made Virginia very wealthy but created a racial slave system that lasted until 1865 and shaped American inequality forever.',
        coachingMisconception: 'Slavery seemed like just another labor system. It became the foundation of American racism and the worst atrocity in U.S. history.',
      },
    ],
  },
  {
    id: 'governance',
    order: 4,
    title: 'Colonial Government and Rights',
    historicalContext:
      'By the 1630s-1640s, Virginia had a House of Burgesses (colonial assembly), but power was held by wealthy planters. Poor colonists, women, and enslaved people had no voice. How should colonial government develop? More democracy for colonists, or maintain planter control?',
    prompt: 'How should power be distributed in Virginia?',
    options: [
      {
        id: 'planter-oligarchy',
        shortText: 'Wealthy planters rule',
        text: 'Keep power in the hands of wealthy tobacco planters. They have invested the most and deserve to lead. Democracy is inefficient.',
        scores: { survival: 15, economy: 30, diplomacy: 5, governance: 10 },
        misconceptionTag: 'oligarchy-stability',
        coachingCorrect: 'Planter rule made Virginia wealthy but created deep inequality. Poor colonists and enslaved people had zero representation. This system lasted until the Civil War.',
        coachingMisconception: 'Planter oligarchy seemed stable and efficient. But it bred resentment (Bacon\'s Rebellion 1676) and eventually led to slavery-based oppression.',
      },
      {
        id: 'property-based-voting',
        shortText: 'Property owners vote',
        text: 'All men with property can vote and hold office. This protects colonial interests while allowing some participation.',
        scores: { survival: 28, economy: 25, diplomacy: 10, governance: 28 },
        coachingCorrect: 'This was a compromise that allowed some democracy for the propertied. But it excluded servants, enslaved people, and women — most of the population had no rights.',
        coachingMisconception: 'Property-based voting seemed fair — everyone with "skin in the game" has a say. But it concentrated power and excluded the poor and enslaved.',
      },
      {
        id: 'broader-democracy',
        shortText: 'Broader male participation',
        text: 'Let all free men vote, not just the wealthy. This spreads power and loyalty across more colonists.',
        scores: { survival: 32, economy: 15, diplomacy: 15, governance: 35 },
        coachingCorrect: 'Broader democracy would have reduced inequality and prevented Bacon\'s Rebellion. But wealthy planters resisted it — they preferred concentrating power and wealth.',
        coachingMisconception: 'Broader democracy seemed dangerous to the wealthy. But it might have prevented the cycle of rebellion and oppression that defined colonial Virginia.',
      },
    ],
  },
];

export const misconceptionMeta: Record<string, { label: string; description: string; reteachAction: string }> = {
  'inland-safety': {
    label: 'Inland = Safe',
    description: 'Believes moving inland automatically means safety, ignoring supply lines and water quality.',
    reteachAction: 'Map activity: trace supply routes from ships to inland forts. Discuss what happens when routes are cut.',
  },
  'colonial-entitlement': {
    label: 'Might Makes Right',
    description: 'Assumes English weapons/authority automatically command cooperation, ignoring Powhatan power.',
    reteachAction: 'Primary source analysis: read accounts of the 1622 uprising. Discuss why force failed as a strategy.',
  },
  'isolation-myth': {
    label: 'Avoidance = Safety',
    description: 'Thinks isolation from the Powhatan keeps the colony safe, unaware of dependence on local knowledge.',
    reteachAction: 'Survival simulation: give students a list of needs (food, water, shelter) and trace which require Powhatan knowledge.',
  },
  'supply-dependence': {
    label: 'Supply Ship Dependence',
    description: 'Believes waiting for English ships is a reliable strategy, not understanding ocean crossing risks.',
    reteachAction: 'Timeline exercise: map actual ship arrival dates vs. expected dates. Calculate gap months and discuss impact.',
  },
  'distant-authority': {
    label: 'Distant Authority Trust',
    description: 'Assumes Virginia Company rules will fit local conditions, not understanding the distance problem.',
    reteachAction: 'Role-play: students in England write rules for colonists without knowing local conditions. Then swap and discuss gaps.',
  },
  'expansion-entitlement': {
    label: 'Colonial Expansion Entitlement',
    description: 'Believes colonists have the right to seize Native American land for profit without consequences.',
    reteachAction: 'Read primary sources from the 1622 uprising. Map the timeline of land seizures that triggered it.',
  },
  'native-slavery-myth': {
    label: 'Native Americans as Labor Source',
    description: 'Mistakenly believes Native Americans could be enslaved like Africans, ignoring their resistance and disease.',
    reteachAction: 'Compare labor systems: indentured servitude, Native American enslavement attempts, and African slavery. Why did each emerge or fail?',
  },
  'slavery-inevitability': {
    label: 'Slavery as Inevitable',
    description: 'Assumes slavery was always the obvious choice, not understanding it was a deliberate choice made in the 1600s.',
    reteachAction: 'Historical decision point: in 1640, Virginia had multiple labor options. Trace how slavery became the choice and its consequences.',
  },
  'oligarchy-stability': {
    label: 'Oligarchy as Stable',
    description: 'Believes concentrated planter power was stable and efficient, ignoring inequality and rebellion.',
    reteachAction: 'Bacon\'s Rebellion analysis: what grievances led poor colonists to rebel? What would have changed if they had power?',
  },
};

// ─── Export decision nodes by standard ───

export function getDecisionNodes(standard: StandardFocus): DecisionNode[] {
  return standard === 'VS.3' ? vs3Decisions : vs4Decisions;
}

export const allDecisionNodes = [...vs3Decisions, ...vs4Decisions];
