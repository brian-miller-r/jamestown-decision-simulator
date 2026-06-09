import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Anchor, Brain, Lightbulb, Mic } from 'lucide-react';
import type { View, StudentDecision, Scores, ReadingLevel } from '../data/types';
import { getDecisionNodes } from '../data/decisions';
import { getSessionById, saveResult, computeScores, extractMisconceptions } from '../data/store';
import { analyzeReasoning, getScaffoldHint, type ReasoningAnalysis, type ScaffoldHint } from '../data/ai';
import ScoreBar from '../components/ScoreBar';
import Timer from '../components/Timer';

interface Props {
  sessionId: string;
  studentId: string;
  studentName: string;
  onNavigate: (v: View) => void;
}

function mergeDictationText(existing: string, transcript: string): string {
  const trimmedExisting = existing.trimEnd();
  const trimmedTranscript = transcript.trim();
  if (!trimmedTranscript) return existing;
  if (!trimmedExisting) return trimmedTranscript;

  const needsSpace = /[\s\n]$/.test(existing);
  return needsSpace ? `${existing}${trimmedTranscript}` : `${existing} ${trimmedTranscript}`;
}

function errorMessageFromSpeechCode(errorCode?: string): string {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission was denied. Allow microphone access and try again.';
    case 'audio-capture':
      return 'No microphone was detected. Check your device audio input.';
    case 'no-speech':
      return 'No speech was detected. Hold the mic button and speak clearly.';
    default:
      return 'Voice input is unavailable right now. Please try again or type your response.';
  }
}

type Phase = 'intro' | 'decide' | 'coach';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtorLike = new () => SpeechRecognitionLike;

