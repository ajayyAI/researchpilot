import { getEncoding } from "js-tiktoken";

/**
 * Text utilities for the research engine.
 * Handles prompt trimming and text splitting for context window management.
 */

const MIN_CHUNK_SIZE = 140;
const encoder = getEncoding("o200k_base");

/**
 * Recursive text splitter that preserves semantic boundaries.
 * Prioritizes splitting on paragraphs, then sentences, then words.
 */
class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: { chunkSize: number; chunkOverlap?: number }) {
    this.chunkSize = options.chunkSize;
    this.chunkOverlap = options.chunkOverlap ?? 0;
    this.separators = ["\n\n", "\n", ".", ",", ">", "<", " ", ""];

    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error("Cannot have chunkOverlap >= chunkSize");
    }
  }

  splitText(text: string): string[] {
    const finalChunks: string[] = [];

    // Find the appropriate separator
    let separator = this.separators[this.separators.length - 1] ?? "";
    for (const s of this.separators) {
      if (s === "" || text.includes(s)) {
        separator = s;
        break;
      }
    }

    // Split the text
    const splits = separator ? text.split(separator) : text.split("");

    // Merge splits into chunks
    const goodSplits: string[] = [];
    for (const s of splits) {
      if (s.length < this.chunkSize) {
        goodSplits.push(s);
      } else {
        if (goodSplits.length > 0) {
          const merged = this.mergeSplits(goodSplits, separator);
          finalChunks.push(...merged);
          goodSplits.length = 0;
        }
        // Recursively split longer texts
        const subChunks = this.splitText(s);
        finalChunks.push(...subChunks);
      }
    }

    if (goodSplits.length > 0) {
      const merged = this.mergeSplits(goodSplits, separator);
      finalChunks.push(...merged);
    }

    return finalChunks;
  }

  private mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    const currentDoc: string[] = [];
    let total = 0;

    for (const d of splits) {
      const len = d.length;

      if (total + len >= this.chunkSize) {
        if (currentDoc.length > 0) {
          const doc = currentDoc.join(separator).trim();
          if (doc) docs.push(doc);

          // Handle overlap
          while (
            total > this.chunkOverlap ||
            (total + len > this.chunkSize && total > 0)
          ) {
            total -= currentDoc[0]?.length ?? 0;
            currentDoc.shift();
          }
        }
      }

      currentDoc.push(d);
      total += len;
    }

    const doc = currentDoc.join(separator).trim();
    if (doc) docs.push(doc);

    return docs;
  }
}

/**
 * Trim a prompt to fit within the model's context window.
 * Uses token counting and intelligent text splitting.
 *
 * @param prompt - The text to trim
 * @param contextSize - Maximum context size in tokens (default: 128,000)
 * @returns The trimmed prompt
 */
export function trimPrompt(
  prompt: string,
  contextSize = Number(process.env.CONTEXT_SIZE) || 128_000,
): string {
  if (!prompt) return "";

  const length = encoder.encode(prompt).length;
  if (length <= contextSize) {
    return prompt;
  }

  const overflowTokens = length - contextSize;
  // Estimate ~3 characters per token
  const chunkSize = prompt.length - overflowTokens * 3;

  if (chunkSize < MIN_CHUNK_SIZE) {
    return prompt.slice(0, MIN_CHUNK_SIZE);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 0,
  });

  const trimmedPrompt = splitter.splitText(prompt)[0] ?? "";

  // Handle edge case where trimmed is same length as original
  if (trimmedPrompt.length === prompt.length) {
    return trimPrompt(prompt.slice(0, chunkSize), contextSize);
  }

  // Recursively trim until within context size
  return trimPrompt(trimmedPrompt, contextSize);
}

/**
 * Count tokens in a string using the o200k_base tokenizer.
 */
export function countTokens(text: string): number {
  return encoder.encode(text).length;
}
