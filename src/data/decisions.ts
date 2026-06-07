import type { DecisionNode } from './types';

export const decisionNodes: DecisionNode[] = [
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
};
