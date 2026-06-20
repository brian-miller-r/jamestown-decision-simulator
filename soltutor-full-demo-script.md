# SOLTutor.ai — Full Demo Script
**AI Build Challenge · Hampton Roads**
**Audience:** Judges & Evaluators | **Total time:** 7–8 minutes

---

> **Before you go on stage / start the demo:**
> - Browser open to `soltutor-5min-presentation.html` (slide 1 visible)
> - Second tab open to your app at `http://localhost:5173`
> - Third tab open to the Novus dashboard
> - `soltutor-demo-script.html` open on a second screen or printed — your copy-paste responses are there
> - Have your Gemini API key already saved in Settings so AI coaching fires live

---

## PART 1 — THE SLIDES
*~3 minutes · Navigate with arrow keys or spacebar*

---

### Slide 1 — Title / Hero

> "Hi, I'm Brian. I want to show you something I built in a week — and I want to be honest with you about how I built it and why."

→ **Advance to slide 2**

---

### Slide 2 — The Problem Is Personal

> "This problem is personal for me. I have two boys — one in elementary school, one in middle school. Every night I watch them either battle through worksheets or reach for ChatGPT as a shortcut. There wasn't a tool that did all three things at once: build SOL content mastery, make AI feel like a thinking partner rather than a cheat tool, and give teachers the data they need to act on it. So I built one."

→ **Advance to slide 3**

---

### Slide 3 — How I Built It

> "Here's what the week looked like. I used multiple AI agents running in parallel as pair programmers — Antigravity IDE, Gemini, Claude, and Warp ADE. When one model hit token limits, I switched environments and kept shipping. I started in Bolt, moved to Warp and Antigravity because build quality was better. And Gemini Flash's free tier meant I could have live AI coaching in the app at essentially zero prototype cost."

> "One week ago, this was an idea. Now it's a working pilot where students make real decisions, explain their thinking, and get real-time AI coaching."

→ **Advance to slide 4**

---

### Slide 4 — Why Now: The Data

> "The urgency is real. Only 31% of fourth graders scored proficient in reading on NAEP in 2024. 40% were below basic. At the same time, 45% of adolescents are already using AI tools every month — whether schools are ready or not. The research shows one-to-one tutoring can add 5 months of learning. The opportunity is to combine the effectiveness of targeted tutoring with the scale and engagement of AI."

→ **Advance to slide 5**

---

### Slide 5 — The Idea

> "Here's the core concept: SOLTutor.ai equals SOL mastery plus AI literacy. Students learn by making decisions, explaining their reasoning, and getting coaching on that reasoning — while teachers see exactly where support is needed, automatically. It's not just content prep. It teaches students *how to think with AI*, not just how to get answers from it."

→ **Advance to slide 6**

---

### Slide 6 — What's Already Built

> "In one week, here's what's live: a branching student simulation with four decisions tied to VS.3 Jamestown, a Socratic AI reasoning coach powered by Gemini, a teacher dashboard with misconception clustering and reteach priorities, adaptive reading level support, and — here's the one I want to highlight for this audience — a Novus analytics integration that fires behavioral events on every meaningful student action."

→ **Advance to slide 7 — the "Live Demo" slide**

> "Let me show you all of that live."

---

## PART 2 — LIVE APP DEMO
*~3.5 minutes · Switch to the app tab at `http://localhost:5173`*

---

### Step 1 — The Home Page + Novus Onboarding Guide

*You are on the platform home screen.*

> "This is the SOLTutor.ai home. It's built to be dead simple for anyone landing here — a teacher, a student, or a parent. You'll notice right away: the four tiles below cover the four product pillars. The last one — Novus Feedback Loop — is something I want to spend 30 seconds on, because it's a differentiator this audience will care about."

> "Novus is integrated directly into the app. Every time a student joins, every time they submit a decision, every time the AI coaching fires, every time the simulation completes — those are all tracked as named behavioral events in Novus. And scroll down to the bottom of this section…"

*Point to the 3-column value proposition section at the bottom of the home page:*
> "Student reasoning coach, teacher misconception intelligence, and Novus feedback loop. That third pillar means from day one, this isn't a product I'm guessing about — it's a product I can iterate on with real learner behavior data."

**Now trigger the Novus onboarding guide widget:**
> "And to show you what the Novus integration actually looks like from a product experience standpoint — this is the onboarding guide that Novus surfaces through their SDK. It walks through how the product is instrumented, what events are being tracked, and how the feedback loop works. This is live in the app right now — not mocked."

*Trigger the Novus SDK onboarding popup / product tour widget. Walk through 1–2 steps of it.*

> "Every one of those events you see in there maps to a real user action. That's what makes iteration here evidence-based instead of a guessing game."

*Close/dismiss the Novus guide.*

---

### Step 2 — Student Experience: Joining and Starting

*Click **"Try Demo Class"** on the home page.*

> "I'm going to click 'Try Demo Class' — this puts me directly into a student simulation using the demo session that's pre-seeded. In a real classroom, a student would enter a 4-character session code their teacher shares."

*The student simulation loads. You are now in StudentSimView.*

