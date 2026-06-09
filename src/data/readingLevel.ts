import type { ReadingLevel } from './types';

export interface ReadingLevelMetrics {
  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  averageWordLength: number;
  fleschKincaidGrade: number;
  complexWordRatio: number;
}

export interface ReadingLevelSuggestion {
  suggestedLevel: ReadingLevel;
  estimatedGrade: number;
  confidence: 'low' | 'medium' | 'high';
  rationale: string[];
  metrics: ReadingLevelMetrics;
}

export async function extractTextFromUpload(file: File): Promise<string> {
  const extension = getFileExtension(file.name);

  if (extension === 'txt') {
    return normalizeText(await file.text());
  }

  if (extension === 'docx') {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return normalizeText(value);
  }

  if (extension === 'pdf') {
    return normalizeText(await extractTextFromPdf(await file.arrayBuffer()));
  }

  throw new Error('Unsupported file type. Please use .txt, .docx, or .pdf.');
}

export function suggestReadingLevelFromWriting(input: string): ReadingLevelSuggestion {
  const text = normalizeText(input);
  const words = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const sentences = text
    .split(/[.!?]+/)
    .map(part => part.trim())
    .filter(Boolean);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const charCount = words.reduce((sum, word) => sum + word.length, 0);
  const complexWords = words.filter(word => countSyllables(word) >= 3).length;

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const averageSentenceLength = wordCount / sentenceCount;
  const averageWordLength = wordCount > 0 ? charCount / wordCount : 0;
  const complexWordRatio = wordCount > 0 ? complexWords / wordCount : 0;
  const fleschKincaidGrade =
    wordCount > 0
      ? 0.39 * averageSentenceLength + 11.8 * (syllableCount / wordCount) - 15.59
      : 0;

  let estimatedGrade = fleschKincaidGrade;
  if (complexWordRatio > 0.17) estimatedGrade += 0.3;
  if (averageWordLength > 5.1) estimatedGrade += 0.3;
  if (averageSentenceLength > 14) estimatedGrade += 0.2;
  estimatedGrade = clamp(estimatedGrade, 1.5, 9);

  const suggestedLevel = mapGradeToReadingLevel(estimatedGrade);
  const confidence = inferConfidence(wordCount, sentenceCount);

  const rationale: string[] = [];
  rationale.push(`Estimated grade level is ${estimatedGrade.toFixed(1)} based on sentence and word complexity.`);
  rationale.push(`Average sentence length is ${averageSentenceLength.toFixed(1)} words.`);
  rationale.push(`${Math.round(complexWordRatio * 100)}% of words are multi-syllable.`);
  if (confidence === 'low') {
    rationale.push('Low confidence: short samples can be less reliable. Consider adding more writing.');
  }

  return {
    suggestedLevel,
    estimatedGrade,
    confidence,
    rationale,
    metrics: {
      wordCount,
      sentenceCount: sentences.length,
      averageSentenceLength,
      averageWordLength,
      fleschKincaidGrade,
      complexWordRatio,
    },
  };
}

function mapGradeToReadingLevel(grade: number): ReadingLevel {
  if (grade < 3.8) return 'below';
  if (grade <= 5.3) return 'on';
  return 'above';
}

function inferConfidence(wordCount: number, sentenceCount: number): 'low' | 'medium' | 'high' {
  if (wordCount < 45 || sentenceCount < 3) return 'low';
  if (wordCount < 100) return 'medium';
  return 'high';
}

async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDocument = await loadingTask.promise;

  const pageText: string[] = [];
  for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex += 1) {
    const page = await pdfDocument.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const joined = textContent.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();
    if (joined) pageText.push(joined);
  }

  return pageText.join('\n');
}

function normalizeText(value: string): string {
  return value
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  const withoutTrailing = cleaned.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/u, '').replace(/^y/u, '');
  const groups = withoutTrailing.match(/[aeiouy]{1,2}/gu);
  return groups?.length ?? 1;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