export default function StudentSimView({ sessionId, studentId, studentName, onNavigate }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [decisions, setDecisions] = useState<StudentDecision[]>([]);
  const [runningScores, setRunningScores] = useState<Scores>({ survival: 30, economy: 30, diplomacy: 30, governance: 30 });
  const [startedAt] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<ReasoningAnalysis | null>(null);
  const [scaffoldHint, setScaffoldHint] = useState<ScaffoldHint | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationError, setDictationError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const session = getSessionById(sessionId);
  const standard = session?.standard;
  const decisionNodes = useMemo(
    () => (standard ? getDecisionNodes(standard) : []),
    [standard]
  );
  const node = decisionNodes[currentIdx];

  useEffect(() => {
    if (decisions.length > 0) {
      setRunningScores(computeScores(decisions, decisionNodes));
    }
  }, [decisions, decisionNodes]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  // Reasoning scaffold — shows a Socratic nudge while student is typing
  // Shows after 400ms once they start typing, hides when reasoning is deep enough
  useEffect(() => {
    console.log('[Scaffold Debug] effect running', {
      hasReasoning: !!reasoning.trim(),
      hasSelectedOption: !!selectedOption,
      hasNode: !!node,
      hasSession: !!session,
      reasoningText: reasoning.trim().slice(0, 30),
    });

    if (!reasoning.trim() || !selectedOption || !node || !session) {
      setScaffoldHint(null);
      return;
    }

    // Immediately dismiss if reasoning is already deep enough
    const words = reasoning.trim().split(/\s+/).filter(Boolean).length;
    const lower = reasoning.toLowerCase();
    const hasConnector = /\b(because|since|therefore|however|but|although|which means|this means|so that)\b/.test(lower);
    console.log('[Scaffold Debug] word count:', words, 'hasConnector:', hasConnector);
    if (words >= 15 && hasConnector) {
      console.log('[Scaffold Debug] deep reasoning, dismissing hint');
      setScaffoldHint(null);
      return;
    }

    // Short debounce so hint doesn't flicker on every keystroke
    const timer = setTimeout(() => {
      const hint = getScaffoldHint(reasoning, node.id, session.standard, session.readingLevel);
      console.log('[Scaffold Debug] computed hint:', hint);
      setScaffoldHint(hint);
    }, 400);

    return () => clearTimeout(timer);
  }, [reasoning, selectedOption, node, session]);

  function getOrCreateRecognition(): SpeechRecognitionLike | null {
    if (recognitionRef.current) return recognitionRef.current;

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtorLike;
      webkitSpeechRecognition?: SpeechRecognitionCtorLike;
    };
    const RecognitionCtor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!RecognitionCtor) return null;

    const recognition = new RecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcriptChunk = '';
      for (let idx = event.resultIndex; idx < event.results.length; idx += 1) {
        const result = event.results[idx];
        const transcript = result?.[0]?.transcript?.trim();
        if (!result?.isFinal || !transcript) continue;
        transcriptChunk += `${transcript} `;
      }

      const cleanChunk = transcriptChunk.trim();
      if (!cleanChunk) return;

      setReasoning(prev => mergeDictationText(prev, cleanChunk));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      setIsDictating(false);
      setDictationError(errorMessageFromSpeechCode(event.error));
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  }

  function handleDictationStart() {
    setDictationError('');
    const recognition = getOrCreateRecognition();
    if (!recognition) {
      setDictationError('Voice input is not supported on this browser.');
      return;
    }

    if (isDictating) return;

    try {
      recognition.start();
      setIsDictating(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        return;
      }
      setDictationError('Unable to start voice input. Please try again.');
      setIsDictating(false);
    }
  }

  function handleDictationStop() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // no-op
    } finally {
      setIsDictating(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-navy-800 mb-2">Session Not Found</h2>
          <p className="text-navy-600 mb-4">This session may have been removed.</p>
          <button className="btn-primary" onClick={() => onNavigate({ kind: 'home' })}>Back to Home</button>
        </div>
      </div>
    );
  }

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center mx-auto mb-6">
            <Anchor className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome, {studentName}</h1>
          <p className="text-navy-200 text-lg mb-2">The year is 1607.</p>
          <p className="text-navy-300 mb-6 leading-relaxed">
            You have just arrived in Virginia aboard three small ships.
            The land is new, the Powhatan people are watching, and your
            colony's future depends on your choices. Over the next 7 minutes,
            you will face 4 critical decisions. Think carefully — and explain
            your reasoning each time.
          </p>
          <div className="bg-navy-800 rounded-lg p-4 mb-4 text-sm text-navy-200">
            <p className="font-semibold text-amber-400 mb-1">Your colony will be scored on:</p>
            <p>Survival Readiness &middot; Colony Economy &middot; Powhatan Diplomacy &middot; Governance Stability</p>
          </div>
          <div className="bg-navy-800 rounded-lg p-3 mb-8 text-sm text-navy-300 flex items-center gap-2 justify-center">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>An AI coach will analyze your reasoning and give you personalized feedback</span>
          </div>
          <button className="btn-primary bg-amber-500 hover:bg-amber-600 text-navy-900" onClick={() => setPhase('decide')}>
            Begin the Simulation
          </button>
        </div>
      </div>
    );
  }

  // DECIDE
  if (phase === 'decide') {
    const adaptedContext = adaptForReadingLevel(node.historicalContext, session.readingLevel);
    const adaptedPrompt = adaptForReadingLevel(node.prompt, session.readingLevel);
    return (
      <div className="min-h-screen bg-navy-50">
        <header className="bg-white border-b border-navy-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-navy-400 font-semibold uppercase tracking-wide">
                Decision {currentIdx + 1} of {decisionNodes.length}
              </span>
              <h1 className="text-base font-bold text-navy-800">{node.title}</h1>
            </div>
            <Timer startedAt={startedAt} finished={finished} />
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-6">
          <div className="card mb-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Reading level: {readingLevelLabel(session.readingLevel)}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Standard: {session.standard}
              </span>
            </div>
            <p className="text-navy-600 text-sm leading-relaxed mb-4">{adaptedContext}</p>
            <h2 className="text-lg font-bold text-navy-800">{adaptedPrompt}</h2>
          </div>

          <div className="space-y-3 mb-6">
            {node.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedOption === opt.id
                    ? 'border-navy-700 bg-navy-50'
                    : 'border-navy-100 bg-white hover:border-navy-300'
                }`}
              >
                <span className="font-semibold text-navy-800">{opt.shortText}</span>
                <span className="block text-sm text-navy-500 mt-1">
                  {adaptForReadingLevel(opt.text, session.readingLevel)}
                </span>
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="card mb-6">
              <label className="block text-sm font-semibold text-navy-700 mb-2">
                Why did you choose this? (1-2 sentences)
              </label>
              <div className="relative">
                <textarea
                  value={reasoning}
                  onChange={e => {
                    setReasoning(e.target.value);
                    if (dictationError) setDictationError('');
                  }}
                  placeholder="The AI coach will analyze your reasoning — be specific about your thinking!"
                  className="w-full px-4 py-3 pr-16 pb-14 border-2 border-navy-100 rounded-lg focus:border-navy-500 focus:outline-none transition-colors resize-none"
                  rows={3}
                />
                <button
                  type="button"
                  title="Dictate"
                  onPointerDown={event => {
                    event.preventDefault();
                    handleDictationStart();
                  }}
                  onPointerUp={handleDictationStop}
                  onPointerLeave={handleDictationStop}
                  onPointerCancel={handleDictationStop}
                  onContextMenu={event => event.preventDefault()}
                  className={`group absolute bottom-3 right-3 w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
                    isDictating
                      ? 'border-amber-400 bg-amber-100 text-amber-700'
                      : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'
                  }`}
                  aria-label="Dictate"
                >
                  <Mic className="w-5 h-5" />
                  <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Dictate
                  </span>
                </button>
              </div>
              <div className="mt-2 min-h-[20px]">
                {isDictating && (
                  <p className="text-xs font-semibold text-amber-700">
                    Listening… release the mic button to stop.
                  </p>
                )}
                {!isDictating && dictationError && (
                  <p className="text-xs text-red-600">{dictationError}</p>
                )}
              </div>

              {/* Reasoning scaffold — Socratic nudge, appears while reasoning is thin */}
              {scaffoldHint && (
                <div
                  className="mt-3 flex gap-3 items-start rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 animate-fade-in"
                  aria-live="polite"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-0.5">
                      {scaffoldHint.nudgeLevel === 'gentle' ? 'Think about this' : 'Go a little deeper'}
                    </p>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      {scaffoldHint.question}
                    </p>
                  </div>
                </div>
              )}

              <button
                className="btn-primary mt-4 flex items-center gap-2"
                disabled={!reasoning.trim()}
                onClick={handleConfirm}
              >
                Confirm Decision <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // COACH — now powered by AI analysis
  if (phase === 'coach' && aiAnalysis) {
    const hasMisconception = aiAnalysis.misconceptionTags.length > 0;
    const surfaceCorrect = !aiAnalysis.detectedPatterns.length && aiAnalysis.misconceptionTags.length > 0
      ? false // option has misconception but no reasoning pattern detected
      : decisions.length > 0 && !decisions[decisions.length - 1]?.optionId
        ? false
        : (() => {
            const lastDecision = decisions[decisions.length - 1];
            if (!lastDecision) return false;
            const opt = node.options.find(o => o.id === lastDecision.optionId);
            return !opt?.misconceptionTag && aiAnalysis.detectedPatterns.length > 0;
          })();
    const confidenceBandStyle =
      aiAnalysis.confidenceBand === 'High'
        ? 'bg-emerald-100 text-emerald-700'
        : aiAnalysis.confidenceBand === 'Medium'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-red-100 text-red-700';

    return (
      <div className="min-h-screen bg-navy-50">
        <header className="bg-white border-b border-navy-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-navy-400 font-semibold uppercase tracking-wide">
                Decision {currentIdx + 1} of {decisionNodes.length}
              </span>
              <h1 className="text-base font-bold text-navy-800 flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-500" /> AI Coach Feedback
              </h1>
            </div>
            <Timer startedAt={startedAt} finished={finished} />
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {/* Primary coaching */}
          <div className={`card border-l-4 ${hasMisconception ? 'border-l-amber-400' : surfaceCorrect ? 'border-l-blue-400' : 'border-l-emerald-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wide ${
                hasMisconception ? 'text-amber-600' : surfaceCorrect ? 'text-blue-600' : 'text-emerald-600'
              }`}>
                {hasMisconception ? 'Something to Think About' : surfaceCorrect ? 'Right Choice, Deeper Thinking Needed' : 'Great Thinking!'}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceBandStyle}`}>
                AI confidence: {aiAnalysis.confidenceBand}
              </span>
            </div>
            <p className="text-navy-700 leading-relaxed">{aiAnalysis.primaryCoaching}</p>
          </div>

          {/* Explainability cues */}
          <div className="card">
            <h3 className="text-sm font-semibold text-navy-700 mb-2">AI noticed these reasoning cues</h3>
            {aiAnalysis.evidenceKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.evidenceKeywords.map(keyword => (
                  <span
                    key={keyword}
                    className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-500">
                No high-risk misconception cues detected in your wording.
              </p>
            )}
          </div>

          {/* Secondary coaching if AI found multiple patterns */}
          {aiAnalysis.secondaryCoaching && (
            <div className="card border-l-4 border-l-orange-400">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-600 block mb-2">
                One More Thing
              </span>
              <p className="text-navy-700 leading-relaxed text-sm">{aiAnalysis.secondaryCoaching}</p>
            </div>
          )}

          {/* Reasoning quality indicator */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-navy-400">Reasoning depth:</span>
            <div className="flex gap-1">
              {(['surface', 'moderate', 'deep'] as const).map(level => (
                <div
                  key={level}
                  className={`h-2 w-8 rounded-full ${
                    aiAnalysis.reasoningQuality === level
                      ? level === 'deep' ? 'bg-emerald-500' : level === 'moderate' ? 'bg-amber-500' : 'bg-red-400'
                      : 'bg-navy-100'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-navy-500 capitalize">{aiAnalysis.reasoningQuality}</span>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-navy-700 mb-3">Colony Status</h3>
            <ScoreBar scores={runningScores} />
          </div>

          <button className="btn-primary flex items-center gap-2" onClick={handleNext}>
            {currentIdx < decisionNodes.length - 1 ? (
              <>Next Decision <ArrowRight className="w-4 h-4" /></>
            ) : (
              'See Your Results'
            )}
          </button>
        </main>
      </div>
    );
  }

  return null;

  function handleConfirm() {
    handleDictationStop();
    if (!selectedOption || !reasoning.trim()) return;
    const newDecision: StudentDecision = {
      nodeId: node.id,
      optionId: selectedOption,
      reasoning: reasoning.trim(),
      timestamp: Date.now(),
    };
    const updatedDecisions = [...decisions, newDecision];
    setDecisions(updatedDecisions);

    // Run AI analysis on student reasoning
    const analysis = analyzeReasoning(reasoning.trim(), selectedOption, node, session!.readingLevel);
    setAiAnalysis(analysis);

    // Save with AI-enhanced misconception tags
    const scores = computeScores(updatedDecisions, decisionNodes);
    const optionTags = extractMisconceptions(updatedDecisions, decisionNodes);
    const aiTags = analysis.misconceptionTags;
    const mergedTags = [...new Set([...optionTags, ...aiTags])];
    saveResult({
      id: studentId,
      sessionId,
      displayName: studentName,
      standard: session!.standard,
      decisions: updatedDecisions,
      finalScores: scores,
      misconceptionTags: mergedTags,
      completedAt: 0,
    });

    setPhase('coach');
  }

  function handleNext() {
    if (currentIdx < decisionNodes.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setReasoning('');
      setAiAnalysis(null);
      setPhase('decide');
    } else {
      setFinished(true);
      const finalScores = computeScores(decisions, decisionNodes);
      const optionTags = extractMisconceptions(decisions, decisionNodes);
      // Collect AI tags from all decisions
      const aiTags = decisions.flatMap(d => {
        const n = decisionNodes.find(nd => nd.id === d.nodeId);
        if (!n) return [];
        return analyzeReasoning(d.reasoning, d.optionId, n, session!.readingLevel).misconceptionTags;
      });
      const mergedTags = [...new Set([...optionTags, ...aiTags])];
      saveResult({
        id: studentId,
        sessionId,
        displayName: studentName,
        standard: session!.standard,
        decisions,
        finalScores,
        misconceptionTags: mergedTags,
        completedAt: Date.now(),
      });
      onNavigate({ kind: 'student-debrief', sessionId, studentId });
    }
  }
}

function adaptForReadingLevel(text: string, level: ReadingLevel): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (level === 'below') {
    return sentences.slice(0, 2).join(' ');
  }

  if (level === 'above') {
    return `${text} Consider the long-term cause-and-effect impact of this choice.`;
  }

  return text;
}

function readingLevelLabel(level: ReadingLevel): string {
  if (level === 'below') return 'Below grade 4';
  if (level === 'above') return 'Above grade 4';
  return 'On grade 4';
}