> "This is the student experience. The first decision is already on screen: choosing a settlement location for Jamestown. The student reads the scenario, picks an option, and then — and this is the critical part — they have to explain their reasoning before they can submit."

---

### Step 3 — Making a Decision + AI Coaching

*Choose an answer option (the intentional wrong one if you want the coaching moment — or choose as you go).*

> "I'm going to select an option and write a reasoning response."

*Paste or type a reasoning response. Use the **intentional wrong response** from your `soltutor-demo-script.html` for Decision 1 to trigger the coaching correction, OR the corrected response if you want to show strong feedback:*

**Option A — Wrong response (coaching correction moment):**
> "I'm going to submit an intentionally inaccurate response so you can see the AI coaching in action."
> *(paste: "We should go deep inland where nobody can find us. Being far away from the coast is safest, and then enemies cannot attack us by ship.")*

> "Notice what happens when I submit this…"

*Submit. The AI coaching response appears.*

> "It doesn't just mark it wrong. It explains the historical misconception — why going deep inland actually cut the colonists off from supply routes and trade — and it nudges the student toward stronger reasoning. That's Socratic coaching, not a quiz grade."

**Option B — Corrected response (strong reasoning feedback):**
> "Now watch what happens with a response that shows stronger historical thinking."
> *(paste: "A peninsula gives some defense because water protects three sides, and ships can still reach us with supplies. It is a better balance than hiding deep inland where supply routes are harder.")*

*Submit. The AI coaching response appears, this time affirming the reasoning.*

> "The feedback shifts. It reinforces the evidence that the student used — the natural defense of the peninsula, the supply route logic. That reinforcement is what builds reasoning habits over time."

---

### Step 4 — Teacher Dashboard

*Navigate to **Dashboard** in the sidebar.*

> "Now I'm going to switch roles to teacher view — this is what the teacher sees after any students complete the simulation."

*You are now in TeacherDashboardView, showing the demo data.*

> "Right at the top: reteach priorities, ranked by how many students triggered that misconception. This isn't a generic report — it tells the teacher exactly which concept to revisit tomorrow and even suggests a 10-minute activity structure to do it."

*Point to the Top Misconceptions panel:*
> "The misconception tags are auto-detected from the AI coaching analysis. The teacher never had to read 30 individual responses to figure this out."

*Point to the AI-Detected Patterns section:*
> "And this — AI-detected patterns. This is the dashboard pulling back and saying: here's what your class as a whole misunderstood, here's the severity level, and here's the teaching move that addresses it. All of that is generated from the reasoning responses students actually wrote."

*Point to the Student Comparison section:*
> "You can also drill into individual student pairs — see their decision paths side by side, their reasoning depth, their misconception tags. Then Novus is capturing all of that as behavioral data behind the scenes so we can track which product decisions actually improve learning outcomes over time."

---

## PART 3 — CLOSE (back to slides, optional)
*~30 seconds · Return to slide 8 or just say this live*

---

> "Here's what I want to leave you with."

> "For students: more engagement, stronger reasoning, and confidence using AI as a thinking tool — not a shortcut. For teachers: immediate, targeted insight into who needs help and exactly where. For schools: a modular engine that can expand to every Virginia SOL domain with the same core architecture."

> "And for evaluators and product people in this room: a prototype that ships with behavioral analytics built in from day one — because the feedback loop *is* part of the product."

> "This started as a problem I have as a dad. One week later, it's a working system. I'd love your feedback on where to take it next. Thank you."

---

## QUICK REFERENCE — Copy-Paste Responses

*Use these during the student sim if you want to show the coaching contrast. Full responses are in `soltutor-demo-script.html`.*

| Decision | Response Type | First words... |
|----------|--------------|----------------|
| Settlement Location | ❌ Wrong | "We should go deep inland where nobody can find us..." |
| Settlement Location | ✅ Corrected | "A peninsula gives some defense because water protects three sides..." |
| Meeting the Powhatan | ❌ Wrong | "We should demand corn because we have better weapons..." |
| Meeting the Powhatan | ✅ Corrected | "We should trade and negotiate because the Powhatan know this land..." |
| Food & Crops | ❌ Wrong | "I think we should wait for England to send ships..." |
| Food & Crops | ✅ Corrected | "The best choice is to learn the Three Sisters method..." |
| Leadership | ❌ Wrong | "We should follow the Virginia Company rules because leaders in England know better..." |
| Leadership | ✅ Corrected | "The colony should make local rules together because people living in Jamestown understand daily problems..." |

---

## RECOVERY NOTES

| If this happens… | Do this |
|-----------------|---------|
| AI coaching doesn't fire | Say: "The AI coaching is powered by Gemini — in the interest of time let me describe what the feedback looks like." Then navigate to teacher dashboard. |
| Novus widget doesn't appear | Say: "Novus is firing events in the background — I'll show you the event names in the dashboard/console." Open browser devtools console briefly. |
| App is slow to load | Say: "This is running on a local dev server — production would be faster. While it loads, let me tell you what you're about to see." |
| You run long on slides | Cut slide 4 (the data stats) and go straight from slide 3 to slide 5. The data is in the slide but you don't need to read every number. |

---

*Last updated: June 2026 · SOLTutor.ai AI Build Challenge Demo*
